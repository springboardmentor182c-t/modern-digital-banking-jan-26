import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { authApi } from '../api/adminApi';

interface AdminUser {
  id: number;
  email: string;
  name: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AdminUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'));

  useEffect(() => {
    // Check if token exists and validate it
    const token = localStorage.getItem('admin_token');
    if (token) {
      validateToken();
    } else {
      setIsLoading(false);
    }
  }, []);

  const validateToken = async () => {
    try {
      const response = await authApi.getCurrentUser();
      if (response.data) {
        setUser(response.data);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('admin_token');
      }
    } catch (error) {
      localStorage.removeItem('admin_token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await authApi.login(email, password);
    if (response.data?.access_token) {
      // Token received, now fetch actual user data
      try {
        const userResponse = await authApi.getCurrentUser();
        if (userResponse.data) {
          setUser(userResponse.data);
          setIsAuthenticated(true);
          setToken(response.data.access_token);
          localStorage.setItem('admin_token', response.data.access_token);
          return {};
        }
      } catch (error) {
        console.error('Failed to fetch user after login:', error);
        return { error: 'Login succeeded but failed to get user data' };
      }
    }
    return { error: response.error || 'Login failed' };
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    setIsAuthenticated(false);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

