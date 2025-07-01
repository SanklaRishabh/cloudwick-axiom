
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SignInFormProps {
  onSwitchToSignUp: () => void;
}

const SignInForm = ({ onSwitchToSignUp }: SignInFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Placeholder for Cognito authentication
    console.log('Sign in attempt:', { email, password });
    
    // Simulate authentication
    setTimeout(() => {
      setIsLoading(false);
      // Here you would integrate with AWS Cognito
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Input
            type="email"
            placeholder="john.doe@cloudwick.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white border-gray-300 font-lexend text-gray-900 placeholder:text-gray-500"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-white border-gray-300 font-lexend text-gray-900"
            required
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          className="text-gray-400 hover:text-gray-300 text-sm font-lexend transition-colors"
        >
          Forgot password?
        </button>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-cloudwick-blue hover:bg-blue-600 text-white font-lexend font-medium py-2.5 transition-colors"
      >
        {isLoading ? 'Signing In...' : 'Sign In'}
      </Button>

      <div className="text-center">
        <span className="text-gray-400 font-lexend text-sm">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToSignUp}
            className="text-cloudwick-blue hover:text-blue-400 font-medium transition-colors"
          >
            Sign Up
          </button>
        </span>
      </div>
    </form>
  );
};

export default SignInForm;
