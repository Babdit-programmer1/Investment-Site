
import { Request, Response } from 'express';
// @ts-ignore
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import { Money } from '../utils/money';
import { ledgerService } from '../services/ledgerService';

const prisma = new PrismaClient();

export const getAllInvestments = async (req: any, res: any) => {
  try {
    const count = await prisma.investment.count();
    if (count === 0) {
      await seedInvestments();
    }

    const investments = await prisma.investment.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    // Convert Decimals to Number/String for frontend
    const mapped = investments.map((inv: any) => ({
        ...inv,
        minInvestment: Money.toNumber(inv.minInvestment),
        price: inv.price ? Money.toNumber(inv.price) : 0,
        targetIrp: inv.targetIrp ? Money.toNumber(inv.targetIrp) : 0
    }));

    res.json(mapped);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching investments' });
  }
};

export const getInvestmentById = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const investment = await prisma.investment.findUnique({
      where: { id }
    });
    if (!investment) return res.status(404).json({ message: 'Not found' });
    
    const mapped = {
        ...investment,
        minInvestment: Money.toNumber(investment.minInvestment),
        price: investment.price ? Money.toNumber(investment.price) : 0,
        targetIrp: investment.targetIrp ? Money.toNumber(investment.targetIrp) : 0
    };
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching investment' });
  }
};

/**
 * Top Up an Active Investment
 * Increases principal, deducts wallet, maintains ACTIVE status
 */
export const topUpInvestment = async (req: any, res: any) => {
    const userId = req.user?.id;
    const { id } = req.params; // Asset ID (User wants to top up their holding of this asset)
    const { amount } = req.body;
    const topUpAmount = Money.from(amount);

    if (topUpAmount.lte(0)) return res.status(400).json({ message: "Invalid amount" });

    try {
        // Find the specific portfolio entry for this user and asset
        const portfolio = await prisma.portfolio.findFirst({
            where: { userId, assetId: id, status: 'ACTIVE' }
        });

        if (!portfolio) {
            return res.status(404).json({ message: 'Active investment not found for this asset.' });
        }

        if (portfolio.status === 'MATURED' || portfolio.status === 'CLOSED') {
            return res.status(400).json({ message: 'Cannot top up a closed or matured investment.' });
        }

        // Check Wallet
        const mainWallet = await prisma.wallet.findUnique({ where: { userId_type: { userId, type: 'MAIN' } } });
        if (!mainWallet || Money.lt(mainWallet.balance, topUpAmount)) {
            return res.status(400).json({ message: 'Insufficient funds.' });
        }

        const ref = `TOP-${randomUUID().substring(0,8).toUpperCase()}`;

        await prisma.$transaction(async (tx: any) => {
            // 1. Debit Main Wallet
            await tx.wallet.update({
                where: { id: mainWallet.id },
                data: { balance: { decrement: topUpAmount } }
            });

            // 2. Credit Investment Wallet
            const invWallet = await tx.wallet.findUnique({ where: { userId_type: { userId, type: 'INVESTMENT' } } });
            await tx.wallet.update({
                where: { id: invWallet.id },
                data: { balance: { increment: topUpAmount } }
            });

            // 3. Update Portfolio Principal
            await tx.portfolio.update({
                where: { id: portfolio.id },
                data: { amount: { increment: topUpAmount } }
            });

            // 4. Ledger Entry
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

/**
 * Pay Monthly Installment
 * Pays a specific scheduled payment for a monthly plan
 */
export const payMonthlyInstallment = async (req: any, res: any) => {
    const userId = req.user?.id;
    const { id } = req.params; // Asset ID or Portfolio ID? Let's assume Asset ID for consistency, lookup portfolio.
    
    try {
        const portfolio = await prisma.portfolio.findFirst({
            where: { userId, assetId: id, type: 'MONTHLY' },
            include: { payments: { where: { status: 'UNPAID' }, orderBy: { dueDate: 'asc' }, take: 1 } }
        });

        if (!portfolio) return res.status(404).json({ message: 'Monthly plan not found.' });
        
        const nextPayment = portfolio.payments[0];
        if (!nextPayment) return res.status(400).json({ message: 'No pending payments found.' });

        const amount = Money.from(nextPayment.amount);

        // Check Wallet
        const mainWallet = await prisma.wallet.findUnique({ where: { userId_type: { userId, type: 'MAIN' } } });
        if (!mainWallet || Money.lt(mainWallet.balance, amount)) {
            return res.status(400).json({ message: 'Insufficient funds for installment.' });
        }

        const ref = `INS-${randomUUID().substring(0,8).toUpperCase()}`;

        await prisma.$transaction(async (tx: any) => {
            // 1. Debit Wallet
            await tx.wallet.update({
                where: { id: mainWallet.id },
                data: { balance: { decrement: amount } }
            });

            // 2. Credit Investment Wallet
            const invWallet = await tx.wallet.findUnique({ where: { userId_type: { userId, type: 'INVESTMENT' } } });
            await tx.wallet.update({
                where: { id: invWallet.id },
                data: { balance: { increment: amount } }
            });

            // 3. Mark Payment Paid
            await tx.monthlyPayment.update({
                where: { id: nextPayment.id },
                data: { status: 'PAID', paidAt: new Date() }
            });

            // 4. Update Portfolio Progress
            const updatedMonthsPaid = (portfolio.monthsPaid || 0) + 1;
            const updates: any = { 
                amount: { increment: amount }, // Actual invested capital increases
                monthsPaid: updatedMonthsPaid,
                status: 'ACTIVE' // Reset PAST_DUE if applicable
            };

            // Check if plan is complete
            if (portfolio.durationMonths && updatedMonthsPaid >= portfolio.durationMonths) {
                updates.status = 'MATURED'; // Or just ready for ROI
            }

            await tx.portfolio.update({
                where: { id: portfolio.id },
                data: updates
            });

            // 5. Ledger
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
        // Find MAIN Wallet
        const mainWallet = await prisma.wallet.findUnique({ 
            where: { userId_type: { userId, type: 'MAIN' } } 
        });

        await prisma.$transaction(async (tx: any) => {
            // Credit MAIN Wallet
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

const seedInvestments = async () => {
  const data = [
    {
      ticker: 'RE-LDN-001',
      title: 'The Kensington Estate',
      category: 'Real Estate',
      fundStrategy: 'Value-Add + Yield',
      description: 'Prime residential conversion in West London. Secured against inflation with projected rental yield of 5% plus capital appreciation.',
      price: 50000,
      minInvestment: 50000,
      returnRate: '14.5%',
      targetIrp: 14.5,
      term: '6-12 Months',
      riskLevel: 'Low',
      status: 'ACTIVE',
      imageUrl: 'https://images.unsplash.com/photo-1600596542815-e328701102b9?q=80&w=1600',
      scenarios: JSON.stringify({ conservative: 8, moderate: 14.5, aggressive: 22 })
    },
    {
      ticker: 'ART-WAR-067',
      title: 'Warhol "Marilyn" Series',
      category: 'Fine Art',
      fundStrategy: 'Capital Appreciation',
      description: 'Blue-chip pop art asset. Warhol market index has outperformed S&P 500 by 120% over the last 15 years.',
      price: 100000,
      minInvestment: 100000,
      returnRate: '18.2%',
      targetIrp: 18.2,
      term: '12-18 Months',
      riskLevel: 'Medium',
      status: 'ACTIVE',
      imageUrl: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?q=80&w=1600',
      scenarios: JSON.stringify({ conservative: 5, moderate: 18.2, aggressive: 35 })
    },
    {
      ticker: 'ALT-FER-250',
      title: '1962 Ferrari 250 GTO',
      category: 'Luxury Vehicles',
      fundStrategy: 'Aggressive Growth',
      description: 'The "Holy Grail" of automotive investing. 1 of 36. Historical CAGR of 15% over the last 30 years.',
      price: 500000,
      minInvestment: 500000,
      returnRate: '24.0%',
      targetIrp: 24.0,
      term: '3-6 Months',
      riskLevel: 'High',
      status: 'ACTIVE',
      imageUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c698d2?q=80&w=1600',
      scenarios: JSON.stringify({ conservative: -5, moderate: 24, aggressive: 45 })
    }
  ];

  for (const item of data) {
    const exists = await prisma.investment.findUnique({ where: { ticker: item.ticker } });
    if (!exists) {
        await prisma.investment.create({ data: item });
    }
  }
};
