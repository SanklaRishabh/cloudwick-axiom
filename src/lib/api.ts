
import { authService } from './cognito';

const BASE_URL = 'https://ndncqs0q7i.execute-api.us-east-1.amazonaws.com/auth-test';

interface ApiOptions extends RequestInit {
  requireAuth?: boolean;
}

export const apiClient = {
  async request(endpoint: string, options: ApiOptions = {}) {
    const { requireAuth = true, ...fetchOptions } = options;
    
    const url = `${BASE_URL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    };

    // Add authentication headers if required
    if (requireAuth) {
      try {
        const tokens = await authService.getTokens();
        if (tokens?.accessToken) {
          headers['Authorization'] = `Bearer ${tokens.accessToken}`;
        }
      } catch (error) {
        console.error('Failed to get auth tokens:', error);
        throw new Error('Authentication required');
      }
    }

    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response;
  },

  async get(endpoint: string, options: ApiOptions = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  },

  async post(endpoint: string, data?: any, options: ApiOptions = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  async put(endpoint: string, data?: any, options: ApiOptions = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  async delete(endpoint: string, options: ApiOptions = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  },
};
