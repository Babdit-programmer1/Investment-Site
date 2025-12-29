import { Request, Response } from 'express';
// @ts-ignore
import { PrismaClient, Prisma } from '@prisma/client';
import { kycService } from '../services/kycService';
import { custodyService } from '../services/custodyService';

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
    const pendingKyc = await prisma.user.count({ where: { kycStatus: 'PENDING' } });

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
      pendingKyc,
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
        investorType: true, kycStatus: true, onboardingCompleted: true,
        profileData: true 
      }
    });
    
    // Augment with Risk Scores
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
    
    await kycService.logComplianceAction(id, 'KYC_APPROVED', adminId, 'Manual verification via Admin Panel');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error verifying investor' });
  }
};

export const rejectInvestor = async (req: any, res: any) => {
    const { id } = req.params;
    const adminId = req.user?.id;
    const { reason } = req.body;

    try {
        const user = await prisma.user.update({
            where: { id },
            data: { kycStatus: 'REJECTED' }
        });
        
        await kycService.logComplianceAction(id, 'KYC_REJECTED', adminId, reason || 'Docs unclear');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error rejecting investor' });
    }
};

export const createAsset = async (req: any, res: any) => {
  try {
    const { scenarios, ...rest } = req.body;
    const asset = await prisma.investment.create({
      data: {
        ...rest,
        scenarios: JSON.stringify(scenarios)
      }
    });
    res.status(201).json(asset);
  } catch (error) {
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
    await prisma.$transaction(async (tx: any) => {
      await tx.investmentIntent.update({
        where: { id },
        data: { status: 'ACTIVE' }
      });
      await tx.escrowLedger.update({
        where: { intentId: id },
        data: { released: true, releasedAt: new Date() }
      });
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
    res.json({ message: 'Investment approved.' });
  } catch (error) {
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
    res.json({ message: 'Investment rejected and refunded.' });
  } catch (error) {
    res.status(500).json({ message: 'Error refunding investment' });
  }
};

// Custody & Treasury
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
        // Fetch all Ledger entries that are withdrawals and pending approval
        const requests = await prisma.financialLedger.findMany({
            where: { 
                actionType: 'WITHDRAWAL', 
                status: 'PENDING_APPROVAL' 
            },
            include: { user: { select: { email: true, fullName: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(requests);
    } catch (e) {
        // Fallback for preview if table structure mismatch
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