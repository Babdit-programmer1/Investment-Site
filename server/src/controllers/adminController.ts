
import { Request, Response } from 'express';
// @ts-ignore
import { PrismaClient, Prisma } from '@prisma/client';
import { kycService } from '../services/kycService';
import { custodyService } from '../services/custodyService';
import { complianceService } from '../services/complianceService';
import { riskEngine } from '../services/riskEngine';
import { ledgerService } from '../services/ledgerService';
import { adminLogService } from '../services/adminLogService';
import { Money } from '../utils/money';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

// --- OVERVIEW & MONITORING ---

export const getOverview = async (req: any, res: any) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalAssets = await prisma.investment.count();
    
    // Wallets
    const investmentSum = await prisma.wallet.aggregate({ 
        where: { type: 'INVESTMENT' },
        _sum: { balance: true } 
    });
    const fiatSum = await prisma.wallet.aggregate({ 
        where: { type: 'MAIN' },
        _sum: { balance: true } 
    });
    
    // Financial Aggregations
    // Total Inflow = Approved Deposits
    const inflowAgg = await prisma.financialLedger.aggregate({
        where: { actionType: 'DEPOSIT_APPROVED', status: 'COMPLETED' },
        _sum: { amount: true }
    });
    // Total Outflow = Approved Withdrawals
    const outflowAgg = await prisma.financialLedger.aggregate({
        where: { actionType: 'WITHDRAWAL_APPROVED', status: 'COMPLETED' },
        _sum: { amount: true }
    });

    const inflow = Money.toNumber(inflowAgg._sum.amount || 0);
    const outflow = Money.toNumber(outflowAgg._sum.amount || 0);
    const platformProfit = inflow - outflow; // Simplistic metric as requested

    // Pending items
    const pendingDeposits = await prisma.financialLedger.count({ 
        where: { actionType: 'DEPOSIT', status: 'PENDING_APPROVAL' } 
    });
    const pendingWithdrawals = await prisma.financialLedger.count({ 
        where: { actionType: 'WITHDRAWAL', status: 'PENDING_APPROVAL' } 
    });
    const activeInvestments = await prisma.portfolio.count({ where: { status: 'ACTIVE' } });

    res.json({
      totalUsers,
      totalAssets,
      totalAum: Money.toNumber(investmentSum._sum.balance || 0),
      totalFiat: Money.toNumber(fiatSum._sum.balance || 0),
      platformInflow: inflow,
      platformOutflow: outflow,
      platformProfit: platformProfit,
      pendingDeposits,
      pendingWithdrawals,
      activeInvestments
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching admin overview' });
  }
};

// Legacy support
export const getDashboardStats = getOverview; 

// --- USER MANAGEMENT ---

export const getUsers = async (req: any, res: any) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { 
        id: true, fullName: true, email: true, role: true,
        investorType: true, kycStatus: true, onboardingCompleted: true,
        createdAt: true
      }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};

export const getUserDetails = async (req: any, res: any) => {
    const { id } = req.params;
    try {
        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                wallets: true,
                portfolio: { include: { asset: true } },
                financialLedger: { orderBy: { createdAt: 'desc' }, take: 20 }
            }
        });
        
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Augment with safe number conversion
        const safeUser = {
            ...user,
            wallets: user.wallets.map((w: any) => ({ ...w, balance: Money.toNumber(w.balance) })),
            portfolio: user.portfolio.map((p: any) => ({ ...p, amount: Money.toNumber(p.amount) })),
            financialLedger: user.financialLedger.map((l: any) => ({ ...l, amount: Money.toNumber(l.amount) }))
        };

        res.json(safeUser);
    } catch (e) {
        res.status(500).json({ message: 'Error fetching user details' });
    }
};

// --- TRANSACTION APPROVALS ---

export const getPendingDeposits = async (req: any, res: any) => {
    try {
        const deposits = await prisma.financialLedger.findMany({
            where: { actionType: 'DEPOSIT', status: 'PENDING_APPROVAL' },
            include: { user: { select: { email: true, fullName: true } } },
            orderBy: { createdAt: 'desc' }
        });
        const mapped = deposits.map((d: any) => ({
            id: d.id,
            amount: Money.toNumber(d.amount),
            currency: d.currency,
            reference: d.referenceId,
            user: d.user,
            createdAt: d.createdAt,
            metadata: d.metadata ? JSON.parse(d.metadata) : {}
        }));
        res.json(mapped);
    } catch (e) {
        res.status(500).json({ message: 'Error fetching deposits' });
    }
};

export const approveDeposit = async (req: any, res: any) => {
    const { id } = req.params; // Ledger ID
    const adminId = req.user?.id;
    const ip = req.ip;

    try {
        const ledgerEntry = await prisma.financialLedger.findUnique({ where: { id } });
        if (!ledgerEntry || ledgerEntry.status !== 'PENDING_APPROVAL') {
            return res.status(400).json({ message: 'Invalid deposit state' });
        }

        await prisma.$transaction(async (tx: any) => {
            // 1. Credit User's MAIN Wallet
            const wallet = await tx.wallet.findUnique({ where: { id: ledgerEntry.walletId } });
            await tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { increment: ledgerEntry.amount } }
            });

            // 2. Update Ledger Status
            const newBalance = Money.add(wallet.balance, ledgerEntry.amount);
            
            await tx.financialLedger.update({
                where: { id },
                data: { 
                    status: 'COMPLETED',
                    actionType: 'DEPOSIT_APPROVED',
                    balanceAfter: newBalance,
                    metadata: JSON.stringify({ 
                        ...(ledgerEntry.metadata ? JSON.parse(ledgerEntry.metadata) : {}),
                        approvedBy: adminId,
                        approvalDate: new Date()
                    })
                }
            });
        });

        // Audit Log
        await adminLogService.logAction({
            adminId,
            actionType: 'APPROVE_DEPOSIT',
            targetId: ledgerEntry.userId,
            targetType: 'USER',
            amount: ledgerEntry.amount,
            currency: ledgerEntry.currency,
            details: { ledgerId: id, reference: ledgerEntry.referenceId, action: 'Credit Applied' },
            ipAddress: ip
        });

        res.json({ message: 'Deposit approved and funds credited.' });
    } catch (e) {
        res.status(500).json({ message: 'Error approving deposit' });
    }
};

export const rejectDeposit = async (req: any, res: any) => {
    const { id } = req.params;
    const adminId = req.user?.id;
    const ip = req.ip;

    try {
        const ledgerEntry = await prisma.financialLedger.findUnique({ where: { id } });
        if (!ledgerEntry || ledgerEntry.status !== 'PENDING_APPROVAL') return res.status(400).json({ message: 'Invalid deposit' });

        await prisma.financialLedger.update({
            where: { id },
            data: { 
                status: 'REJECTED',
                actionType: 'DEPOSIT_REJECTED',
                metadata: JSON.stringify({ 
                    ...(ledgerEntry.metadata ? JSON.parse(ledgerEntry.metadata) : {}),
                    rejectedBy: adminId,
                    rejectionDate: new Date()
                })
            }
        });

        await adminLogService.logAction({
            adminId,
            actionType: 'REJECT_DEPOSIT',
            targetId: ledgerEntry.userId,
            targetType: 'USER',
            amount: ledgerEntry.amount,
            currency: ledgerEntry.currency,
            details: { ledgerId: id, reference: ledgerEntry.referenceId },
            ipAddress: ip
        });

        res.json({ message: 'Deposit rejected.' });
    } catch (e) {
        res.status(500).json({ message: 'Error rejecting deposit' });
    }
};

export const getPendingWithdrawals = async (req: any, res: any) => {
    try {
        const withdrawals = await prisma.financialLedger.findMany({
            where: { actionType: 'WITHDRAWAL', status: 'PENDING_APPROVAL' },
            include: { user: { select: { email: true, fullName: true } } },
            orderBy: { createdAt: 'desc' }
        });
        const mapped = withdrawals.map((d: any) => ({
            id: d.id,
            amount: Money.toNumber(d.amount),
            currency: d.currency,
            reference: d.referenceId,
            user: d.user,
            createdAt: d.createdAt,
            metadata: d.metadata ? JSON.parse(d.metadata) : {}
        }));
        res.json(mapped);
    } catch (e) {
        res.status(500).json({ message: 'Error fetching withdrawals' });
    }
};

export const approveWithdrawal = async (req: any, res: any) => {
    const { id } = req.params;
    const adminId = req.user?.id;
    const ip = req.ip;

    try {
        // Funds were already deducted from wallet in 'requestWithdrawal', so we just mark completed
        const ledgerEntry = await prisma.financialLedger.findUnique({ where: { id } });
        if (!ledgerEntry || ledgerEntry.status !== 'PENDING_APPROVAL') return res.status(400).json({ message: 'Invalid withdrawal' });

        await prisma.financialLedger.update({
            where: { id },
            data: { 
                status: 'COMPLETED',
                actionType: 'WITHDRAWAL_APPROVED',
                metadata: JSON.stringify({ 
                    ...(ledgerEntry.metadata ? JSON.parse(ledgerEntry.metadata) : {}),
                    approvedBy: adminId,
                    approvalDate: new Date()
                })
            }
        });

        await adminLogService.logAction({
            adminId,
            actionType: 'APPROVE_WITHDRAWAL',
            targetId: ledgerEntry.userId,
            targetType: 'USER',
            amount: ledgerEntry.amount,
            currency: ledgerEntry.currency,
            details: { ledgerId: id, reference: ledgerEntry.referenceId, action: 'Settled Off-Chain' },
            ipAddress: ip
        });

        res.json({ message: 'Withdrawal approved.' });
    } catch (e) {
        res.status(500).json({ message: 'Error approving withdrawal' });
    }
};

export const rejectWithdrawal = async (req: any, res: any) => {
    const { id } = req.params;
    const adminId = req.user?.id;
    const ip = req.ip;

    try {
        const ledgerEntry = await prisma.financialLedger.findUnique({ where: { id } });
        if (!ledgerEntry || ledgerEntry.status !== 'PENDING_APPROVAL') return res.status(400).json({ message: 'Invalid withdrawal' });

        await prisma.$transaction(async (tx: any) => {
            // Refund the wallet since funds were locked
            const wallet = await tx.wallet.findUnique({ where: { id: ledgerEntry.walletId } });
            await tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { increment: ledgerEntry.amount } }
            });

            await tx.financialLedger.update({
                where: { id },
                data: { 
                    status: 'REJECTED',
                    actionType: 'WITHDRAWAL_REJECTED',
                    balanceAfter: Money.add(wallet.balance, ledgerEntry.amount),
                    metadata: JSON.stringify({ 
                        ...(ledgerEntry.metadata ? JSON.parse(ledgerEntry.metadata) : {}),
                        rejectedBy: adminId,
                        rejectionDate: new Date()
                    })
                }
            });
        });

        await adminLogService.logAction({
            adminId,
            actionType: 'REJECT_WITHDRAWAL',
            targetId: ledgerEntry.userId,
            targetType: 'USER',
            amount: ledgerEntry.amount,
            currency: ledgerEntry.currency,
            details: { ledgerId: id, reference: ledgerEntry.referenceId, action: 'Refunded to Wallet' },
            ipAddress: ip
        });

        res.json({ message: 'Withdrawal rejected and funds refunded.' });
    } catch (e) {
        res.status(500).json({ message: 'Error rejecting withdrawal' });
    }
};

// --- ADMIN WALLET CONTROL ---

export const creditUserWallet = async (req: any, res: any) => {
    const { userId } = req.params;
    const { amount, reason } = req.body;
    const adminId = req.user?.id;
    const ip = req.ip;

    if (!amount || amount <= 0 || !reason) return res.status(400).json({ message: 'Invalid amount or reason missing' });

    const creditAmount = Money.from(amount);

    try {
        const wallet = await prisma.wallet.findUnique({ where: { userId_type: { userId, type: 'MAIN' } } });
        if (!wallet) return res.status(404).json({ message: 'User wallet not found' });

        await prisma.$transaction(async (tx: any) => {
            await tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { increment: creditAmount } }
            });

            await ledgerService.recordEntry(tx, {
                userId,
                walletId: wallet.id,
                actionType: 'ADMIN_CREDIT',
                amount: creditAmount,
                currency: 'USD',
                referenceId: `ADM-CR-${randomUUID().substring(0,6).toUpperCase()}`,
                source: 'ADMIN',
                balanceBefore: wallet.balance,
                balanceAfter: Money.add(wallet.balance, creditAmount),
                status: 'COMPLETED',
                metadata: { reason, adminId }
            });
        });

        await adminLogService.logAction({
            adminId,
            actionType: 'MANUAL_CREDIT',
            targetId: userId,
            targetType: 'WALLET',
            amount: creditAmount,
            currency: 'USD',
            details: { reason, walletId: wallet.id, balanceBefore: Money.toNumber(wallet.balance), balanceAfter: Money.toNumber(Money.add(wallet.balance, creditAmount)) },
            ipAddress: ip
        });

        res.json({ message: 'User wallet credited successfully' });
    } catch (e) {
        res.status(500).json({ message: 'Credit failed' });
    }
};

export const debitUserWallet = async (req: any, res: any) => {
    const { userId } = req.params;
    const { amount, reason } = req.body;
    const adminId = req.user?.id;
    const ip = req.ip;

    if (!amount || amount <= 0 || !reason) return res.status(400).json({ message: 'Invalid amount or reason missing' });

    const debitAmount = Money.from(amount);

    try {
        const wallet = await prisma.wallet.findUnique({ where: { userId_type: { userId, type: 'MAIN' } } });
        if (!wallet) return res.status(404).json({ message: 'User wallet not found' });
        
        // Allow debit even if it goes negative? Usually no.
        if (Money.lt(wallet.balance, debitAmount)) return res.status(400).json({ message: 'Insufficient funds for debit' });

        await prisma.$transaction(async (tx: any) => {
            await tx.wallet.update({
                where: { id: wallet.id },
                data: { balance: { decrement: debitAmount } }
            });

            await ledgerService.recordEntry(tx, {
                userId,
                walletId: wallet.id,
                actionType: 'ADMIN_DEBIT',
                amount: debitAmount,
                currency: 'USD',
                referenceId: `ADM-DB-${randomUUID().substring(0,6).toUpperCase()}`,
                source: 'ADMIN',
                balanceBefore: wallet.balance,
                balanceAfter: Money.sub(wallet.balance, debitAmount),
                status: 'COMPLETED',
                metadata: { reason, adminId }
            });
        });

        await adminLogService.logAction({
            adminId,
            actionType: 'MANUAL_DEBIT',
            targetId: userId,
            targetType: 'WALLET',
            amount: debitAmount,
            currency: 'USD',
            details: { reason, walletId: wallet.id, balanceBefore: Money.toNumber(wallet.balance), balanceAfter: Money.toNumber(Money.sub(wallet.balance, debitAmount)) },
            ipAddress: ip
        });

        res.json({ message: 'User wallet debited successfully' });
    } catch (e) {
        res.status(500).json({ message: 'Debit failed' });
    }
};

// --- MISC / SHARED ---

export const getInvestors = async (req: any, res: any) => {
  // Enhanced existing function
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { 
        id: true, fullName: true, email: true, 
        investorType: true, kycStatus: true, onboardingCompleted: true,
        profileData: true 
      }
    });
    const augmented = await Promise.all(users.map(async (u: any) => {
        const risk = await kycService.calculateRiskScore(u);
        return { ...u, riskScore: risk };
    }));
    res.json(augmented);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching investors' });
  }
};

export const verifyInvestor = async (req: any, res: any) => {
  const { id } = req.params;
  const adminId = req.user?.id;
  try {
    const user = await prisma.user.update({
      where: { id },
      data: { kycStatus: 'APPROVED' }
    });
    await kycService.logComplianceAction(id, 'KYC_APPROVED', adminId, 'Manual verification');
    
    await adminLogService.logAction({
        adminId,
        actionType: 'VERIFY_USER',
        targetId: id,
        targetType: 'USER',
        details: { kycStatus: 'APPROVED' },
        ipAddress: req.ip
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error verifying investor' });
  }
};

export const rejectInvestor = async (req: any, res: any) => {
    const { id } = req.params;
    const adminId = req.user?.id;
    try {
        const user = await prisma.user.update({
            where: { id },
            data: { kycStatus: 'REJECTED' }
        });
        await kycService.logComplianceAction(id, 'KYC_REJECTED', adminId, 'Manual rejection');
        
        await adminLogService.logAction({
            adminId,
            actionType: 'REJECT_USER',
            targetId: id,
            targetType: 'USER',
            details: { kycStatus: 'REJECTED' },
            ipAddress: req.ip
        });

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error rejecting investor' });
    }
};

export const createAsset = async (req: any, res: any) => {
  const adminId = req.user?.id;
  try {
    const { scenarios, ...rest } = req.body;
    const asset = await prisma.investment.create({
      data: {
        ...rest,
        scenarios: JSON.stringify(scenarios)
      }
    });

    await adminLogService.logAction({
        adminId,
        actionType: 'CREATE_ASSET',
        targetId: asset.id,
        targetType: 'INVESTMENT',
        details: { ticker: asset.ticker, title: asset.title },
        ipAddress: req.ip
    });

    res.status(201).json(asset);
  } catch (error) {
    res.status(500).json({ message: 'Error creating asset' });
  }
};

export const getPendingInvestments = async (req: any, res: any) => {
  try {
    const portfolios = await prisma.portfolio.findMany({
      where: { status: 'PENDING' },
      include: { user: true, asset: true },
      orderBy: { createdAt: 'asc' }
    });
    
    // Map to generic shape for Admin UI
    const mapped = portfolios.map((p: any) => ({
        id: p.id,
        amount: Money.toNumber(p.amount),
        status: 'ESCROWED', // Map PENDING to ESCROWED for UI
        user: p.user,
        asset: p.asset
    }));
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending investments' });
  }
};

export const approveInvestment = async (req: any, res: any) => {
  const { id } = req.params;
  const adminId = req.user?.id;
  try {
    const portfolio = await prisma.portfolio.findUnique({ where: { id } });
    if (!portfolio || portfolio.status !== 'PENDING') {
      return res.status(400).json({ message: 'Invalid investment state' });
    }
    
    await prisma.$transaction(async (tx: any) => {
      // 1. Activate Portfolio
      await tx.portfolio.update({
        where: { id },
        data: { status: 'ACTIVE' }
      });
    });

    await adminLogService.logAction({
        adminId,
        actionType: 'APPROVE_INVESTMENT',
        targetId: id,
        targetType: 'INVESTMENT',
        amount: portfolio.amount,
        details: { userId: portfolio.userId, assetId: portfolio.assetId },
        ipAddress: req.ip
    });

    res.json({ message: 'Investment approved.' });
  } catch (error) {
    res.status(500).json({ message: 'Error approving investment' });
  }
};

export const refundInvestment = async (req: any, res: any) => {
  const { id } = req.params;
  const adminId = req.user?.id;
  try {
    const portfolio = await prisma.portfolio.findUnique({ where: { id } });
    if (!portfolio || portfolio.status !== 'PENDING') {
      return res.status(400).json({ message: 'Invalid investment state' });
    }
    
    await prisma.$transaction(async (tx: any) => {
        // 1. Mark Portfolio as REFUNDED
        await tx.portfolio.update({
            where: { id },
            data: { status: 'REFUNDED' }
        });

        // 2. Return funds: Debit Investment Wallet -> Credit Main Wallet
        const invWallet = await tx.wallet.findUnique({ where: { userId_type: { userId: portfolio.userId, type: 'INVESTMENT' } } });
        const mainWallet = await tx.wallet.findUnique({ where: { userId_type: { userId: portfolio.userId, type: 'MAIN' } } });

        await tx.wallet.update({
            where: { id: invWallet.id },
            data: { balance: { decrement: portfolio.amount } }
        });

        await tx.wallet.update({
            where: { id: mainWallet.id },
            data: { balance: { increment: portfolio.amount } }
        });
    });

    await adminLogService.logAction({
        adminId,
        actionType: 'REFUND_INVESTMENT',
        targetId: id,
        targetType: 'INVESTMENT',
        amount: portfolio.amount,
        details: { userId: portfolio.userId, assetId: portfolio.assetId, action: 'Refunded to Main Wallet' },
        ipAddress: req.ip
    });

    res.json({ message: 'Investment rejected and refunded.' });
  } catch (error) {
    res.status(500).json({ message: 'Error refunding investment' });
  }
};

export const getTreasury = async (req: any, res: any) => {
    try {
        const stats = await custodyService.getTreasuryStatus();
        res.json(stats);
    } catch (e) {
        res.status(500).json({ message: 'Error fetching treasury' });
    }
};

export const getMultisigRequests = async (req: any, res: any) => {
    try {
        const requests = await prisma.financialLedger.findMany({
            where: { 
                actionType: 'WITHDRAWAL', 
                status: 'PENDING_APPROVAL' 
            },
            include: { user: { select: { email: true, fullName: true } } },
            orderBy: { createdAt: 'desc' }
        });
        const mapped = requests.map((r: any) => ({
            ...r,
            amount: Money.toNumber(r.amount)
        }));
        res.json(mapped);
    } catch (e) {
        res.json([]); 
    }
};

export const approveMultisig = async (req: any, res: any) => {
    const { referenceId } = req.params;
    const adminId = req.user?.id;
    try {
        const result = await custodyService.approveWithdrawal(referenceId, adminId);
        res.json(result);
    } catch (e) {
        res.status(500).json({ message: 'Multisig approval failed' });
    }
};

export const getComplianceAlerts = async (req: any, res: any) => {
    try {
        const alerts = await riskEngine.getRecentAlerts();
        res.json(alerts);
    } catch (e) {
        res.status(500).json({ message: 'Error fetching alerts' });
    }
};

export const getAuditLogs = async (req: any, res: any) => {
    try {
        const logs = await complianceService.generateAuditPack();
        res.json(logs);
    } catch (e) {
        res.status(500).json({ message: 'Audit log error' });
    }
};

export const runDiagnostics = async (req: any, res: any) => {
    const start = Date.now();
    const checks: any = {
        timestamp: new Date(),
        database: { status: 'PENDING', latencyMs: 0 },
        services: { status: 'OK' },
        env: { status: 'OK' }
    };
    try {
        const userCount = await prisma.user.count();
        checks.database.status = 'CONNECTED';
        checks.database.latencyMs = Date.now() - start;
        checks.database.recordCount = userCount;
    } catch (e: any) {
        checks.database.status = 'ERROR';
        checks.database.error = e.message;
    }
    res.json(checks);
};

export const triggerTestNotification = async (req: any, res: any) => {
    const userId = req.user.id;
    try {
        await prisma.notification.create({
            data: {
                userId,
                title: 'System Verification',
                message: 'Test notification triggered.',
                type: 'SUCCESS'
            }
        });
        return res.json({ success: true, message: 'Notification dispatched' });
    } catch (e) {
        res.status(500).json({ message: 'Notification failed' });
    }
};

export const getSystemLogs = async (req: any, res: any) => {
    const { actionType, adminId, startDate, endDate, page, limit } = req.query;
    try {
        const logs = await adminLogService.getLogs({
            actionType: actionType as string,
            adminId: adminId as string,
            startDate: startDate ? new Date(startDate as string) : undefined,
            endDate: endDate ? new Date(endDate as string) : undefined,
            page: page ? parseInt(page as string) : 1,
            limit: limit ? parseInt(limit as string) : 20
        });
        res.json(logs);
    } catch (e) {
        res.status(500).json({ message: 'Error fetching system logs' });
    }
};
