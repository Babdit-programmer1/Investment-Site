
import { Investment, InvestmentIntent, Wallet, InvestmentPlan, InvestorStatement } from '../types';

export const MOCK_INVESTMENTS: Investment[] = [
  {
    id: '1',
    ticker: 'RE-LND',
    title: 'The Kensington Estate',
    category: 'Real Estate',
    fundStrategy: 'Capital Appreciation',
    description: 'A prime residential block in the heart of London, offering high yields through short-term luxury rentals.',
    imageUrl: 'https://images.unsplash.com/photo-1600607687940-472002695530?q=80&w=1600',
    price: '12500000',
    minInvestment: 50000,
    returnRate: '14.5%',
    targetIrp: 14.5,
    term: '36 Months',
    riskLevel: 'Low',
    status: 'ACTIVE',
    scenarios: { conservative: 8, moderate: 14.5, aggressive: 18 }
  },
  {
    id: '2',
    ticker: 'ART-BSQ',
    title: 'Basquiat: Untitled (1982)',
    category: 'Fine Art',
    fundStrategy: 'Value Add',
    description: 'An iconic neo-expressionist piece by Jean-Michel Basquiat. Historically appreciates 12% annually.',
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1600',
    price: '8500000',
    minInvestment: 25000,
    returnRate: '18.2%',
    targetIrp: 18.2,
    term: '5 Years',
    riskLevel: 'Medium',
    status: 'ACTIVE',
    scenarios: { conservative: 10, moderate: 18, aggressive: 25 }
  },
  {
    id: '3',
    ticker: 'CAR-FER',
    title: '1962 Ferrari 250 GTO',
    category: 'Luxury Vehicles',
    fundStrategy: 'Preservation',
    description: 'The holy grail of car collecting. Only 36 were ever made. A stable asset for turbulent markets.',
    imageUrl: 'https://images.unsplash.com/photo-1517398823963-c2dc6fc3e837?q=80&w=1600',
    price: '48000000',
    minInvestment: 100000,
    returnRate: '11.0%',
    targetIrp: 11.0,
    term: '7 Years',
    riskLevel: 'Low',
    status: 'ACTIVE',
    scenarios: { conservative: 5, moderate: 11, aggressive: 15 }
  }
];

export const MOCK_WALLET = {
    id: 'wallet-1',
    fiatBalance: 250000,
    investmentBalance: 75000,
    cryptoBalances: [],
    transactions: [
        { id: '1', actionType: 'DEPOSIT', amount: 300000, currency: 'USD', referenceId: 'DEP-001', status: 'COMPLETED', createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
        { id: '2', actionType: 'INVESTMENT', amount: 50000, currency: 'USD', referenceId: 'INV-001', status: 'COMPLETED', createdAt: new Date(Date.now() - 86400000 * 2).toISOString() }
    ]
};

export const MOCK_PORTFOLIO: InvestmentIntent[] = [
    {
        id: 'p-1',
        userId: 'u-1',
        assetId: '1',
        amount: 50000,
        currency: 'USD',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        asset: MOCK_INVESTMENTS[0]
    }
];

export const MOCK_LOGS = [
    { id: '1', actionType: 'DEPOSIT', amount: 300000, referenceId: 'DEP-001', status: 'COMPLETED', createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
    { id: '2', actionType: 'INVESTMENT', amount: 50000, referenceId: 'INV-001', status: 'COMPLETED', createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: '3', actionType: 'PROFIT', amount: 1200, referenceId: 'DIV-001', status: 'COMPLETED', createdAt: new Date().toISOString() }
];

export const MOCK_PLANS: InvestmentPlan[] = [
    {
      id: 'plan-1',
      name: 'Preservation Core',
      riskLevel: 'Low',
      targetRoi: '6-8%',
      minInvestment: 10000,
      lockupPeriod: '3 Months',
      allocation: { "Gold": 40, "Real Estate": 40, "Cash": 20 },
      description: 'Focused on wealth preservation and inflation hedging using tangible assets with low volatility.'
    },
    {
      id: 'plan-2',
      name: 'Balanced Yield',
      riskLevel: 'Medium',
      targetRoi: '10-14%',
      minInvestment: 25000,
      lockupPeriod: '6-9 Months',
      allocation: { "Real Estate": 50, "Art": 30, "Private Credit": 20 },
      description: 'A hybrid strategy targeting consistent cash flow from real estate combined with moderate appreciation.'
    },
    {
      id: 'plan-3',
      name: 'Alpha Growth',
      riskLevel: 'High',
      targetRoi: '18-25%',
      minInvestment: 50000,
      lockupPeriod: '12 Months',
      allocation: { "Art": 40, "Collectibles": 30, "Venture Equity": 30 },
      description: 'Aggressive capital appreciation targeting asymmetric upside in emerging artists and rare artifacts.'
    }
];

export const MOCK_NOTIFICATIONS = [
    { id: '1', title: 'Welcome', message: 'Account verification pending', type: 'INFO', read: false, createdAt: new Date().toISOString() },
    { id: '2', title: 'Market Update', message: 'Real Estate assets up 2.4% this quarter', type: 'SUCCESS', read: false, createdAt: new Date().toISOString() }
];

export const MOCK_STATEMENTS: InvestorStatement[] = [
    {
        id: 'stmt-1',
        period: 'October 2023',
        generatedAt: new Date().toISOString(),
        totalInvested: 50000,
        currentValue: 51200,
        roi: 2.4,
        content: {
            assets: [
                { ticker: 'RE-LND', title: 'The Kensington Estate', category: 'Real Estate', value: 51200 }
            ]
        }
    }
];

export const MOCK_ADMIN_STATS = {
    totalUsers: 142,
    totalAssets: 12,
    totalAum: 54000000,
    platformInflow: 2500000,
    platformOutflow: 120000,
    activeInvestments: 89,
    pendingDeposits: 3,
    pendingWithdrawals: 1
};

export const MOCK_USERS = [
    { id: 'u-1', fullName: 'John Doe', email: 'investor@example.com', kycStatus: 'APPROVED' },
    { id: 'u-2', fullName: 'Alice Smith', email: 'alice@example.com', kycStatus: 'PENDING' }
];
