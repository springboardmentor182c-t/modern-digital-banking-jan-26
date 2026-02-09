import { useState } from 'react';
import { Card } from '../app/components/ui/card';
import { Input } from '../app/components/ui/input';
import { Button } from '../app/components/ui/button';
import { Checkbox } from '../app/components/ui/checkbox';
import { Landmark, Shield } from 'lucide-react';
import { Badge } from '../app/components/ui/badge';

interface AdminLoginProps {
  onNavigate: (page: string) => void;
}

export function AdminLogin({ onNavigate }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('admin-dashboard');
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

          <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
            Sign In to Admin
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
