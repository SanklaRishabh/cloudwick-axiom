
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface SignUpFormProps {
  onSwitchToSignIn: () => void;
}

const SignUpForm = ({ onSwitchToSignIn }: SignUpFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    agreeToTerms: false
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Placeholder for Cognito authentication
    console.log('Sign up attempt:', formData);
    
    // Simulate authentication
    setTimeout(() => {
      setIsLoading(false);
      // Here you would integrate with AWS Cognito
    }, 1500);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-white text-xl font-lexend font-medium mb-2">Get Started Now</h2>
        <p className="text-gray-400 font-lexend text-sm">Enter your credentials to access your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-white font-lexend text-sm">Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="e.g. John Doe"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="bg-white border-gray-300 font-lexend text-gray-900 placeholder:text-gray-500"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-white font-lexend text-sm">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="john.doe@cloudwick.com"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="bg-white border-gray-300 font-lexend text-gray-900 placeholder:text-gray-500"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-white font-lexend text-sm">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Set a password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className="bg-white border-gray-300 font-lexend text-gray-900 placeholder:text-gray-500"
            required
          />
        </div>

        <div className="flex items-center space-x-2 py-2">
          <Checkbox
            id="terms"
            checked={formData.agreeToTerms}
            onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked as boolean)}
            className="border-gray-400 data-[state=checked]:bg-cloudwick-blue data-[state=checked]:border-cloudwick-blue"
          />
          <Label htmlFor="terms" className="text-gray-400 font-lexend text-sm">
            I agree to the{' '}
            <a href="#" className="text-cloudwick-blue hover:text-blue-400 transition-colors">
              Terms & Privacy
            </a>
          </Label>
        </div>

        <Button
          type="submit"
          disabled={isLoading || !formData.agreeToTerms}
          className="w-full bg-cloudwick-blue hover:bg-blue-600 text-white font-lexend font-medium py-2.5 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Creating Account...' : 'Sign Up'}
        </Button>

        <div className="text-center pt-4">
          <span className="text-gray-400 font-lexend text-sm">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToSignIn}
              className="text-cloudwick-blue hover:text-blue-400 font-medium transition-colors"
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
