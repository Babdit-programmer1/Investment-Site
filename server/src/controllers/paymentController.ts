import { Request, Response } from 'express';
// @ts-ignore
import { PrismaClient } from '@prisma/client';
import { paymentService } from '../services/paymentService';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export const initiateInvestment = async (req: any, res: any) => {
  const userId = req.user?.id;
  const { assetId, amount, gateway = 'PAYSTACK' } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Validate Asset
    const asset = await prisma.investment.findUnique({ where: { id: assetId } });
    if (!asset) return res.status(404).json({ message: 'Asset not found' });
    if (amount < asset.minInvestment) {
      return res.status(400).json({ message: `Minimum investment is $${asset.minInvestment.toLocaleString()}` });
    }

    // Create Intent
    const reference = uuidv4();
    const intent = await prisma.investmentIntent.create({
      data: {
        userId,
        assetId,
        amount,
        currency: 'USD',
        status: 'PENDING',
        gateway,
        paymentReference: reference
      }
    });

    // Initiate Gateway Payment
    const paymentResponse = await paymentService.initiatePayment(gateway, {
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
  const { reference } = req.body;
  
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