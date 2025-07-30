import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import VerificationForm from './VerificationForm';

interface SignUpFormProps {
  onSwitchToSignIn: () => void;
}

const SignUpForm = ({ onSwitchToSignIn }: SignUpFormProps) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    agreeToTerms: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const { signUp } = useAuth();

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const result = await signUp(formData.username, formData.email, formData.password, formData.firstName, formData.lastName);
    
    if (result.success) {
      if (result.needsConfirmation) {
        setShowVerification(true);
      } else {
        onSwitchToSignIn();
      }
    }
    
    setIsLoading(false);
  };

  const handleVerified = () => {
    setShowVerification(false);
    onSwitchToSignIn();
  };

  const handleBackToSignUp = () => {
    setShowVerification(false);
  };

  if (showVerification) {
    return (
      <VerificationForm
        username={formData.username}
        email={formData.email}
        onBack={handleBackToSignUp}
        onVerified={handleVerified}
      />
    );
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username" className="text-foreground text-sm">Username</Label>
          <Input
            id="username"
            type="text"
            placeholder="e.g. johndoe"
            value={formData.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-foreground text-sm">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="john.doe@cloudwick.com"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-foreground text-sm">First Name</Label>
            <Input
              id="firstName"
              type="text"
              placeholder="John"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-foreground text-sm">Last Name</Label>
            <Input
              id="lastName"
              type="text"
              placeholder="Doe"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-foreground text-sm">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Set a password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
            required
          />
        </div>

        <div className="flex items-center space-x-2 py-2">
          <Checkbox
            id="terms"
            checked={formData.agreeToTerms}
            onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked as boolean)}
            className="border-gray-400 data-[state=checked]:bg-gradient-primary data-[state=checked]:border-transparent"
          />
          <Label htmlFor="terms" className="text-gray-400 text-sm">
            I agree to the{' '}
            <a href="#" className="bg-gradient-primary bg-clip-text text-transparent transition-colors hover:opacity-80">
              Terms & Privacy
            </a>
          </Label>
        </div>

        <Button
          type="submit"
          disabled={isLoading || !formData.agreeToTerms}
          className="w-full bg-gradient-primary hover:bg-gradient-primary/90 text-white font-medium py-2.5 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Creating Account...' : 'Sign Up'}
        </Button>

        <div className="text-center pt-4">
          <span className="text-gray-400 text-sm">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToSignIn}
              className="bg-gradient-primary bg-clip-text text-transparent font-medium transition-colors hover:opacity-80"
            >
              Sign In
            </button>
          </span>
        </div>
      </form>
    </div>
  );
};

export default SignUpForm;