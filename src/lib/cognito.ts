import { Amplify } from 'aws-amplify';
import { signUp, signIn, signOut, confirmSignUp, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';

// Configure Amplify with Cognito settings
const cognitoConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.VITE_COGNITO_USER_POOL_ID || 'us-east-1_gt96zzkHV',
      userPoolClientId: process.env.VITE_COGNITO_USER_POOL_CLIENT_ID || '1epbmpkpafmm1dqhsbgudd1t74',
      loginWith: {
        email: true,
        username: true,
      },
      signUpVerificationMethod: 'code' as const,
      userAttributes: {
        email: {
          required: true,
        },
        given_name: {
          required: true,
        },
        family_name: {
          required: true,
        },
      },
      passwordFormat: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialCharacters: true,
      },
    },
  },
};

Amplify.configure(cognitoConfig);

export interface CognitoUser {
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: CognitoUser | null;
  isLoading: boolean;
}

// Authentication functions
export const authService = {
  async signUp(username: string, email: string, password: string, firstName: string, lastName: string) {
    try {
      const { isSignUpComplete, userId, nextStep } = await signUp({
        username,
        password,
        options: {
          userAttributes: {
            email,
            given_name: firstName,
            family_name: lastName,
          },
        },
      });

      return {
        success: true,
        isSignUpComplete,
        userId,
        nextStep,
      };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return {
        success: false,
        error: error.message || 'Sign up failed',
      };
    }
  },

  async confirmSignUp(username: string, confirmationCode: string) {
    try {
      const { isSignUpComplete, nextStep } = await confirmSignUp({
        username,
        confirmationCode,
      });

      return {
        success: true,
        isSignUpComplete,
        nextStep,
      };
    } catch (error: any) {
      console.error('Confirmation error:', error);
      return {
        success: false,
        error: error.message || 'Confirmation failed',
      };
    }
  },

  async signIn(username: string, password: string) {
    try {
      const { isSignedIn, nextStep } = await signIn({
        username,
        password,
      });

      return {
        success: true,
        isSignedIn,
        nextStep,
      };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return {
        success: false,
        error: error.message || 'Sign in failed',
      };
    }
  },

  async signOut() {
    try {
      await signOut();
      return { success: true };
    } catch (error: any) {
      console.error('Sign out error:', error);
      return {
        success: false,
        error: error.message || 'Sign out failed',
      };
    }
  },

  async getCurrentUser(): Promise<CognitoUser | null> {
    try {
      console.log('🔍 Getting current user...');
      const user = await getCurrentUser();
      console.log('👤 Current user retrieved:', {
        username: user.username,
        loginId: user.signInDetails?.loginId
      });
      
      return {
        username: user.username,
        email: user.signInDetails?.loginId || '',
        firstName: user.username,
        lastName: '',
      };
    } catch (error) {
      console.error('❌ Get current user error:', error);
      return null;
    }
  },

  async getTokens() {
    try {
      console.log('🔐 Fetching auth session...');
      const session = await fetchAuthSession();
      
      console.log('📋 Auth session details:', {
        hasTokens: !!session.tokens,
        hasAccessToken: !!session.tokens?.accessToken,
        hasIdToken: !!session.tokens?.idToken,
        credentials: !!session.credentials,
        identityId: session.identityId
      });

      if (!session.tokens) {
        console.error('❌ No tokens in session');
        return null;
      }

      const tokens = {
        accessToken: session.tokens.accessToken?.toString(),
        idToken: session.tokens.idToken?.toString(),
      };

      console.log('🎟️ Token details:', {
        hasAccessToken: !!tokens.accessToken,
        hasIdToken: !!tokens.idToken,
        accessTokenLength: tokens.accessToken?.length || 0,
        idTokenLength: tokens.idToken?.length || 0
      });

      return tokens;
    } catch (error) {
      console.error('❌ Get tokens error:', error);
      return null;
    }
  },

  async isAuthenticated() {
    try {
      const user = await this.getCurrentUser();
      const tokens = await this.getTokens();
      const isAuth = !!(user && tokens?.accessToken);
      console.log('🔒 Authentication status:', isAuth);
      return isAuth;
    } catch (error) {
      console.error('❌ Authentication check failed:', error);
      return false;
    }
  }
};
