
export type Role = 'USER' | 'ADMIN';
export type KycStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type InvestmentStatus = 'ACTIVE' | 'CLOSED' | 'UPCOMING' | 'PAST_DUE' | 'MATURED';
export type PaymentStatus = 'PENDING' | 'ESCROWED' | 'ACTIVE' | 'REFUNDED' | 'REJECTED' | 'PAID' | 'LATE';
export type InvestmentType = 'ONE_TIME' | 'MONTHLY';

export enum ChatRole {
  USER = 'user',
  MODEL = 'model'
}

export interface AdminLog {
  id: string;
  adminId: string;
  actionType: string; // APPROVE_DEPOSIT, ADJUST_WALLET, etc.
  targetId?: string; // User ID, Wallet ID, etc.
  targetType?: string; // USER, WALLET, INVESTMENT
  amount?: number;
  currency?: string;
  details?: string; // JSON string for metadata
  ipAddress?: string;
  createdAt: string;
  admin?: { fullName: string; email: string };
}

export interface Investment {
  id: string;
  ticker: string;
  title: string;
  category: string;
  fundStrategy: string;
  description: string;
  imageUrl: string;
  price: string;
  minInvestment: number;
  returnRate: string;
  targetIrp: number;
  term: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  status: InvestmentStatus;
  scenarios: {
    conservative: number;
    moderate: number;
    aggressive: number;
  };
}

export interface InvestmentPlan {
  id: string;
  name: string;
  category?: string; // Added category
  riskLevel: string;
  targetRoi: string;
  minInvestment: number;
  lockupPeriod: string;
  allocation: Record<string, any>; // Changed to any to support storing category in backend JSON
  description: string;
}

export interface InvestorStatement {
  id: string;
  period: string;
  generatedAt: string;
  totalInvested: number;
  currentValue: number;
  roi: number;
  content: {
    assets: Array<{
      ticker: string;
      title: string;
      category: string;
      value: number;
    }>
  };
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  country: string;
  role: Role;
  investorType: 'Individual' | 'High Net Worth' | 'Institutional';
  interests: string[];
  onboardingCompleted: boolean;
  kycStatus: KycStatus;
  joinedDate: string;
  planId?: string;
  profileData?: any; // Stores phone, preferences, and extended attributes
}

export interface MonthlyPayment {
  id: string;
  portfolioId: string;
  amount: number;
  dueDate: string;
  paidAt?: string;
  status: PaymentStatus;
}

export interface InvestmentIntent {
  id: string;
  userId: string;
  assetId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentReference?: string;
  gateway?: string;
  createdAt: string;
  asset?: Investment;
  user?: UserProfile;
  // New Fields for Monthly Plans
  investmentType?: InvestmentType;
  monthlyAmount?: number;
  durationMonths?: number;
  monthsPaid?: number;
  nextPaymentDate?: string;
  payments?: MonthlyPayment[];
}

export interface WalletTransaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'INVEST' | 'RETURN' | 'INVESTMENT_TOP_UP' | 'MONTHLY_INVESTMENT_PAYMENT' | 'ADMIN_CREDIT' | 'ADMIN_DEBIT' | 'DEPOSIT_APPROVED' | 'DEPOSIT_REJECTED' | 'WITHDRAWAL_APPROVED' | 'WITHDRAWAL_REJECTED';
  amount: number;
  currency: string;
  reference: string;
  status: string;
  createdAt: string;
}

export interface CryptoBalance {
  id: string;
  asset: string;
  balance: number;
}

export interface Wallet {
  id: string;
  fiatBalance: number;
  cryptoBalances: CryptoBalance[];
  transactions: WalletTransaction[];
}

export interface ChatMessage {
  role: ChatRole | 'user' | 'model';
  text: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  imageUrl: string;
  bio: string;
}

export interface BlogPost {
  id: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  imageUrl: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}
