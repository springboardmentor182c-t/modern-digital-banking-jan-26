import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Lock, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface ResetPasswordProps {
  onNavigate: () => void;
  email?: string;
}

export function ResetPassword({ onNavigate, email = '' }: ResetPasswordProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const passwordRequirements = [
    { label: 'At least 8 characters', test: (pwd: string) => pwd.length >= 8 },
    { label: 'Contains uppercase letter', test: (pwd: string) => /[A-Z]/.test(pwd) },
    { label: 'Contains lowercase letter', test: (pwd: string) => /[a-z]/.test(pwd) },
    { label: 'Contains number', test: (pwd: string) => /\d/.test(pwd) },
    { label: 'Contains special character', test: (pwd: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Validate password requirements
    const unmetRequirements = passwordRequirements.filter(req => !req.test(newPassword));
    if (unmetRequirements.length > 0) {
      toast.error('Password does not meet all requirements');
      return;
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!email) {
      toast.error('Email information missing. Please start from forgot password.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8080/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          new_password: newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.detail || 'Failed to reset password';
        setErrorMessage(errorMsg);
        toast.error(errorMsg);
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      setIsSuccess(true);
      toast.success('Password updated successfully!');
    } catch (error) {
      console.error('Reset password error:', error);
      const message = error instanceof Error ? error.message : 'Backend connection failed';
      setErrorMessage(message);
      toast.error(message);
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="pt-12 pb-8">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-green-100">
                  <CheckCircle2 className="h-16 w-16 text-green-600" />
                </div>
              </div>
              
              <div>
                <h2 className="text-2xl font-semibold mb-2">Password Updated!</h2>
                <p className="text-muted-foreground">
                  Your password has been successfully updated. You can now log in with your new password.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-900">
                <p className="font-medium mb-1">Security Tips:</p>
                <ul className="text-left space-y-1 ml-4 list-disc">
                  <li>Don't share your password with anyone</li>
                  <li>Use a unique password for this account</li>
                  <li>Consider using a password manager</li>
                </ul>
              </div>

              <Button 
                className="w-full"
                onClick={() => onNavigate()}
              >
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Lock className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <CardDescription>
            Create a new strong password for your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg text-sm mb-4">
                {errorMessage}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isLoading}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900 mb-2">Password Requirements:</p>
              <ul className="space-y-1">
                {passwordRequirements.map((req, index) => {
                  const isMet = newPassword ? req.test(newPassword) : false;
                  return (
                    <li key={index} className="flex items-center gap-2 text-xs">
                      <div className={`h-4 w-4 rounded-full flex items-center justify-center ${
                        isMet ? 'bg-green-500' : 'bg-gray-300'
                      }`}>
                        {isMet && <CheckCircle2 className="h-3 w-3 text-white" />}
                      </div>
                      <span className={isMet ? 'text-green-700' : 'text-gray-600'}>
                        {req.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Password Match Indicator */}
            {confirmPassword && (
              <div className={`text-sm p-2 rounded ${
                newPassword === confirmPassword 
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Updating Password...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Update Password
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}