import { Request, Response } from 'express';
// @ts-ignore
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllInvestments = async (req: any, res: any) => {
  try {
    const count = await prisma.investment.count();
    if (count === 0) {
      await seedInvestments();
    }

    const investments = await prisma.investment.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(investments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching investments' });
  }
};

export const getInvestmentById = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const investment = await prisma.investment.findUnique({
      where: { id }
    });
    if (!investment) return res.status(404).json({ message: 'Not found' });
    res.json(investment);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching investment' });
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
      scenarios: JSON.stringify({ conservative: 8, moderate: 14.5, aggressive: 22 })
    },
    {
      ticker: 'ART-WAR-067',
      title: 'Warhol "Marilyn" Series',
      category: 'Fine Art',
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
      scenarios: JSON.stringify({ conservative: 5, moderate: 18.2, aggressive: 35 })
    },
    {
      ticker: 'ALT-FER-250',
      title: '1962 Ferrari 250 GTO',
      category: 'Luxury Vehicles',
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
      scenarios: JSON.stringify({ conservative: -5, moderate: 24, aggressive: 45 })
    },
    {
      ticker: 'SPC-ORB-001',
      title: 'Low-Earth Orbit Network',
      category: 'Space Infra',
      fundStrategy: 'Infrastructure Growth',
      description: 'Equity stake in a constellation of 50 nanosatellites providing global maritime data coverage.',
      price: '$25,000',
      minInvestment: 25000,
      returnRate: '21.5%',
      targetIrp: 21.5,
      term: '7 Years',
      riskLevel: 'High',
      status: 'ACTIVE',
      imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1600',
      scenarios: JSON.stringify({ conservative: -10, moderate: 21.5, aggressive: 55 })
    },
    {
      ticker: 'AI-DAT-CAL',
      title: 'Silicon Valley Data Center',
      category: 'AI Infra',
      fundStrategy: 'Yield + Growth',
      description: 'Tier 4 data center facility leased to major AI research labs. Long-term triple net lease.',
      price: '$50,000',
      minInvestment: 50000,
      returnRate: '12.8%',
      targetIrp: 12.8,
      term: '5 Years',
      riskLevel: 'Medium',
      status: 'ACTIVE',
      imageUrl: 'https://images.unsplash.com/photo-1558494949-ef526b01201b?q=80&w=1600',
      scenarios: JSON.stringify({ conservative: 8, moderate: 12.8, aggressive: 18 })
    },
    {
      ticker: 'CRB-AMZ-09',
      title: 'Amazonian Carbon Project',
      category: 'Carbon Credits',
      fundStrategy: 'Sustainability',
      description: 'Verified Carbon Standard (VCS) project covering 50,000 hectares. High demand from Fortune 500 net-zero pledges.',
      price: '$10,000',
      minInvestment: 10000,
      returnRate: '16.5%',
      targetIrp: 16.5,
      term: '10 Years',
      riskLevel: 'Medium',
      status: 'ACTIVE',
      imageUrl: 'https://images.unsplash.com/photo-1440342359726-591831b254d1?q=80&w=1600',
      scenarios: JSON.stringify({ conservative: 5, moderate: 16.5, aggressive: 28 })
    },
    {
      ticker: 'NRG-SOL-SPN',
      title: 'Andalusian Solar Farm',
      category: 'Renewable Energy',
      fundStrategy: 'Stable Yield',
      description: 'Operational 50MW solar photovoltaic plant in Southern Spain with government-backed power purchase agreement.',
      price: '$20,000',
      minInvestment: 20000,
      returnRate: '9.2%',
      targetIrp: 9.2,
      term: '15 Years',
      riskLevel: 'Low',
      status: 'ACTIVE',
      imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1600',
      scenarios: JSON.stringify({ conservative: 6, moderate: 9.2, aggressive: 11 })
    },
    {
      ticker: 'MUS-RCK-80',
      title: 'Legends of Rock Catalog',
      category: 'Music Royalties',
      fundStrategy: 'Cash Flow',
      description: 'Ownership of master recording rights for a portfolio of 3 top-charting 1980s rock bands. Consistent streaming revenue.',
      price: '$15,000',
      minInvestment: 15000,
      returnRate: '11.0%',
      targetIrp: 11.0,
      term: 'Perpetual',
      riskLevel: 'Medium',
      status: 'ACTIVE',
      imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1600',
      scenarios: JSON.stringify({ conservative: 7, moderate: 11, aggressive: 15 })
    },
    {
      ticker: 'COL-GAT-01',
      title: 'First Edition "Gatsby"',
      category: 'Rare Collectibles',
      fundStrategy: 'Appreciation',
      description: 'Immaculate 1925 first edition of The Great Gatsby with original dust jacket. Only 5 known copies in this condition.',
      price: '$75,000',
      minInvestment: 75000,
      returnRate: '13.5%',
      targetIrp: 13.5,
      term: '3-5 Years',
      riskLevel: 'Medium',
      status: 'ACTIVE',
      imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1600',
      scenarios: JSON.stringify({ conservative: 2, moderate: 13.5, aggressive: 25 })
    },
    {
      ticker: 'NFT-PUNK-IDX',
      title: 'CryptoPunks Blue Index',
      category: 'NFTs',
      fundStrategy: 'Digital Momentum',
      description: 'Fractional ownership of a basket containing 3 Zombie and 1 Ape CryptoPunk. High volatility, high upside.',
      price: '$5,000',
      minInvestment: 5000,
      returnRate: '35.0%',
      targetIrp: 35.0,
      term: '2 Years',
      riskLevel: 'High',
      status: 'ACTIVE',
      imageUrl: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1600',
      scenarios: JSON.stringify({ conservative: -30, moderate: 35, aggressive: 120 })
    },
    {
      ticker: 'CRE-PVT-DBT',
      title: 'Global Tech Venture Debt',
      category: 'Private Credit',
      fundStrategy: 'Fixed Income',
      description: 'Senior secured loans to Series C+ technology companies. Short duration, high coupon.',
      price: '$100,000',
      minInvestment: 100000,
      returnRate: '14.0%',
      targetIrp: 14.0,
      term: '24 Months',
      riskLevel: 'Medium',
      status: 'ACTIVE',
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1600',
      scenarios: JSON.stringify({ conservative: 10, moderate: 14, aggressive: 16 })
    }
  ];

  for (const item of data) {
    const exists = await prisma.investment.findUnique({ where: { ticker: item.ticker } });
    if (!exists) {
        // @ts-ignore
        await prisma.investment.create({ data: item });
    }
  }
};