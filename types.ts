export type Role = 'USER' | 'ADMIN';
export type KycStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type InvestmentStatus = 'ACTIVE' | 'CLOSED' | 'UPCOMING';

export enum ChatRole {
  USER = 'user',
  MODEL = 'model'
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