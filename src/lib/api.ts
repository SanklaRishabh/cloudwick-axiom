
import { authService } from './cognito';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ndncqs0q7i.execute-api.us-east-1.amazonaws.com/auth-test';

interface ApiOptions extends RequestInit {
  requireAuth?: boolean;
}

export const apiClient = {
  async request(endpoint: string, options: ApiOptions = {}) {
    const { requireAuth = true, ...fetchOptions } = options;
    
    const url = `${BASE_URL}${endpoint}`;
    console.log('🚀 API Request URL:', url);
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    };

    // Add authentication headers if required
    if (requireAuth) {
      try {
        console.log('🔐 Attempting to get auth tokens...');
        const tokens = await authService.getTokens();
        console.log('📝 Retrieved tokens:', {
          hasAccessToken: !!tokens?.accessToken,
          hasIdToken: !!tokens?.idToken,
          accessTokenPreview: tokens?.accessToken ? `${tokens.accessToken.substring(0, 20)}...` : 'null',
          idTokenPreview: tokens?.idToken ? `${tokens.idToken.substring(0, 20)}...` : 'null'
        });
        
        if (tokens?.idToken) {
          headers['Authorization'] = `Bearer ${tokens.idToken}`;
          console.log('✅ Authorization header added with ID token');
        } else {
          console.error('❌ No ID token available');
          throw new Error('No ID token available');
        }

        console.log('ℹ️ Using ID Token for Cognito authorizer authentication');
      } catch (error) {
        console.error('❌ Failed to get auth tokens:', error);
        throw new Error('Authentication required - failed to retrieve tokens');
      }
    }

    console.log('📤 Request headers:', {
      'Content-Type': headers['Content-Type'],
      'Authorization': headers['Authorization'] ? `Bearer ${(headers['Authorization'] as string).substring(7, 27)}...` : 'not set'
    });
    console.log('📤 Request method:', fetchOptions.method || 'GET');
    console.log('📤 Request body:', fetchOptions.body);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      console.log('✅ Request successful');
      return response;
    } catch (error) {
      console.error('❌ Network error:', error);
      throw error;
    }
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
