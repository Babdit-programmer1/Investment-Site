
import { Request, Response } from 'express';
// @ts-ignore
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import { Money } from '../utils/money';
import { ledgerService } from '../services/ledgerService';

const prisma = new PrismaClient();

export const getAllInvestments = async (req: any, res: any) => {
  try {
    const investments = await prisma.investment.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    const mapped = investments.map((inv: any) => ({
        ...inv,
        minInvestment: Money.toNumber(inv.minInvestment),
        price: inv.price ? Money.toNumber(inv.price) : 0,
        targetIrp: inv.targetIrp ? Money.toNumber(inv.targetIrp) : 0
    }));

    res.json(mapped);
  } catch (error) {
    console.error("Fetch Investments Error:", error);
    res.status(500).json({ message: 'Error retrieving market assets' });
  }
};

export const getInvestmentById = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const investment = await prisma.investment.findUnique({
      where: { id }
    });
    if (!investment) return res.status(404).json({ message: 'Asset not found' });
    
    const mapped = {
        ...investment,
        minInvestment: Money.toNumber(investment.minInvestment),
        price: investment.price ? Money.toNumber(investment.price) : 0,
        targetIrp: investment.targetIrp ? Money.toNumber(investment.targetIrp) : 0
    };
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching investment details' });
  }
};

export const topUpInvestment = async (req: any, res: any) => {
    const userId = req.user?.id;
    const { id } = req.params;
    const { amount } = req.body;
    const topUpAmount = Money.from(amount);

    if (topUpAmount.lte(0)) return res.status(400).json({ message: "Invalid amount" });

    try {
        const portfolio = await prisma.portfolio.findFirst({
            where: { userId, assetId: id, status: 'ACTIVE' }
        });

        if (!portfolio) {
            return res.status(404).json({ message: 'Active investment not found for this asset.' });
        }

        const mainWallet = await prisma.wallet.findUnique({ where: { userId_type: { userId, type: 'MAIN' } } });
        if (!mainWallet || Money.lt(mainWallet.balance, topUpAmount)) {
            return res.status(400).json({ message: 'Insufficient funds.' });
        }

        const ref = `TOP-${randomUUID().substring(0,8).toUpperCase()}`;

        await prisma.$transaction(async (tx: any) => {
            await tx.wallet.update({
                where: { id: mainWallet.id },
                data: { balance: { decrement: topUpAmount } }
            });

            const invWallet = await tx.wallet.findUnique({ where: { userId_type: { userId, type: 'INVESTMENT' } } });
            await tx.wallet.update({
                where: { id: invWallet.id },
                data: { balance: { increment: topUpAmount } }
            });

            await tx.portfolio.update({
                where: { id: portfolio.id },
                data: { amount: { increment: topUpAmount } }
            });

            await ledgerService.recordEntry(tx, {
                userId,
                walletId: mainWallet.id,
                actionType: 'INVESTMENT_TOP_UP',
                amount: topUpAmount,
                currency: 'USD',
                referenceId: ref,
                source: 'WALLET',
                balanceBefore: mainWallet.balance,
                balanceAfter: Money.sub(mainWallet.balance, topUpAmount),
                status: 'COMPLETED',
                metadata: { assetId: id, portfolioId: portfolio.id }
            });
        });

        res.json({ message: 'Investment topped up successfully', newPrincipal: Money.toNumber(Money.add(portfolio.amount, topUpAmount)) });

    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Top up failed' });
    }
};

export const payMonthlyInstallment = async (req: any, res: any) => {
    const userId = req.user?.id;
    const { id } = req.params;
    
    try {
        const portfolio = await prisma.portfolio.findFirst({
            where: { userId, assetId: id, type: 'MONTHLY' },
            include: { payments: { where: { status: 'UNPAID' }, orderBy: { dueDate: 'asc' }, take: 1 } }
        });

        if (!portfolio) return res.status(404).json({ message: 'Monthly plan not found.' });
        
        const nextPayment = portfolio.payments[0];
        if (!nextPayment) return res.status(400).json({ message: 'No pending payments found.' });

        const amount = Money.from(nextPayment.amount);

        const mainWallet = await prisma.wallet.findUnique({ where: { userId_type: { userId, type: 'MAIN' } } });
        if (!mainWallet || Money.lt(mainWallet.balance, amount)) {
            return res.status(400).json({ message: 'Insufficient funds for installment.' });
        }

        const ref = `INS-${randomUUID().substring(0,8).toUpperCase()}`;

        await prisma.$transaction(async (tx: any) => {
            await tx.wallet.update({
                where: { id: mainWallet.id },
                data: { balance: { decrement: amount } }
            });

            const invWallet = await tx.wallet.findUnique({ where: { userId_type: { userId, type: 'INVESTMENT' } } });
            await tx.wallet.update({
                where: { id: invWallet.id },
                data: { balance: { increment: amount } }
            });

            await tx.monthlyPayment.update({
                where: { id: nextPayment.id },
                data: { status: 'PAID', paidAt: new Date() }
            });

            const updatedMonthsPaid = (portfolio.monthsPaid || 0) + 1;
            const updates: any = { 
                amount: { increment: amount },
                monthsPaid: updatedMonthsPaid,
                status: 'ACTIVE'
            };

            if (portfolio.durationMonths && updatedMonthsPaid >= portfolio.durationMonths) {
                updates.status = 'MATURED';
            }

            await tx.portfolio.update({
                where: { id: portfolio.id },
                data: updates
            });

            await ledgerService.recordEntry(tx, {
                userId,
                walletId: mainWallet.id,
                actionType: 'MONTHLY_INVESTMENT_PAYMENT',
                amount: amount,
                currency: 'USD',
                referenceId: ref,
                source: 'WALLET',
                balanceBefore: mainWallet.balance,
                balanceAfter: Money.sub(mainWallet.balance, amount),
                status: 'COMPLETED',
                metadata: { assetId: id, installmentId: nextPayment.id }
            });
        });

        res.json({ message: 'Installment paid successfully' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Payment failed' });
    }
};

export const sellAsset = async (req: any, res: any) => {
    const userId = req.user?.id;
    const { assetId, amount } = req.body;
    const sellAmount = Money.from(amount);

    try {
        const mainWallet = await prisma.wallet.findUnique({ 
            where: { userId_type: { userId, type: 'MAIN' } } 
        });

        await prisma.$transaction(async (tx: any) => {
            await tx.wallet.update({
                where: { id: mainWallet.id },
                data: { balance: { increment: sellAmount } }
            });

            await ledgerService.recordEntry(tx, {
                userId,
                walletId: mainWallet.id,
                actionType: 'RETURN',
                amount: sellAmount,
                currency: 'USD',
                referenceId: `SL-${randomUUID().substring(0,8).toUpperCase()}`,
                source: 'INVESTMENT',
                balanceBefore: mainWallet.balance, 
                balanceAfter: Money.add(mainWallet.balance, sellAmount),
                status: 'COMPLETED'
            });
        });

        res.json({ message: 'Asset sold successfully' });
    } catch (e) {
        res.status(500).json({ message: 'Error processing sale' });
    }
};
