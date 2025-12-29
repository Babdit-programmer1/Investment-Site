export interface Investment {
  id: string;
  title: string;
  ticker: string;
  category: 'Real Estate' | 'Art' | 'Jewelry' | 'Artifacts' | 'Alternative';
  price: string;
  returnRate: string;
  roiTimeframe: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  imageUrl: string;
  description: string;
  fundStrategy: string;
  scenarios: {
    conservative: number; // Percentage return
    moderate: number;
    aggressive: number;
  };
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

export enum ChatRole {
  USER = 'user',
  MODEL = 'model'
}

export interface ChatMessage {
  role: ChatRole;
  text: string;
}

// User & Auth Types
export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  country: string;
  investorType: 'Individual' | 'High Net Worth' | 'Institutional';
  interests: string[];
  joinedDate: string;
}

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}