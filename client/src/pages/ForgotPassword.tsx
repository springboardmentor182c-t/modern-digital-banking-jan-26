import { useState } from 'react';
import { OTPVerification } from '@/pages/OTPVerification';
import { ResetPassword } from '@/pages/ResetPassword';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface ForgotPasswordProps {
  onNavigate: (page: string) => void;
}

type FlowStep = 'email' | 'otp' | 'reset-password';

export function ForgotPassword({ onNavigate }: ForgotPasswordProps) {
  const [step, setStep] = useState<FlowStep>('email');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          setErrorMessage('Email not found in our system');
          toast.error('Email not found in our system');
        } else {
          setErrorMessage(data.detail || 'Failed to send OTP');
          toast.error(data.detail || 'Failed to send OTP');
        }
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      setStep('otp');
      toast.success('OTP sent successfully! Check for the code.');
    } catch (error) {
      console.error('Forgot password error:', error);
      const message = error instanceof Error ? error.message : 'Backend connection failed';
      setErrorMessage(message);
      toast.error(message);
      setIsLoading(false);
    }
  };

  const handleOTPVerified = () => {
    setStep('reset-password');
  };

  const handleBackFromOTP = () => {
    setStep('email');
  };

  const handlePasswordReset = () => {
    onNavigate('login');
  };

  // Show OTP Verification
  if (step === 'otp') {
    return (
      <OTPVerification
        email={email}
        onVerified={handleOTPVerified}
        onBack={handleBackFromOTP}
      />
    );
  }

  // Show Reset Password
  if (step === 'reset-password') {
    return <ResetPassword onNavigate={handlePasswordReset} email={email} />;
  }

  // Show Email Entry (Step 1)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Mail className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Forgot Password</CardTitle>
          <CardDescription>
            Enter your registered email address and we'll send you a verification code
          </CardDescription>
        </CardHeader>
        <CardContent>
          {errorMessage && (
            <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg text-sm mb-4">
              {errorMessage}
            </div>
          )}
          <form onSubmit={handleSubmitEmail} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                autoFocus
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900">
              <p className="font-medium mb-1">Security Notice</p>
              <p>
                For your security, we'll send a verification code to your registered email address.
                If you don't receive an email, the address may not be in our system.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Sending OTP...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Verification Code
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => onNavigate('login')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
