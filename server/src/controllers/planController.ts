import { Request, Response } from 'express';
// @ts-ignore
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getPlans = async (req: any, res: any) => {
  try {
    const count = await prisma.investmentPlan.count();
    if (count === 0) {
      await seedPlans();
    }
    const plans = await prisma.investmentPlan.findMany();
    // Parse JSON fields
    const formatted = plans.map((p: any) => ({
      ...p,
      allocation: JSON.parse(p.allocation)
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching plans' });
  }
};

export const subscribePlan = async (req: any, res: any) => {
  const userId = req.user?.id;
  const { planId } = req.body;
  
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { planId }
    });
    res.json({ message: 'Plan updated successfully', planId: user.planId });
  } catch (error) {
    res.status(500).json({ message: 'Error updating plan' });
  }
};

const seedPlans = async () => {
  const plans = [
    {
      name: 'Preservation Core',
      riskLevel: 'Low',
      targetRoi: '6-8%',
      minInvestment: 10000,
      lockupPeriod: '12 Months',
      allocation: JSON.stringify({ "Gold": 40, "Real Estate": 40, "Cash": 20 }),
      description: 'Focused on wealth preservation and inflation hedging using tangible assets with low volatility.'
    },
    {
      name: 'Balanced Yield',
      riskLevel: 'Medium',
      targetRoi: '10-14%',
      minInvestment: 25000,
      lockupPeriod: '36 Months',
      allocation: JSON.stringify({ "Real Estate": 50, "Art": 30, "Private Credit": 20 }),
      description: 'A hybrid strategy targeting consistent cash flow from real estate combined with moderate appreciation.'
    },
    {
      name: 'Alpha Growth',
      riskLevel: 'High',
      targetRoi: '18-25%',
      minInvestment: 50000,
      lockupPeriod: '5-7 Years',
      allocation: JSON.stringify({ "Art": 40, "Collectibles": 30, "Venture Equity": 30 }),
      description: 'Aggressive capital appreciation targeting asymmetric upside in emerging artists and rare artifacts.'
    }
  ];

  for (const p of plans) {
    // @ts-ignore
    await prisma.investmentPlan.create({ data: p });
  }
};