
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, AuthState, CognitoUser } from '@/lib/cognito';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType extends AuthState {
  signIn: (username: string, password: string) => Promise<boolean>;
  signUp: (username: string, email: string, password: string, firstName: string, lastName: string) => Promise<{ success: boolean; needsConfirmation?: boolean }>;
  confirmSignUp: (username: string, code: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      console.log('🔍 Checking auth state...');
      const user = await authService.getCurrentUser();
      const isAuthenticated = await authService.isAuthenticated();
      
      let enrichedUser = user;
      
      // If user is authenticated, fetch their profile to get role
      if (user && isAuthenticated) {
        console.log('🔍 Fetching user profile for role...');
        try {
          const userProfile = await authService.getUserProfile(user.username);
          if (userProfile) {
            enrichedUser = {
              ...user,
              firstName: userProfile.FirstName || user.firstName,
              lastName: userProfile.LastName || user.lastName,
              role: userProfile.Role,
            };
            console.log('✅ User profile fetched successfully:', {
              username: user.username,
              role: userProfile.Role,
              firstName: userProfile.FirstName,
              lastName: userProfile.LastName
            });
          } else {
            console.warn('⚠️ No user profile returned from API');
          }
        } catch (profileError) {
          console.error('❌ Failed to fetch user profile:', profileError);
          // Continue with basic user info even if profile fetch fails
        }
      }
      
      console.log('🔐 Auth state check result:', {
        user: !!enrichedUser,
        isAuthenticated,
        username: enrichedUser?.username,
        role: enrichedUser?.role
      });

      setAuthState({
        isAuthenticated,
        user: enrichedUser,
        isLoading: false,
      });
    } catch (error) {
      console.error('❌ Auth state check failed:', error);
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });
    }
  };

  const signIn = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 Attempting sign in for:', username);
      const result = await authService.signIn(username, password);
      
      if (result.success && result.isSignedIn) {
        console.log('✅ Sign in successful, getting user info...');
        const user = await authService.getCurrentUser();
        const isAuthenticated = await authService.isAuthenticated();
        
        // Fetch user profile to get role
        let enrichedUser = user;
        if (user && isAuthenticated) {
          try {
            const userProfile = await authService.getUserProfile(user.username);
            if (userProfile) {
              enrichedUser = {
                ...user,
                firstName: userProfile.FirstName || user.firstName,
                lastName: userProfile.LastName || user.lastName,
                role: userProfile.Role,
              };
              console.log('✅ Sign in - User profile fetched:', {
                username: user.username,
                role: userProfile.Role
              });
            }
          } catch (profileError) {
            console.error('❌ Sign in - Failed to fetch user profile:', profileError);
          }
        }
        
        setAuthState({
          isAuthenticated,
          user: enrichedUser,
          isLoading: false,
        });
        
        toast({
          title: "Success",
          description: "Successfully signed in!",
        });
        return true;
      } else {
        console.error('❌ Sign in failed:', result.error);
        toast({
          title: "Error",
          description: result.error || "Sign in failed",
          variant: "destructive",
        });
        return false;
      }
    } catch (error: any) {
      console.error('❌ Sign in error:', error);
      toast({
        title: "Error",
        description: error.message || "Sign in failed",
        variant: "destructive",
      });
      return false;
    }
  };

  const signUp = async (username: string, email: string, password: string, firstName: string, lastName: string) => {
    try {
      const result = await authService.signUp(username, email, password, firstName, lastName);
      
      if (result.success) {
        if (result.isSignUpComplete) {
          toast({
            title: "Success",
            description: "Account created successfully!",
          });
          return { success: true, needsConfirmation: false };
        } else {
          toast({
            title: "Verification Required",
            description: "Please check your email for verification code.",
          });
          return { success: true, needsConfirmation: true };
        }
      } else {
        toast({
          title: "Error",
          description: result.error || "Sign up failed",
          variant: "destructive",
        });
        return { success: false };
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Sign up failed",
        variant: "destructive",
      });
      return { success: false };
    }
  };

  const confirmSignUp = async (username: string, code: string): Promise<boolean> => {
    try {
      const result = await authService.confirmSignUp(username, code);
      
      if (result.success && result.isSignUpComplete) {
        toast({
          title: "Success",
          description: "Email verified successfully! You can now sign in.",
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: result.error || "Verification failed",
          variant: "destructive",
        });
        return false;
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Verification failed",
        variant: "destructive",
      });
      return false;
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });
      toast({
        title: "Success",
        description: "Successfully signed out!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Sign out failed",
        variant: "destructive",
      });
    }
  };

  const value: AuthContextType = {
    ...authState,
    signIn,
    signUp,
    confirmSignUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
