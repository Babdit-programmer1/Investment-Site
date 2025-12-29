import { UserProfile } from '../types';

// Configuration
const API_URL = 'https://api.prestigeassets.com';
const USE_MOCK_API = true; // Set to false to use real backend

// Keys for localStorage (Mock DB)
const USERS_KEY = 'prestige_users_db';
const SESSION_KEY = 'prestige_session';

// Simulate API delay for mock
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  // Register a new user
  async register(userData: Omit<UserProfile, 'id' | 'joinedDate'> & { password: string }): Promise<UserProfile> {
    if (!USE_MOCK_API) {
      try {
        const response = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        });
        
        if (!response.ok) {
           const error = await response.json();
           throw new Error(error.message || 'Registration failed');
        }
        
        const user = await response.json();
        // Persist session
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
        return user;
      } catch (error) {
        throw error;
      }
    }

    // --- Mock Implementation ---
    await delay(800); 

    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    
    // Check if email exists
    if (users.find((u: any) => u.email === userData.email)) {
      throw new Error('An account with this email already exists.');
    }

    const newUser: UserProfile = {
      id: Math.random().toString(36).substr(2, 9),
      fullName: userData.fullName,
      email: userData.email,
      country: userData.country,
      investorType: userData.investorType,
      interests: userData.interests,
      joinedDate: new Date().toISOString(),
    };

    // Store user with password
    const userRecord = { ...newUser, password: userData.password }; 
    users.push(userRecord);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    // Auto login after register
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    return newUser;
  },

  // Login
  async login(email: string, password: string): Promise<UserProfile> {
    if (!USE_MOCK_API) {
       try {
        const response = await fetch(`${API_URL}/auth/login`, { // ✅ API Call
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Invalid email or password');
        }

        const data = await response.json(); // Returns JWT token + User Data
        
        // In a real app, you would store the JWT in a cookie or secure storage.
        // For this demo structure, we assume data is the UserProfile or contains it.
        const userProfile = data.user || data; 
        
        localStorage.setItem(SESSION_KEY, JSON.stringify(userProfile));
        return userProfile;
       } catch (error) {
         throw error;
       }
    }

    // --- Mock Implementation ---
    await delay(800);

    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const user = users.find((u: any) => u.email === email && u.password === password);

    if (!user) {
      throw new Error('Invalid email or password.');
    }

    // Return profile without password
    const { password: _, ...profile } = user;
    localStorage.setItem(SESSION_KEY, JSON.stringify(profile));
    return profile;
  },

  // Logout
  async logout(): Promise<void> {
    // If using API, you typically simply remove the token on the client
    await delay(200);
    localStorage.removeItem(SESSION_KEY);
  },

  // Get current session
  getCurrentUser(): UserProfile | null {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  }
};