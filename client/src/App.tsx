import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminSidebar } from './components/AdminSidebar';
import { AdminHeader } from './components/AdminHeader';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminUsers } from './pages/AdminUsers';
import { AdminAlerts } from './pages/AdminAlerts';
import { AdminInsights } from './pages/AdminInsights';
import { AdminLogs } from './pages/AdminLogs';
import { AdminSettings } from './pages/AdminSettings';
import { Toaster } from './components/ui/sonner';

function AppContent() {
  const { isAuthenticated, isLoading, login, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState('admin-login');

  const pageTitles: Record<string, string> = {
    'admin-dashboard': 'Admin Dashboard',
    'admin-users': 'User Management',
    'admin-alerts': 'Alerts Management',
    'admin-insights': 'System Insights',
    'admin-logs': 'Admin Logs',
    'admin-settings': 'Admin Settings'
  };

  const handleNavigate = (page: string) => {
    if (page === 'admin-login') {
      logout();
    } else if (page.startsWith('admin-')) {
      setCurrentPage(page);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    const result = await login(email, password);
    if (!result.error) {
      setCurrentPage('admin-dashboard');
    }
    return result;
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Admin Login Page (Full Screen) - Show only if not authenticated
  if (!isAuthenticated && currentPage === 'admin-login') {
    return (
      <>
        <AdminLogin onNavigate={handleNavigate} onLogin={handleLogin} />
        <Toaster position="top-right" />
      </>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return (
      <>
        <AdminLogin onNavigate={handleNavigate} onLogin={handleLogin} />
        <Toaster position="top-right" />
      </>
    );
  }

  // Admin Dashboard Layout
  return (
    <>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Admin Sidebar */}
        <AdminSidebar activePage={currentPage} onNavigate={handleNavigate} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Admin Header */}
          <AdminHeader title={pageTitles[currentPage]} onNavigate={handleNavigate} />

          {/* Page Content */}
          <main className="flex-1 overflow-auto p-8">
            {currentPage === 'admin-dashboard' && <AdminDashboard />}
            {currentPage === 'admin-users' && <AdminUsers />}
            {currentPage === 'admin-alerts' && <AdminAlerts />}
            {currentPage === 'admin-insights' && <AdminInsights />}
            {currentPage === 'admin-logs' && <AdminLogs />}
            {currentPage === 'admin-settings' && <AdminSettings />}
          </main>
        </div>
      </div>
      <Toaster position="top-right" />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

