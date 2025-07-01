
import { Amplify } from 'aws-amplify';
import { signUp, signIn, signOut, confirmSignUp, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';

// Configure Amplify with Cognito settings
// Note: You'll need to replace these with your actual Cognito configuration
const cognitoConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.VITE_COGNITO_USER_POOL_ID || 'your-user-pool-id',
      userPoolClientId: process.env.VITE_COGNITO_USER_POOL_CLIENT_ID || 'your-client-id',
      loginWith: {
        email: true,
      },
      signUpVerificationMethod: 'code' as const,
      userAttributes: {
        email: {
          required: true,
        },
        name: {
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
  name?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: CognitoUser | null;
  isLoading: boolean;
}

// Authentication functions
export const authService = {
  async signUp(email: string, password: string, name: string) {
    try {
      const { isSignUpComplete, userId, nextStep } = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            name,
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

  async confirmSignUp(email: string, confirmationCode: string) {
    try {
      const { isSignUpComplete, nextStep } = await confirmSignUp({
        username: email,
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

  async signIn(email: string, password: string) {
    try {
      const { isSignedIn, nextStep } = await signIn({
        username: email,
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
      const user = await getCurrentUser();
      return {
        username: user.username,
        email: user.signInDetails?.loginId || '',
        name: user.username,
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  async getTokens() {
    try {
      const session = await fetchAuthSession();
      return {
        accessToken: session.tokens?.accessToken?.toString(),
        idToken: session.tokens?.idToken?.toString(),
      };
    } catch (error) {
      console.error('Get tokens error:', error);
      return null;
    }
  },
};
