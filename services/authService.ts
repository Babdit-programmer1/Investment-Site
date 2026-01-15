
import { UserProfile } from '../types';

const SESSION_KEY = 'prestige_session';
const TOKEN_KEY = 'prestige_token';

export const authService = {
  async register(userData: any): Promise<UserProfile> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user: UserProfile = {
      id: 'u-' + Date.now(),
      fullName: userData.fullName,
      email: userData.email,
      country: userData.country,
      role: 'USER',
      investorType: userData.investorType,
      interests: userData.interests,
      onboardingCompleted: false,
      kycStatus: 'PENDING',
      joinedDate: new Date().toISOString()
    };
    
    this.setSession(user, 'mock-jwt-token');
    return user;
  },

  async login(email: string, password: string): Promise<UserProfile> {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Admin backdoor for testing
      if (email === 'admin@prestige.com' && password === 'admin') {
          const admin: UserProfile = {
              id: 'admin-1',
              fullName: 'System Administrator',
              email,
              country: 'System',
              role: 'ADMIN',
              investorType: 'Institutional',
              interests: [],
              onboardingCompleted: true,
              kycStatus: 'APPROVED',
              joinedDate: new Date().toISOString()
          };
          this.setSession(admin, 'mock-admin-token');
          return admin;
      }

      // Default mock user
      const user: UserProfile = {
          id: 'u-demo',
          fullName: 'Demo Investor',
          email,
          country: 'United Kingdom',
          role: 'USER',
          investorType: 'High Net Worth',
          interests: ['Real Estate', 'Fine Art'],
          onboardingCompleted: true,
          kycStatus: 'APPROVED',
          joinedDate: new Date().toISOString(),
          profileData: { phone: '+15550000000', emailAlerts: true, pushAlerts: true, twoFactor: false }
      };
      
      this.setSession(user, 'mock-user-token');
      return user;
  },

  async updateProfile(userData: Partial<UserProfile> & { phone?: string, emailAlerts?: boolean, pushAlerts?: boolean, twoFactor?: boolean }) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const currentUser = this.getCurrentUser();
    if (!currentUser) throw new Error("Not authenticated");

    const updatedUser = { ...currentUser, ...userData };
    if (userData.phone || userData.emailAlerts !== undefined) {
        updatedUser.profileData = { ...currentUser.profileData, ...userData };
    }

    this.setSession(updatedUser, this.getToken() || 'mock-token');
    return updatedUser;
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
