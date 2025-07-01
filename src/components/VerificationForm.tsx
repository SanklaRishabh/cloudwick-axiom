
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';

interface VerificationFormProps {
  email: string;
  onBack: () => void;
  onVerified: () => void;
}

const VerificationForm = ({ email, onBack, onVerified }: VerificationFormProps) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { confirmSignUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsLoading(true);
    const success = await confirmSignUp(email, code);
    setIsLoading(false);

    if (success) {
      onVerified();
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-white text-xl font-lexend font-medium mb-2">Verify Your Email</h2>
        <p className="text-gray-400 font-lexend text-sm">
          We sent a verification code to <span className="text-white">{email}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="code" className="text-white font-lexend text-sm">Verification Code</Label>
          <Input
            id="code"
            type="text"
            placeholder="Enter 6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="bg-white border-gray-300 font-lexend text-gray-900 placeholder:text-gray-500"
            maxLength={6}
            required
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading || !code.trim()}
          className="w-full bg-cloudwick-blue hover:bg-blue-600 text-white font-lexend font-medium py-2.5 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Verifying...' : 'Verify Email'}
        </Button>

        <div className="text-center pt-4">
          <button
            type="button"
            onClick={onBack}
            className="text-gray-400 hover:text-gray-300 font-lexend text-sm transition-colors"
          >
            Back to Sign Up
          </button>
        </div>
      </form>
    </div>
  );
};

export default VerificationForm;
