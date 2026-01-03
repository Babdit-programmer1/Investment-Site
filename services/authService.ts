
import { UserProfile } from '../types';
import { API_BASE_URL } from '../src/config';

const SESSION_KEY = 'prestige_session';
const TOKEN_KEY = 'prestige_token';

export const authService = {
  async register(userData: any): Promise<UserProfile> {
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
  },

  async login(email: string, password: string): Promise<UserProfile> {
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
  },

  async updateProfile(userData: Partial<UserProfile> & { phone?: string, emailAlerts?: boolean, pushAlerts?: boolean, twoFactor?: boolean }) {
    const token = this.getToken();
    if (!token) throw new Error("Not authenticated");

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update profile');
    }
    
    const updatedUser = await response.json();
    this.setSession(updatedUser, token);
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
