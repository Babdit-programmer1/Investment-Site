import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllInvestments = async (req: Request, res: Response) => {
  try {
    // Auto-seed if empty (Demo convenience)
    const count = await prisma.investment.count();
    if (count === 0) {
      await seedInvestments();
    }

    const investments = await prisma.investment.findMany({
      orderBy: { createdAt: 'desc' }
    });
    (res as any).json(investments);
  } catch (error) {
    console.error(error);
    (res as any).status(500).json({ message: 'Error fetching investments' });
  }
};

export const getInvestmentById = async (req: Request, res: Response) => {
  try {
    const investment = await prisma.investment.findUnique({
      where: { id: (req as any).params.id }
    });
    if (!investment) return (res as any).status(404).json({ message: 'Not found' });
    (res as any).json(investment);
  } catch (error) {
    (res as any).status(500).json({ message: 'Error fetching investment' });
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
      price: '$50,000',
      minInvestment: 50000,
      returnRate: '14.5%',
      targetIrp: 14.5,
      term: '36 Months',
      riskLevel: 'Low',
      status: 'ACTIVE',
      imageUrl: 'https://images.unsplash.com/photo-1600596542815-e328701102b9?q=80&w=1600',
      scenarios: { conservative: 8, moderate: 14.5, aggressive: 22 }
    },
    {
      ticker: 'ART-WAR-067',
      title: 'Warhol "Marilyn" Series',
      category: 'Art',
      fundStrategy: 'Capital Appreciation',
      description: 'Blue-chip pop art asset. Warhol market index has outperformed S&P 500 by 120% over the last 15 years.',
      price: '$100,000',
      minInvestment: 100000,
      returnRate: '18.2%',
      targetIrp: 18.2,
      term: '5-7 Years',
      riskLevel: 'Medium',
      status: 'ACTIVE',
      imageUrl: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?q=80&w=1600',
      scenarios: { conservative: 5, moderate: 18.2, aggressive: 35 }
    },
    {
      ticker: 'ALT-FER-250',
      title: '1962 Ferrari 250 GTO',
      category: 'Alternative',
      fundStrategy: 'Aggressive Growth',
      description: 'The "Holy Grail" of automotive investing. 1 of 36. Historical CAGR of 15% over the last 30 years.',
      price: '$500,000',
      minInvestment: 500000,
      returnRate: '24.0%',
      targetIrp: 24.0,
      term: '5-10 Years',
      riskLevel: 'High',
      status: 'ACTIVE',
      imageUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c698d2?q=80&w=1600',
      scenarios: { conservative: -5, moderate: 24, aggressive: 45 }
    }
  ];

  for (const item of data) {
    // @ts-ignore
    await prisma.investment.create({ data: item });
  }
};