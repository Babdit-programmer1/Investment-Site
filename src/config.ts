// Production-ready configuration
// In a real deployment, these would be populated by build-time environment variables
const isProduction = process.env.NODE_ENV === 'production';

export const API_BASE_URL = isProduction 
  ? (process.env.REACT_APP_API_URL || '/api/v1') // Relative path for same-domain hosting in prod
  : 'http://localhost:3001/api/v1'; // Default for local preview

export const APP_NAME = 'Prestige Assets';
