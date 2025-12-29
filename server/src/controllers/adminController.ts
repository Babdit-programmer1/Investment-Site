import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalAssets = await prisma.investment.count();
    // Calculate pseudo AUM (e.g. sum of all portfolio investments)
    const portfolioSum = await prisma.userPortfolio.aggregate({
      _sum: { amount: true }
    });
    
    // Recent activity (new users)
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, fullName: true, email: true, createdAt: true, kycStatus: true }
    });

    (res as any).json({
      totalUsers,
      totalAssets,
      totalAum: portfolioSum._sum.amount || 0,
      activeInvestments: 0, // Placeholder or count active deals
      recentActivity: recentUsers
    });
  } catch (error) {
    console.error(error);
    (res as any).status(500).json({ message: 'Error fetching admin stats' });
  }
};

export const getInvestors = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { 
        id: true, fullName: true, email: true, 
        investorType: true, kycStatus: true, onboardingCompleted: true 
      }
    });
    (res as any).json(users);
  } catch (error) {
    (res as any).status(500).json({ message: 'Error fetching investors' });
  }
};

export const verifyInvestor = async (req: Request, res: Response) => {
  const { id } = (req as any).params;
  try {
    const user = await prisma.user.update({
      where: { id },
      data: { kycStatus: 'APPROVED' }
    });
    (res as any).json(user);
  } catch (error) {
    (res as any).status(500).json({ message: 'Error verifying investor' });
  }
};

export const createAsset = async (req: Request, res: Response) => {
  try {
    const asset = await prisma.investment.create({
      data: (req as any).body
    });
    (res as any).status(201).json(asset);
  } catch (error) {
    (res as any).status(500).json({ message: 'Error creating asset' });
  }
};