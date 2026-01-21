
import { API_BASE_URL } from '../src/config';

const TOKEN_KEY = 'prestige_token';
const SESSION_KEY = 'prestige_session';

export const getAuthToken = () => localStorage.getItem(TOKEN_KEY);
export const setAuthToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const clearAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(SESSION_KEY);
};

interface RequestOptions {
  headers?: Record<string, string>;
}

async function request<T>(endpoint: string, method: string, body?: any, customHeaders?: Record<string, string>): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers,
    mode: 'cors', // Explicitly set CORS mode
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  // Ensure base URL doesn't have trailing slash if endpoint has leading slash
  const baseUrl = API_BASE_URL.replace(/\/$/, '');
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${path}`;

  try {
    const response = await fetch(url, config);

    // Handle 401 Unauthorized globally
    if (response.status === 401) {
      console.error(`[API Auth] 401 Unauthorized at ${url}`);
      clearAuthToken();
      // Redirect to login if not already there (assuming HashRouter based on app structure)
      if (!window.location.hash.includes('/login')) {
        window.location.href = '/#/login';
      }
      throw new Error('Session expired. Please login again.');
    }

    let result;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      result = await response.json();
    } else {
      result = await response.text();
    }

    if (!response.ok) {
      console.error(`[API Error] ${response.status} at ${url}:`, result);
      const errorMessage = typeof result === 'object' && result.message 
        ? result.message 
        : (typeof result === 'string' && result.length < 200 ? result : `API Request Failed: ${response.statusText}`);
      throw new Error(errorMessage);
    }

    return result as T;
  } catch (error: any) {
    // Log the full error to console for debugging
    console.error(`[API Exception] Request failed for ${method} ${url}:`, error);

    // Handle Network Errors (when fetch fails completely)
    if (error.name === 'TypeError' || error.message === 'Failed to fetch') {
       throw new Error(`Unable to connect to backend server at ${baseUrl}. Please check your internet connection and ensure the server is running.`);
    }
    
    throw error;
  }
}

export const api = {
  get: <T = any>(endpoint: string, headers?: Record<string, string>) => request<T>(endpoint, 'GET', undefined, headers),
  post: <T = any>(endpoint: string, data: any, headers?: Record<string, string>) => request<T>(endpoint, 'POST', data, headers),
  put: <T = any>(endpoint: string, data: any, headers?: Record<string, string>) => request<T>(endpoint, 'PUT', data, headers),
  patch: <T = any>(endpoint: string, data: any, headers?: Record<string, string>) => request<T>(endpoint, 'PATCH', data, headers),
  delete: <T = any>(endpoint: string, headers?: Record<string, string>) => request<T>(endpoint, 'DELETE', undefined, headers),
};
