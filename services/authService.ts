import { UserProfile } from '../types';

const API_URL = 'http://localhost:3001/api/v1';
const SESSION_KEY = 'prestige_session';
const TOKEN_KEY = 'prestige_token';

export const authService = {
  async register(userData: any): Promise<UserProfile> {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Registration failed');
      this.setSession(data.user, data.token);
      return data.user;
    } catch (error) {
      throw error;
    }
  },

  async login(email: string, password: string): Promise<UserProfile> {
     try {
      const response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Invalid email or password');
      this.setSession(data.user, data.token);
      return data.user;
     } catch (error) {
       throw error;
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
