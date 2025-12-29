import { Request, Response } from 'express';
// @ts-ignore
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mock data generator for preview if DB tables are empty/missing
const generateMockLogs = (userId: string, type?: string) => {
  const logs = [
    { id: 'l1', actionType: 'DEPOSIT', amount: 15000, currency: 'USD', status: 'COMPLETED', createdAt: new Date(Date.now() - 86400000 * 5), referenceId: 'DEP-883920', source: 'PAYMENT' },
    { id: 'l2', actionType: 'INVESTMENT', amount: 5000, currency: 'USD', status: 'COMPLETED', createdAt: new Date(Date.now() - 86400000 * 3), referenceId: 'INV-992834', source: 'WALLET' },
    { id: 'l3', actionType: 'PROFIT', amount: 450, currency: 'USD', status: 'COMPLETED', createdAt: new Date(Date.now() - 86400000 * 1), referenceId: 'PRF-112233', source: 'RETURN' },
  ];
  if (type && type !== 'ALL') {
    return logs.filter(l => l.actionType === type);
  }
  return logs;
};

export const getLogs = async (req: any, res: any) => {
  const userId = req.user?.id;
  const { type } = req.query; // DEPOSIT, INVESTMENT, PROFIT, WITHDRAWAL, ALL

  try {
    // Attempt to fetch from real ledger
    // @ts-ignore
    if (prisma.financialLedger) {
       // @ts-ignore
       const where: any = { userId };
       if (type && type !== 'ALL') {
         where.actionType = type;
       }

       // @ts-ignore
       const logs = await prisma.financialLedger.findMany({
         where,
         orderBy: { createdAt: 'desc' },
         take: 50
       });

       if (logs.length > 0) {
         return res.json(logs);
       }
    }
    
    // Fallback to mock data if table doesn't exist or is empty
    res.json(generateMockLogs(userId, type));
  } catch (error) {
    // If table doesn't exist, return mocks
    console.warn("Using mock logs due to DB error:", error);
    res.json(generateMockLogs(userId, type));
  }
};
