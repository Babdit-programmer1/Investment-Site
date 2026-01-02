
import { Request, Response } from 'express';
// @ts-ignore
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import { ledgerService } from '../services/ledgerService';
import { paymentService } from '../services/paymentService';
import { complianceService } from '../services/complianceService';
import { Money } from '../utils/money';

const prisma = new PrismaClient();

export const initiateInvestment = async (req: any, res: any) => {
  const userId = req.user?.id;
  // investmentType: 'ONE_TIME' | 'MONTHLY'
  const { assetId, amount, investmentType = 'ONE_TIME', durationMonths = 12 } = req.body;
  
  // Safe Decimal Conversion
  const investAmount = Money.from(amount);

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const asset = await prisma.investment.findUnique({ where: { id: assetId } });
    if (!asset) return res.status(404).json({ message: 'Asset not found' });
    
    // 1. Check Compliance Limits
    complianceService.checkTransactionLimits(user, investAmount, 'INVESTMENT');

    // 2. Check Asset Minimums
    if (investmentType === 'ONE_TIME' && investAmount.lessThan(asset.minInvestment)) {
      return res.status(400).json({ message: `Minimum investment is $${Money.toNumber(asset.minInvestment).toLocaleString()}` });
    }

    if (investmentType === 'MONTHLY' && (!durationMonths || durationMonths < 3)) {
        return res.status(400).json({ message: 'Minimum duration for monthly plans is 3 months.' });
    }

    // 3. Check Main Wallet (Strict Check)
    const mainWallet = await prisma.wallet.findUnique({ where: { userId_type: { userId, type: 'MAIN' } } });
    if (!mainWallet || Money.lt(mainWallet.balance, investAmount)) {
        return res.status(400).json({ 
            message: 'Insufficient funds. Please deposit crypto to your Main Wallet first.' 
        });
    }

    const status = 'ACTIVE'; 
    const ref = `INV-${randomUUID().substring(0,8).toUpperCase()}`;

    // 4. Execute Investment (Internal Ledger Move)
    await prisma.$transaction(async (tx: any) => {
        // Debit Main
        await tx.wallet.update({
            where: { id: mainWallet.id },
            data: { balance: { decrement: investAmount } }
        });

        // Credit Investment Wallet (Locked Capital)
        const invWallet = await tx.wallet.findUnique({ where: { userId_type: { userId, type: 'INVESTMENT' } } });
        await tx.wallet.update({
            where: { id: invWallet.id },
            data: { balance: { increment: investAmount } }
        });

        // Create Portfolio Entry
        const portfolio = await tx.portfolio.create({
            data: {
                userId,
                assetId,
                amount: investAmount,
                currency: 'USD',
                status: status,
                type: investmentType,
                monthlyAmount: investmentType === 'MONTHLY' ? investAmount : null,
                durationMonths: investmentType === 'MONTHLY' ? durationMonths : null,
                monthsPaid: investmentType === 'MONTHLY' ? 1 : null,
                totalCommittedAmount: investmentType === 'MONTHLY' ? Money.mul(investAmount, durationMonths) : investAmount
            }
        });

        // Generate Payment Schedule for Monthly Plans
        if (investmentType === 'MONTHLY') {
            for (let i = 1; i < durationMonths; i++) {
                const dueDate = new Date();
                dueDate.setMonth(dueDate.getMonth() + i);
                
                await tx.monthlyPayment.create({
                    data: {
                        portfolioId: portfolio.id,
                        amount: investAmount,
                        dueDate: dueDate,
                        status: 'UNPAID'
                    }
                });
            }
        }

        // Ledger Entry
        await ledgerService.recordEntry(tx, {
            userId,
            walletId: mainWallet.id,
            actionType: 'INVESTMENT',
            amount: investAmount,
            currency: 'USD',
            referenceId: ref,
            source: 'WALLET',
            balanceBefore: mainWallet.balance,
            balanceAfter: Money.sub(mainWallet.balance, investAmount),
            status: 'COMPLETED',
            metadata: { 
                assetId, 
                assetName: asset.title, 
                investmentType, 
                installment: investmentType === 'MONTHLY' ? `1/${durationMonths}` : 'FULL' 
            }
        });
    });

    return res.json({
        success: true,
        message: investmentType === 'MONTHLY' ? 'Monthly plan started successfully' : 'Investment successful'
    });

  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Failed to initiate investment' });
  }
};

export const verifyPayment = async (req: any, res: any) => {
  res.json({ status: 'COMPLETED', message: 'Verified' });
};

export const getMyInvestments = async (req: any, res: any) => {
  const userId = req.user?.id;
  try {
    const portfolios = await prisma.portfolio.findMany({
      where: { userId },
      include: { 
          asset: true,
          payments: {
              where: { status: 'UNPAID' },
              orderBy: { dueDate: 'asc' },
              take: 1
          }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    const mapped = portfolios.map((p: any) => ({
        id: p.id,
        userId: p.userId,
        assetId: p.assetId,
        amount: Money.toNumber(p.amount),
        currency: p.currency,
        status: p.status === 'PENDING' ? 'ESCROWED' : p.status, 
        paymentReference: 'WALLET',
        createdAt: p.createdAt,
        investmentType: p.type || 'ONE_TIME',
        monthlyAmount: p.monthlyAmount ? Money.toNumber(p.monthlyAmount) : 0,
        durationMonths: p.durationMonths,
        monthsPaid: p.monthsPaid,
        nextPaymentDate: p.payments?.[0]?.dueDate,
        asset: {
            ...p.asset,
            minInvestment: Money.toNumber(p.asset.minInvestment),
            price: p.asset.price ? Money.toNumber(p.asset.price) : 0,
            targetIrp: p.asset.targetIrp ? Money.toNumber(p.asset.targetIrp) : 0
        }
    }));

    res.json(mapped);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching investments' });
  }
};

export const getDepositConfig = async (req: any, res: any) => {
    try {
        const addresses = await paymentService.getAllAddresses();
        res.json(addresses);
    } catch (e) {
        res.status(500).json({ message: 'Failed to fetch deposit config' });
    }
};
