import { useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Landmark } from 'lucide-react';

interface LoginProps {
  onNavigate: (page: string) => void;
}

export function Login({ onNavigate }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      // Validate inputs
      if (!email.trim()) {
        setErrorMessage('Email is required');
        setIsLoading(false);
        return;
      }
      if (!password) {
        setErrorMessage('Password is required');
        setIsLoading(false);
        return;
      }

      // Call backend login endpoint (use relative path so Vite dev proxy forwards to backend)
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      let data: any = null;
      try {
        data = await response.json();
      } catch (err) {
        // Non-JSON or empty response — we'll handle based on status code below
        data = null;
      }

      if (!response.ok) {
        let errorMsg = 'Login failed';
        if (response.status === 401) {
          errorMsg = 'Invalid email or password';
        } else if (response.status === 403) {
          errorMsg = 'Account not verified. Please complete the signup process.';
        } else if (data && data.detail) {
          errorMsg = data.detail;
        } else if (response.status >= 500) {
          errorMsg = 'Server error. Please try again later.';
        }
        setErrorMessage(errorMsg);
        setIsLoading(false);
        return;
      }

      // Store access token and user_id to enable authenticated requests
      if (data && data.access_token) {
        localStorage.setItem('access_token', data.access_token);
      }
      if (data && data.user_id) {
        localStorage.setItem('user_id', data.user_id);
      }
      setIsLoading(false);
      onNavigate('dashboard');
    } catch (error) {
      console.error('Login error:', error);
      const message = error instanceof Error ? error.message : 'Backend connection failed. Please check if the server is running.';
      setErrorMessage(message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-xl">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-md">
              <Landmark className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="text-2xl font-semibold text-foreground">SmartBank</span>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to your account to continue</p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg text-sm mb-4">
            {errorMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm">Email Address</label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
              className="bg-input-background border-border"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm">Password</label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
              className="bg-input-background border-border"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox id="remember" />
              <label
                htmlFor="remember"
                className="text-sm cursor-pointer"
              >
                Remember me
              </label>
            </div>
            <Button 
              type="button"
              variant="link" 
              className="text-sm p-0 h-auto text-primary"
              onClick={() => onNavigate('forgot-password')}
            >
              Forgot password?
            </Button>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="inline-block mr-2">⏳</span>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        {/* Social Login - Google Only */}
        <Button variant="outline" type="button" className="w-full border-border hover:bg-accent">
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </Button>

        {/* Sign Up Link */}
        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">Don't have an account? </span>
          <Button 
            variant="link" 
            className="p-0 h-auto text-primary"
            onClick={() => onNavigate('signup')}
          >
            Sign up
          </Button>
        </div>

        {/* Admin Portal Link */}
        <div className="mt-4 text-center text-sm">
          <span className="text-muted-foreground">Admin? </span>
          <Button 
            variant="link" 
            className="p-0 h-auto text-primary"
            onClick={() => onNavigate('admin-login')}
          >
            Access Admin Portal
          </Button>
        </div>
      </Card>
    </div>
  );
}