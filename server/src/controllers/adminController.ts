import { Request, Response } from 'express';
// @ts-ignore
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboardStats = async (req: any, res: any) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalAssets = await prisma.investment.count();
    
    // Real AUM from Escrow + Portfolios
    const escrowSum = await prisma.escrowLedger.aggregate({ _sum: { amount: true } });
    const portfolioSum = await prisma.userPortfolio.aggregate({ _sum: { amount: true } });
    const totalAum = (escrowSum._sum.amount || 0) + (portfolioSum._sum.amount || 0);

    const pendingApprovals = await prisma.investmentIntent.count({ where: { status: 'ESCROWED' } });

    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, fullName: true, email: true, createdAt: true, kycStatus: true }
    });

    res.json({
      totalUsers,
      totalAssets,
      totalAum,
      activeInvestments: pendingApprovals,
      recentActivity: recentUsers
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching admin stats' });
  }
};

export const getInvestors = async (req: any, res: any) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { 
        id: true, fullName: true, email: true, 
        investorType: true, kycStatus: true, onboardingCompleted: true 
      }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching investors' });
  }
};

export const verifyInvestor = async (req: any, res: any) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.update({
      where: { id },
      data: { kycStatus: 'APPROVED' }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error verifying investor' });
  }
};

export const createAsset = async (req: any, res: any) => {
  try {
    const { scenarios, ...rest } = req.body;
    
    // Ensure scenarios is treated as a JSON object for Prisma
    const asset = await prisma.investment.create({
      data: {
        ...rest,
        scenarios: scenarios as Prisma.JsonObject
      }
    });
    res.status(201).json(asset);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating asset' });
  }
};

export const getPendingInvestments = async (req: any, res: any) => {
  try {
    const intents = await prisma.investmentIntent.findMany({
      where: { status: 'ESCROWED' },
      include: { user: true, asset: true },
      orderBy: { createdAt: 'asc' }
    });
    res.json(intents);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending investments' });
  }
};

export const approveInvestment = async (req: any, res: any) => {
  const { id } = req.params;
  try {
    const intent = await prisma.investmentIntent.findUnique({ where: { id }, include: { escrowLedger: true } });
    if (!intent || intent.status !== 'ESCROWED') {
      return res.status(400).json({ message: 'Invalid investment state' });
    }

    // Atomic Transaction: Approve Intent -> Release Escrow -> Create Portfolio Asset
    await prisma.$transaction(async (tx: any) => {
      // 1. Update Intent
      await tx.investmentIntent.update({
        where: { id },
        data: { status: 'ACTIVE' }
      });
      // 2. Mark Escrow Released
      await tx.escrowLedger.update({
        where: { intentId: id },
        data: { released: true, releasedAt: new Date() }
      });
      // 3. Add to User Portfolio
      await tx.userPortfolio.create({
        data: {
          userId: intent.userId,
          assetId: intent.assetId,
          amount: intent.amount,
          currency: intent.currency,
          type: 'ASSET',
          status: 'ACTIVE'
        }
      });
    });

    res.json({ message: 'Investment approved and funds released from escrow.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error approving investment' });
  }
};

export const refundInvestment = async (req: any, res: any) => {
  const { id } = req.params;
  try {
    const intent = await prisma.investmentIntent.findUnique({ where: { id } });
    if (!intent || intent.status !== 'ESCROWED') {
      return res.status(400).json({ message: 'Invalid investment state' });
    }

    // Atomic Transaction: Refund Intent -> Mark Escrow Refunded
    await prisma.$transaction(async (tx: any) => {
      await tx.investmentIntent.update({
        where: { id },
        data: { status: 'REFUNDED' }
      });
      await tx.escrowLedger.update({
        where: { intentId: id },
        data: { refunded: true, refundedAt: new Date() }
      });
    });

    res.json({ message: 'Investment rejected and funds refunded.' });
  } catch (error) {
    res.status(500).json({ message: 'Error refunding investment' });
  }
};