
import { Request, Response } from 'express';
// @ts-ignore
import { PrismaClient, Prisma } from '@prisma/client';
import { paymentService } from '../services/paymentService';
import { randomUUID } from 'crypto';
import { ledgerService } from '../services/ledgerService';
import { riskEngine } from '../services/riskEngine';
import { Money } from '../utils/money';

const prisma = new PrismaClient();

interface InitiateInvestmentBody {
  assetId: string;
  amount: number;
  gateway?: 'PAYSTACK' | 'STRIPE' | 'SIMULATOR' | 'WALLET';
}

interface VerifyPaymentBody {
  reference: string;
}

export const initiateInvestment = async (req: any, res: any) => {
  const userId = req.user?.id;
  const { assetId, amount, gateway = 'PAYSTACK' } = req.body as InitiateInvestmentBody;
  
  // Safe Decimal Conversion
  const investAmount = Money.from(amount);

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const riskAnalysis = await riskEngine.analyzeTransaction(userId, 'INVESTMENT', Money.toNumber(investAmount), { assetId, gateway });
    if (riskAnalysis.action === 'BLOCK') {
        return res.status(403).json({ message: 'Investment blocked by risk engine.', reasons: riskAnalysis.reasons });
    }

    const asset = await prisma.investment.findUnique({ where: { id: assetId } });
    if (!asset) return res.status(404).json({ message: 'Asset not found' });
    
    // Decimal Comparison
    if (investAmount.lessThan(asset.minInvestment)) {
      return res.status(400).json({ message: `Minimum investment is $${Money.toNumber(asset.minInvestment).toLocaleString()}` });
    }

    if (gateway === 'WALLET') {
        const wallet = await prisma.wallet.findUnique({ where: { userId } });
        // Decimal Comparison for Balance Check
        if (!wallet || Money.lt(wallet.fiatBalance, investAmount)) {
            return res.status(400).json({ message: 'Insufficient wallet balance' });
        }

        const status = riskAnalysis.action === 'REVIEW' ? 'PENDING_APPROVAL' : 'ESCROWED';

        const result = await prisma.$transaction(async (tx: any) => {
            const balanceBefore = Money.from(wallet.fiatBalance);
            const ref = `WAL-${randomUUID()}`;

            const updatedWallet = await tx.wallet.update({
                where: { id: wallet.id },
                data: { fiatBalance: { decrement: investAmount } } // Safe atomic decrement
            });
            
            await tx.walletTransaction.create({
                data: {
                    walletId: wallet.id,
                    type: 'INVEST',
                    amount: investAmount,
                    currency: 'USD',
                    reference: `INV-${randomUUID().substring(0,8).toUpperCase()}`,
                    status: 'COMPLETED'
                }
            });

            const intent = await tx.investmentIntent.create({
                data: {
                    userId: userId!,
                    assetId,
                    amount: investAmount,
                    currency: 'USD',
                    status: status === 'PENDING_APPROVAL' ? 'PENDING' : 'ESCROWED',
                    gateway: 'WALLET',
                    paymentReference: ref
                }
            });

            if (status === 'ESCROWED') {
                await tx.escrowLedger.create({
                    data: {
                        intentId: intent.id,
                        amount: investAmount,
                        currency: 'USD',
                        released: false
                    }
                });
            }

            await ledgerService.recordEntry(tx, {
              userId: userId!,
              walletId: wallet.id,
              actionType: 'INVESTMENT',
              amount: investAmount,
              currency: 'USD',
              referenceId: ref,
              source: 'WALLET',
              balanceBefore: balanceBefore,
              balanceAfter: updatedWallet.fiatBalance,
              status: status === 'ESCROWED' ? 'COMPLETED' : 'PENDING_APPROVAL',
              metadata: { assetId, riskScore: riskAnalysis.score }
            });

            return { intent, status };
        });

        if (result.status === 'PENDING_APPROVAL') {
             return res.json({
                intentId: result.intent.id,
                authorizationUrl: `${req.headers['origin']}/#/dashboard?status=pending_review`,
                reference: result.intent.paymentReference,
                message: 'Investment queued for risk review'
            });
        }

        return res.json({
            intentId: result.intent.id,
            authorizationUrl: `${req.headers['origin']}/#/dashboard?status=success`,
            reference: result.intent.paymentReference
        });
    }

    const reference = randomUUID();
    const intent = await prisma.investmentIntent.create({
      data: {
        userId: userId!,
        assetId,
        amount: investAmount,
        currency: 'USD',
        status: 'PENDING',
        gateway,
        paymentReference: reference
      }
    });

    const paymentResponse = await paymentService.initiatePayment(gateway as any, {
      email: user.email,
      amount: Money.toNumber(investAmount) * 100,
      currency: 'USD',
      reference,
      metadata: { intentId: intent.id, assetId, userId },
      callbackUrl: `${req.headers['origin']}/#/dashboard`
    });

    res.json({ 
      intentId: intent.id, 
      authorizationUrl: paymentResponse.authorization_url,
      reference: paymentResponse.reference
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to initiate investment' });
  }
};

export const verifyPayment = async (req: any, res: any) => {
  const { reference } = req.body as VerifyPaymentBody;
  
  try {
    const intent = await prisma.investmentIntent.findFirst({
      where: { paymentReference: reference }
    });

    if (!intent) return res.status(404).json({ message: 'Transaction not found' });
    if (intent.status !== 'PENDING') return res.json({ status: intent.status });

    const isValid = await paymentService.verifyPayment(intent.gateway as any, reference);

    if (isValid) {
      await prisma.$transaction(async (tx: any) => {
        await tx.investmentIntent.update({
          where: { id: intent.id },
          data: { status: 'ESCROWED' }
        });

        await tx.escrowLedger.create({
          data: {
            intentId: intent.id,
            amount: intent.amount,
            currency: intent.currency,
            released: false
          }
        });

        const wallet = await tx.wallet.findUnique({ where: { userId: intent.userId } });
        if (wallet) {
           await ledgerService.recordEntry(tx, {
              userId: intent.userId,
              walletId: wallet.id,
              actionType: 'INVESTMENT',
              amount: intent.amount,
              currency: intent.currency,
              referenceId: reference,
              source: 'PAYMENT', 
              balanceBefore: wallet.fiatBalance,
              balanceAfter: wallet.fiatBalance, 
              status: 'COMPLETED',
              metadata: { assetId: intent.assetId, notes: 'External Payment to Escrow' }
           });
        }
      });

      return res.json({ status: 'ESCROWED', message: 'Funds secured in escrow. Awaiting admin approval.' });
    } else {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Verification error' });
  }
};

export const getMyInvestments = async (req: any, res: any) => {
  const userId = req.user?.id;
  try {
    const investments = await prisma.investmentIntent.findMany({
      where: { userId },
      include: { asset: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(investments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching investments' });
  }
};
