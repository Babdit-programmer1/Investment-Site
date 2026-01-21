
import { UserProfile } from '../types';
import { api, setAuthToken, clearAuthToken } from './apiUtils';

const SESSION_KEY = 'prestige_session';

export const authService = {
  async register(userData: any): Promise<UserProfile> {
    const response = await api.post<{ user: UserProfile, token: string }>('/auth/register', userData);
    if (response.token && response.user) {
      this.setSession(response.user, response.token);
      return response.user;
    }
    throw new Error('Registration failed: Invalid server response');
  },

  async login(email: string, password: string): Promise<UserProfile> {
    const response = await api.post<{ user: UserProfile, token: string }>('/auth/login', { email, password });
    
    if (response.token && response.user) {
      this.setSession(response.user, response.token);
      return response.user;
    }
    throw new Error('Login failed: Invalid server response');
  },

  async updateProfile(userData: Partial<UserProfile> & { phone?: string, emailAlerts?: boolean, pushAlerts?: boolean, twoFactor?: boolean }) {
    const response = await api.patch<UserProfile>('/auth/me', userData);
    
    // Update local session data with new profile if exists
    const currentUser = this.getCurrentUser();
    if (currentUser) {
        const updatedUser = { ...currentUser, ...response };
        localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
        return updatedUser;
    }
    return response;
  },

  async updatePassword(passwordData: any) {
    return await api.put('/auth/password', passwordData);
  },

  async logout(): Promise<void> {
    clearAuthToken();
    localStorage.removeItem(SESSION_KEY);
  },

  getCurrentUser(): UserProfile | null {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  },

  setSession(user: UserProfile, token: string) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    setAuthToken(token);
  }
};
