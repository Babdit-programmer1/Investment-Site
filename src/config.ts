
// Production-ready configuration
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// In production (Nginx), the API is served from the same domain under /api/v1
// In development, we use the specific localhost port
export const API_BASE_URL = isLocalhost 
  ? 'http://localhost:3001/api/v1' 
  : '/api/v1';

export const APP_NAME = 'Prestige Assets';
