
import { UserProfile } from '../types';
import { API_BASE_URL } from '../src/config';

const SESSION_KEY = 'prestige_session';
const TOKEN_KEY = 'prestige_token';

export const authService = {
  async register(userData: any): Promise<UserProfile> {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }
        
        this.setSession(data.user, data.token);
        return data.user;
    } catch (error: any) {
        // Fallback for demo/preview if backend is offline
        if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
            console.warn('Backend unreachable. Using mock registration for demo.');
            const mockUser: UserProfile = {
                id: 'mock-user-' + Date.now(),
                fullName: userData.fullName,
                email: userData.email,
                country: userData.country || 'Unknown',
                role: 'USER',
                investorType: userData.investorType || 'Individual',
                interests: userData.interests || [],
                onboardingCompleted: false,
                kycStatus: 'PENDING',
                joinedDate: new Date().toISOString()
            };
            this.setSession(mockUser, 'mock-jwt-token');
            return mockUser;
        }
        throw error;
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
          if (!response.ok) {
              throw new Error(data.message || 'Invalid email or password');
          }
          
          this.setSession(data.user, data.token);
          return data.user;
      } catch (error: any) {
          // Fallback for demo/preview if backend is offline
          if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
              console.warn('Backend unreachable. Using mock login for demo.');
              // Admin bypass for demo
              const isAdmin = email.toLowerCase().includes('admin');
              const mockUser: UserProfile = {
                  id: isAdmin ? 'admin-user' : 'mock-user-1',
                  fullName: isAdmin ? 'System Admin' : 'Demo Investor',
                  email: email,
                  country: 'United States',
                  role: isAdmin ? 'ADMIN' : 'USER',
                  investorType: isAdmin ? 'Institutional' : 'Individual',
                  interests: ['Real Estate', 'Technology'],
                  onboardingCompleted: true,
                  kycStatus: isAdmin ? 'APPROVED' : 'PENDING',
                  joinedDate: new Date().toISOString()
              };
              this.setSession(mockUser, 'mock-jwt-token');
              return mockUser;
          }
          throw error;
      }
  },

  async updateProfile(userData: Partial<UserProfile> & { phone?: string, emailAlerts?: boolean, pushAlerts?: boolean, twoFactor?: boolean }) {
    const token = this.getToken();
    if (!token) throw new Error("Not authenticated");

    try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(userData)
        });

        if (!response.ok) throw new Error('Failed to update profile');
        const updatedUser = await response.json();
        
        // Update local session
        this.setSession(updatedUser, token);
        return updatedUser;
    } catch (error: any) {
        // Fallback for simulation
        if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
            const currentUser = this.getCurrentUser();
            if (currentUser) {
                const updated = { ...currentUser, ...userData };
                this.setSession(updated, token);
                return updated;
            }
        }
        throw error;
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
