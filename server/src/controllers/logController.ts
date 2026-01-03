
import { Request, Response } from 'express';
// @ts-ignore
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getLogs = async (req: any, res: any) => {
  const userId = req.user?.id;
  const { type } = req.query; // DEPOSIT, INVESTMENT, PROFIT, WITHDRAWAL, ALL

  try {
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

    res.json(logs);
  } catch (error) {
    console.error("Ledger: Fetch error", error);
    res.status(500).json({ message: "Failed to retrieve ledger" });
  }
};
