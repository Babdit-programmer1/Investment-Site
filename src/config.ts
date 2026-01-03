
// Production-ready configuration
// Automatically switches between local development and production endpoints
const isProduction = window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1');

// In local dev, we strictly use 3001. In production, we use the relative /api/v1 path.
export const API_BASE_URL = isProduction 
  ? '/api/v1' 
  : 'http://localhost:3001/api/v1';

export const APP_NAME = 'Prestige Assets';
