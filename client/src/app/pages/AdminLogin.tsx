import { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Checkbox } from '../components/ui/checkbox';
import { Landmark, Shield } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

interface AdminLoginProps {
  onNavigate: (page: string) => void;
  onLogin?: (email: string, password: string) => Promise<{ error?: string }>;
}

export function AdminLogin({ onNavigate, onLogin }: AdminLoginProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Default admin credentials
  const DEFAULT_EMAIL = 'admin@smartbank.com';
  const DEFAULT_PASSWORD = 'admin123';

  useEffect(() => {
    // Pre-fill with default credentials for convenience
    setEmail(DEFAULT_EMAIL);
    setPassword(DEFAULT_PASSWORD);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // If onLogin prop is provided, use it (from App.tsx)
      if (onLogin) {
        const result = await onLogin(email, password);
        if (result.error) {
          toast.error('Login failed', { 
            description: result.error,
            className: 'bg-white text-foreground'
          });
        }
      } else {
        // Otherwise use auth context directly
        const result = await login(email, password);
        if (result.error) {
          toast.error('Login failed', { 
            description: result.error,
            className: 'bg-white text-foreground'
          });
        } else {
          toast.success('Welcome back, Admin!', {
            description: 'Successfully logged in to the admin dashboard'
          });
          onNavigate('admin-dashboard');
        }
      }
    } catch (error) {
      toast.error('Login failed', { 
        description: 'An unexpected error occurred. Please ensure the server is running.',
        className: 'bg-white text-foreground'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-xl border-2 border-primary/20">
        {/* Logo with Admin Badge */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-md">
              <Landmark className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="text-2xl font-semibold text-foreground">SmartBank</span>
          </div>
          <Badge className="bg-primary/10 text-primary border border-primary/30 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            Admin Portal
          </Badge>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold mb-2">Admin Access</h1>
          <p className="text-muted-foreground">Sign in to the administration dashboard</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm">Admin Email</label>
            <Input
              id="email"
              type="email"
              placeholder="admin@smartbank.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              onChange={(e) => setPassword(e.target.value)}
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
            <Button variant="link" className="text-sm p-0 h-auto text-primary">
              Need help?
            </Button>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Signing in...
              </>
            ) : (
              'Sign In to Admin'
            )}
          </Button>
        </form>

        {/* Back to User Login */}
        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">Not an admin? </span>
          <Button 
            variant="link" 
            className="p-0 h-auto text-primary"
            onClick={() => onNavigate('login')}
          >
            User login
          </Button>
        </div>

        {/* Security Notice */}
        <div className="mt-6 p-3 bg-info/20 border border-info/30 rounded-lg">
          <p className="text-xs text-info-foreground">
            <Shield className="w-3 h-3 inline mr-1" />
            This is a secure admin area. All actions are logged.
          </p>
        </div>
      </Card>
    </div>
  );
}

