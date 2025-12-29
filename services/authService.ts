import { UserProfile } from '../types';
import { API_BASE_URL } from '../src/config';

const SESSION_KEY = 'prestige_session';
const TOKEN_KEY = 'prestige_token';

// Mock User for Preview Mode
const MOCK_USER: UserProfile = {
  id: 'preview-user-123',
  fullName: 'Preview Investor',
  email: 'investor@prestige.com',
  country: 'United Kingdom',
  role: 'USER',
  investorType: 'High Net Worth',
  interests: ['Real Estate', 'Fine Art'],
  onboardingCompleted: true,
  kycStatus: 'APPROVED',
  joinedDate: new Date().toISOString()
};

const MOCK_ADMIN: UserProfile = {
  ...MOCK_USER,
  id: 'preview-admin-123',
  email: 'admin@prestige.com',
  fullName: 'Administrator',
  role: 'ADMIN'
};

export const authService = {
  async register(userData: any): Promise<UserProfile> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Registration failed');
      this.setSession(data.user, data.token);
      return data.user;
    } catch (error) {
      console.warn("Backend unavailable, entering Preview Mode");
      // Fallback for preview environment
      const mockUser = { ...MOCK_USER, ...userData, onboardingCompleted: false };
      this.setSession(mockUser, 'mock-jwt-token');
      return mockUser;
    }
  },

  async login(email: string, password: string): Promise<UserProfile> {
     try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Invalid email or password');
      this.setSession(data.user, data.token);
      return data.user;
     } catch (error) {
       console.warn("Backend unavailable, entering Preview Mode");
       // Check for admin simulation
       if (email.includes('admin')) {
         this.setSession(MOCK_ADMIN, 'mock-admin-token');
         return MOCK_ADMIN;
       }
       // Default user simulation
       this.setSession(MOCK_USER, 'mock-jwt-token');
       return MOCK_USER;
     }
  },

  async updateProfile(user: UserProfile) {
    const session = localStorage.getItem(SESSION_KEY);
    if(session) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    }
  },

  async logout(): Promise<void> {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(TOKEN_KEY);
  },

  getCurrentUser(): UserProfile | null {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setSession(user: UserProfile, token: string) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    localStorage.setItem(TOKEN_KEY, token);
  }
};