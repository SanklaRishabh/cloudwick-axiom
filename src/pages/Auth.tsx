
import React, { useState } from 'react';
import AuthLayout from '@/components/AuthLayout';
import SignInForm from '@/components/SignInForm';
import SignUpForm from '@/components/SignUpForm';
import { AuthThemeProvider } from '@/contexts/AuthThemeContext';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <AuthThemeProvider>
      <AuthLayout
        title={isSignUp ? 'Create Account' : 'Welcome Back'}
        showWireframe={true}
      >
        {isSignUp ? (
          <SignUpForm onSwitchToSignIn={() => setIsSignUp(false)} />
        ) : (
          <SignInForm onSwitchToSignUp={() => setIsSignUp(true)} />
        )}
      </AuthLayout>
    </AuthThemeProvider>
  );
};

export default Auth;
