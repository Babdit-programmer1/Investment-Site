import { Request, Response } from 'express';
// @ts-ignore
import { PrismaClient, Prisma } from '@prisma/client';
import { paymentService } from '../services/paymentService';
import { randomUUID } from 'crypto';
import { ledgerService } from '../services/ledgerService';

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

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Validate Asset
    const asset = await prisma.investment.findUnique({ where: { id: assetId } });
    if (!asset) return res.status(404).json({ message: 'Asset not found' });
    if (amount < asset.minInvestment) {
      return res.status(400).json({ message: `Minimum investment is $${asset.minInvestment.toLocaleString()}` });
    }

    // Handle Wallet Payment
    if (gateway === 'WALLET') {
        const wallet = await prisma.wallet.findUnique({ where: { userId } });
        if (!wallet || wallet.fiatBalance < amount) {
            return res.status(400).json({ message: 'Insufficient wallet balance' });
        }

        // Atomic: Deduct balance, Create Intent (Escrowed directly), Create Ledger
        const result = await prisma.$transaction(async (tx: any) => {
            const balanceBefore = wallet.fiatBalance;
            const ref = `WAL-${randomUUID()}`;

            // Deduct
            const updatedWallet = await tx.wallet.update({
                where: { id: wallet.id },
                data: { fiatBalance: { decrement: amount } }
            });
            
            // Transaction Record (Legacy)
            await tx.walletTransaction.create({
                data: {
                    walletId: wallet.id,
                    type: 'INVEST',
                    amount,
                    currency: 'USD',
                    reference: `INV-${randomUUID().substring(0,8).toUpperCase()}`,
                    status: 'COMPLETED'
                }
            });

            // Create Intent (Auto-Escrowed)
            const intent = await tx.investmentIntent.create({
                data: {
                    userId: userId!,
                    assetId,
                    amount,
                    currency: 'USD',
                    status: 'ESCROWED',
                    gateway: 'WALLET',
                    paymentReference: ref
                }
            });

            // Create Escrow Ledger
            await tx.escrowLedger.create({
                data: {
                    intentId: intent.id,
                    amount: amount,
                    currency: 'USD',
                    released: false
                }
            });

            // Unified Ledger Log
            await ledgerService.recordEntry(tx, {
              userId: userId!,
              walletId: wallet.id,
              actionType: 'INVESTMENT',
              amount,
              currency: 'USD',
              referenceId: ref,
              source: 'WALLET',
              balanceBefore,
              balanceAfter: updatedWallet.fiatBalance,
              status: 'COMPLETED',
              metadata: { assetId }
            });

            return intent;
        });

        // Redirect directly to dashboard as it is instant
        return res.json({
            intentId: result.id,
            authorizationUrl: `${req.headers['origin']}/#/dashboard?status=success`,
            reference: result.paymentReference
        });
    }

    // Handle External Payment (Existing Logic)
    const reference = randomUUID();
    const intent = await prisma.investmentIntent.create({
      data: {
        userId: userId!,
        assetId,
        amount,
        currency: 'USD',
        status: 'PENDING',
        gateway,
        paymentReference: reference
      }
    });

    // Initiate Gateway Payment
    const paymentResponse = await paymentService.initiatePayment(gateway as any, {
      email: user.email,
      amount: amount * 100, // Convert to minor units
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

    // Verify with gateway
    const isValid = await paymentService.verifyPayment(intent.gateway as any, reference);

    if (isValid) {
      // Move to Escrow using Atomic Transaction
      await prisma.$transaction(async (tx: any) => {
        // 1. Update Intent Status
        await tx.investmentIntent.update({
          where: { id: intent.id },
          data: { status: 'ESCROWED' }
        });

        // 2. Create Escrow Ledger Entry
        await tx.escrowLedger.create({
          data: {
            intentId: intent.id,
            amount: intent.amount,
            currency: intent.currency,
            released: false
          }
        });

        // 3. Log External Investment Deposit (This is essentially money entering the system then going to escrow)
        // We find the wallet for the user to link the record
        const wallet = await tx.wallet.findUnique({ where: { userId: intent.userId } });
        if (wallet) {
           // We don't increment wallet balance because it went straight to escrow (intent), 
           // but we log the 'INVESTMENT' action in the ledger for tracking.
           await ledgerService.recordEntry(tx, {
              userId: intent.userId,
              walletId: wallet.id,
              actionType: 'INVESTMENT',
              amount: intent.amount,
              currency: intent.currency,
              referenceId: reference,
              source: 'PAYMENT', // External payment
              balanceBefore: wallet.fiatBalance,
              balanceAfter: wallet.fiatBalance, // Unchanged as it went to escrow
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