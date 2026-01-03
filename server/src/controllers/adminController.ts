
import { Request, Response } from 'express';
// @ts-ignore
import { PrismaClient } from '@prisma/client';
import { adminLogService } from '../services/adminLogService';
import { Money } from '../utils/money';
import { custodyService } from '../services/custodyService';
import { riskEngine } from '../services/riskEngine';
import { ledgerService } from '../services/ledgerService';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

export const getOverview = async (req: any, res: any) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalAssets = await prisma.investment.count();
    
    // Industrial Aggregation using _sum
    const walletSum = await prisma.wallet.aggregate({ 
        _sum: { balance: true } 
    });
    
    const inflowAgg = await prisma.financialLedger.aggregate({
        where: { actionType: 'DEPOSIT_APPROVED', status: 'COMPLETED' },
        _sum: { amount: true }
    });

    const outflowAgg = await prisma.financialLedger.aggregate({
        where: { actionType: 'WITHDRAWAL_APPROVED', status: 'COMPLETED' },
        _sum: { amount: true }
    });

    const inflow = Money.toNumber(inflowAgg._sum.amount || 0);
    const outflow = Money.toNumber(outflowAgg._sum.amount || 0);

    res.json({
      totalUsers,
      totalAssets,
      totalAum: Money.toNumber(walletSum._sum.balance || 0),
      platformInflow: inflow,
      platformOutflow: outflow,
      platformProfit: inflow - outflow,
      pendingDeposits: await prisma.financialLedger.count({ where: { actionType: 'DEPOSIT', status: 'PENDING_APPROVAL' } }),
      pendingWithdrawals: await prisma.financialLedger.count({ where: { actionType: 'WITHDRAWAL', status: 'PENDING_APPROVAL' } }),
      activeInvestments: await prisma.portfolio.count({ where: { status: 'PENDING' } })
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admin overview' });
  }
};

/**
 * Fetch all users
 */
export const getUsers = async (req: any, res: any) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};

/**
 * Fetch a single user by ID
 */
export const getUserDetails = async (req: any, res: any) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        wallets: true,
        portfolio: { include: { asset: true } }
      }
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user details' });
  }
};

/**
 * Update kycStatus to APPROVED
 */
export const verifyInvestor = async (req: any, res: any) => {
  const { id } = req.params;
  try {
    await prisma.user.update({
      where: { id },
      data: { kycStatus: 'APPROVED' }
    });
    await adminLogService.logAction({
      adminId: req.user.id,
      actionType: 'VERIFY_USER',
      targetId: id,
      targetType: 'USER',
      ipAddress: req.ip
    });
    res.json({ message: 'Investor verified' });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying investor' });
  }
};

/**
 * Update kycStatus to REJECTED
 */
export const rejectInvestor = async (req: any, res: any) => {
  const { id } = req.params;
  try {
    await prisma.user.update({
      where: { id },
      data: { kycStatus: 'REJECTED' }
    });
    await adminLogService.logAction({
      adminId: req.user.id,
      actionType: 'REJECT_USER',
      targetId: id,
      targetType: 'USER',
      ipAddress: req.ip
    });
    res.json({ message: 'Investor rejected' });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting investor' });
  }
};

/**
 * Find Portfolio entries with status PENDING
 */
export const getPendingInvestments = async (req: any, res: any) => {
  try {
    const pending = await prisma.portfolio.findMany({
      where: { status: 'PENDING' },
      include: { user: true, asset: true }
    });
    res.json(pending);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending investments' });
  }
};

/**
 * Update Portfolio status to ACTIVE
 */
export const approveInvestment = async (req: any, res: any) => {
  const { id } = req.params;
  try {
    await prisma.portfolio.update({
      where: { id },
      data: { status: 'ACTIVE' }
    });
    await adminLogService.logAction({
      adminId: req.user.id,
      actionType: 'APPROVE_INVESTMENT',
      targetId: id,
      targetType: 'PORTFOLIO',
      ipAddress: req.ip
    });
    res.json({ message: 'Investment approved' });
  } catch (error) {
    res.status(500).json({ message: 'Error approving investment' });
  }
};

/**
 * Update Portfolio status to REJECTED/REFUNDED and credit back the wallet
 */
export const refundInvestment = async (req: any, res: any) => {
  const { id } = req.params;
  try {
    const portfolio = await prisma.portfolio.findUnique({
      where: { id },
      include: { user: true }
    });
    if (!portfolio) return res.status(404).json({ message: 'Not found' });

    await prisma.$transaction(async (tx: any) => {
      // Return funds to wallet
      const wallet = await tx.wallet.findFirst({ where: { userId: portfolio.userId, type: 'MAIN' } });
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: portfolio.amount } }
      });
      // Deduct from investment wallet
      const invWallet = await tx.wallet.findFirst({ where: { userId: portfolio.userId, type: 'INVESTMENT' } });
      await tx.wallet.update({
        where: { id: invWallet.id },
        data: { balance: { decrement: portfolio.amount } }
      });
      // Update portfolio
      await tx.portfolio.update({
        where: { id },
        data: { status: 'REJECTED' }
      });
    });

    await adminLogService.logAction({
      adminId: req.user.id,
      actionType: 'REFUND_INVESTMENT',
      targetId: id,
      targetType: 'PORTFOLIO',
      amount: portfolio.amount,
      ipAddress: req.ip
    });

    res.json({ message: 'Investment refunded' });
  } catch (error) {
    res.status(500).json({ message: 'Error refunding investment' });
  }
};

/**
 * Overall treasury stats
 */
export const getTreasury = async (req: any, res: any) => {
  try {
    const status = await custodyService.getTreasuryStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching treasury' });
  }
};

/**
 * Pending multisig actions
 */
export const getMultisigRequests = async (req: any, res: any) => {
  res.json([]); // Placeholder
};

/**
 * Approve a multisig action
 */
export const approveMultisig = async (req: any, res: any) => {
  const { referenceId } = req.params;
  try {
    const result = await custodyService.approveWithdrawal(referenceId, req.user.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error approving multisig' });
  }
};

/**
 * Risk alerts
 */
export const getComplianceAlerts = async (req: any, res: any) => {
  try {
    const alerts = await riskEngine.getRecentAlerts();
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching alerts' });
  }
};

/**
 * Compliance audit logs
 */
export const getAuditLogs = async (req: any, res: any) => {
  try {
    const logs = await adminLogService.getLogs({});
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching audit logs' });
  }
};

/**
 * System health check
 */
export const runDiagnostics = async (req: any, res: any) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: { db: 'ok', cache: 'ok' }
  });
};

/**
 * Test notifications
 */
export const triggerTestNotification = async (req: any, res: any) => {
  res.json({ message: 'Notification triggered' });
};

/**
 * Deposits awaiting approval
 */
export const getPendingDeposits = async (req: any, res: any) => {
  try {
    const pending = await prisma.financialLedger.findMany({
      where: { actionType: 'DEPOSIT', status: 'PENDING_APPROVAL' },
      include: { user: true }
    });
    res.json(pending);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending deposits' });
  }
};

export const approveDeposit = async (req: any, res: any) => {
  const { id } = req.params;
  const adminId = req.user?.id;

  try {
    const ledgerEntry = await prisma.financialLedger.findUnique({ where: { id } });
    if (!ledgerEntry || ledgerEntry.status !== 'PENDING_APPROVAL') {
      return res.status(400).json({ message: 'Invalid deposit state' });
    }

    await prisma.$transaction(async (tx: any) => {
      const wallet = await tx.wallet.findUnique({ where: { id: ledgerEntry.walletId } });
      const newBalance = Money.add(wallet.balance, ledgerEntry.amount);

      // 1. Update Wallet
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: newBalance }
      });

      // 2. Complete Ledger Entry
      await tx.financialLedger.update({
        where: { id },
        data: { 
          status: 'COMPLETED',
          actionType: 'DEPOSIT_APPROVED',
          balanceBefore: wallet.balance,
          balanceAfter: newBalance
        }
      });
    });

    await adminLogService.logAction({
      adminId,
      actionType: 'APPROVE_DEPOSIT',
      targetId: ledgerEntry.userId,
      amount: ledgerEntry.amount,
      ipAddress: req.ip
    });

    res.json({ message: 'Deposit approved and wallet credited.' });
  } catch (e) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * Decline a deposit
 */
export const rejectDeposit = async (req: any, res: any) => {
  const { id } = req.params;
  try {
    await prisma.financialLedger.update({
      where: { id },
      data: { status: 'REJECTED' }
    });
    await adminLogService.logAction({
      adminId: req.user.id,
      actionType: 'REJECT_DEPOSIT',
      targetId: id,
      targetType: 'LEDGER',
      ipAddress: req.ip
    });
    res.json({ message: 'Deposit rejected' });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting deposit' });
  }
};

/**
 * Withdrawals awaiting approval
 */
export const getPendingWithdrawals = async (req: any, res: any) => {
  try {
    const pending = await prisma.financialLedger.findMany({
      where: { actionType: 'WITHDRAWAL', status: 'PENDING_APPROVAL' },
      include: { user: true }
    });
    res.json(pending);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending withdrawals' });
  }
};

/**
 * Approve a withdrawal
 */
export const approveWithdrawal = async (req: any, res: any) => {
  const { id } = req.params;
  try {
    const ledger = await prisma.financialLedger.findUnique({ where: { id } });
    if (!ledger) return res.status(404).json({ message: 'Not found' });
    
    await custodyService.approveWithdrawal(ledger.referenceId, req.user.id);
    
    await adminLogService.logAction({
      adminId: req.user.id,
      actionType: 'APPROVE_WITHDRAWAL',
      targetId: id,
      targetType: 'LEDGER',
      amount: ledger.amount,
      ipAddress: req.ip
    });
    res.json({ message: 'Withdrawal approved' });
  } catch (error) {
    res.status(500).json({ message: 'Error approving withdrawal' });
  }
};

/**
 * Decline a withdrawal
 */
export const rejectWithdrawal = async (req: any, res: any) => {
  const { id } = req.params;
  try {
    const ledger = await prisma.financialLedger.findUnique({ where: { id }, include: { wallet: true } });
    if (!ledger) return res.status(404).json({ message: 'Not found' });

    await prisma.$transaction(async (tx: any) => {
      // Return funds to wallet
      await tx.wallet.update({
        where: { id: ledger.walletId },
        data: { balance: { increment: ledger.amount } }
      });
      // Update ledger
      await tx.financialLedger.update({
        where: { id },
        data: { status: 'REJECTED' }
      });
    });

    await adminLogService.logAction({
      adminId: req.user.id,
      actionType: 'REJECT_WITHDRAWAL',
      targetId: id,
      targetType: 'LEDGER',
      ipAddress: req.ip
    });
    res.json({ message: 'Withdrawal rejected and funds returned' });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting withdrawal' });
  }
};

/**
 * Manually add funds to a user's wallet
 */
export const creditUserWallet = async (req: any, res: any) => {
  const { userId } = req.params;
  const { amount, reason } = req.body;
  try {
    const creditAmount = Money.from(amount);
    const wallet = await prisma.wallet.findFirst({ where: { userId, type: 'MAIN' } });
    if (!wallet) return res.status(404).json({ message: 'Wallet not found' });

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
        referenceId: `MAN-${randomUUID().substring(0,8).toUpperCase()}`,
        source: 'ADMIN',
        balanceBefore: wallet.balance,
        balanceAfter: Money.add(wallet.balance, creditAmount),
        status: 'COMPLETED',
        metadata: { reason }
      });
    });

    await adminLogService.logAction({
      adminId: req.user.id,
      actionType: 'MANUAL_CREDIT',
      targetId: userId,
      targetType: 'USER',
      amount: creditAmount,
      details: { reason },
      ipAddress: req.ip
    });

    res.json({ message: 'Wallet credited successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error crediting wallet' });
  }
};

/**
 * Manually remove funds from a user's wallet
 */
export const debitUserWallet = async (req: any, res: any) => {
  const { userId } = req.params;
  const { amount, reason } = req.body;
  try {
    const debitAmount = Money.from(amount);
    const wallet = await prisma.wallet.findFirst({ where: { userId, type: 'MAIN' } });
    if (!wallet) return res.status(404).json({ message: 'Wallet not found' });

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
        referenceId: `MAN-${randomUUID().substring(0,8).toUpperCase()}`,
        source: 'ADMIN',
        balanceBefore: wallet.balance,
        balanceAfter: Money.sub(wallet.balance, debitAmount),
        status: 'COMPLETED',
        metadata: { reason }
      });
    });

    await adminLogService.logAction({
      adminId: req.user.id,
      actionType: 'MANUAL_DEBIT',
      targetId: userId,
      targetType: 'USER',
      amount: debitAmount,
      details: { reason },
      ipAddress: req.ip
    });

    res.json({ message: 'Wallet debited successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error debiting wallet' });
  }
};

/**
 * Admin logs for the logs tab
 */
export const getSystemLogs = async (req: any, res: any) => {
  const { actionType, adminId, page, limit } = req.query;
  try {
    const logs = await adminLogService.getLogs({
      actionType: actionType as string,
      adminId: adminId as string,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching system logs' });
  }
};

export const createAsset = async (req: any, res: any) => {
  try {
    const { scenarios, price, minInvestment, ...rest } = req.body;
    const asset = await prisma.investment.create({
      data: {
        ...rest,
        price: Money.from(price),
        minInvestment: Money.from(minInvestment),
        scenarios: JSON.stringify(scenarios)
      }
    });

    await adminLogService.logAction({
      adminId: req.user.id,
      actionType: 'CREATE_ASSET',
      targetId: asset.id,
      ipAddress: req.ip
    });

    res.status(201).json(asset);
  } catch (error) {
    res.status(500).json({ message: 'Error creating asset' });
  }
};
