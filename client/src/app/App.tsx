import { useState } from 'react';
import { Sidebar } from '@/app/components/Sidebar';
import { Header } from '@/app/components/Header';
import { AdminSidebar } from '@/app/components/AdminSidebar';
import { AdminHeader } from '@/app/components/AdminHeader';
import { Dashboard } from '@/app/pages/Dashboard';
import { Login } from '@/app/pages/Login';
import { Signup } from '@/app/pages/Signup';
import { ForgotPassword } from '@/app/pages/ForgotPassword';
import { AdminLogin } from '@/app/pages/AdminLogin';
import { AdminDashboard } from '@/app/pages/AdminDashboard';
import { AdminUsers } from '@/app/pages/AdminUsers';
import { AdminAlerts } from '@/app/pages/AdminAlerts';
import { AdminInsights } from '@/app/pages/AdminInsights';
import { AdminLogs } from '@/app/pages/AdminLogs';
import { AdminSettings } from '@/app/pages/AdminSettings';
import { Accounts } from '@/app/pages/Accounts';
import { Transactions } from '@/app/pages/Transactions';
import { ImportTransactions } from '@/app/pages/ImportTransactions';
import { Budgets } from '@/app/pages/Budgets';
import { Bills } from '@/app/pages/Bills';
import { Rewards } from '@/app/pages/Rewards';
import { Insights } from '@/app/pages/Insights';
import { Settings } from '@/app/pages/Settings';
import { Toaster } from '@/app/components/ui/sonner';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string | null;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+1 (555) 000-0000',
    avatar: null
  });

  const handleNavigate = (page: string) => {
    if (page === 'login' || page === 'signup' || page === 'admin-login' || page === 'forgot-password') {
      setIsAuthenticated(false);
      setIsAdminAuthenticated(false);
    } else if (page === 'dashboard' && !isAuthenticated) {
      setIsAuthenticated(true);
      setIsAdminAuthenticated(false);
    } else if (page.startsWith('admin-') && !isAdminAuthenticated) {
      setIsAdminAuthenticated(true);
      setIsAuthenticated(false);
    }
    setCurrentPage(page);
  };

  const handleUpdateProfile = (profile: UserProfile) => {
    setUserProfile(profile);
  };

  const pageTitles: Record<string, string> = {
    dashboard: 'Dashboard',
    accounts: 'Accounts',
    transactions: 'Transactions',
    'import-transactions': 'Import Transactions',
    budgets: 'Budgets',
    bills: 'Bills & Reminders',
    rewards: 'Rewards',
    insights: 'Insights & Alerts',
    settings: 'Settings',
    'admin-dashboard': 'Admin Dashboard',
    'admin-users': 'User Management',
    'admin-alerts': 'Alerts Management',
    'admin-insights': 'System Insights',
    'admin-logs': 'Admin Logs',
    'admin-settings': 'Admin Settings'
  };

  // Authentication Pages (Full Screen)
  if (currentPage === 'login' || currentPage === 'signup' || currentPage === 'admin-login' || currentPage === 'forgot-password') {
    return (
      <>
        <div className="min-h-screen">
          {currentPage === 'login' && <Login onNavigate={handleNavigate} />}
          {currentPage === 'signup' && <Signup onNavigate={handleNavigate} />}
          {currentPage === 'forgot-password' && <ForgotPassword onNavigate={handleNavigate} />}
          {currentPage === 'admin-login' && <AdminLogin onNavigate={handleNavigate} />}
        </div>
        <Toaster position="top-right" />
      </>
    );
  }

  // Admin Dashboard Layout
  if (currentPage.startsWith('admin-')) {
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

  // Main Application (Dashboard Layout)
  return (
    <>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Sidebar */}
        <Sidebar activePage={currentPage} onNavigate={handleNavigate} userProfile={userProfile} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <Header title={pageTitles[currentPage]} onNavigate={handleNavigate} userProfile={userProfile} />

          {/* Page Content */}
          <main className="flex-1 overflow-auto p-8">
            {currentPage === 'dashboard' && <Dashboard />}
            {currentPage === 'accounts' && <Accounts />}
            {currentPage === 'transactions' && <Transactions onNavigate={handleNavigate} />}
            {currentPage === 'import-transactions' && <ImportTransactions />}
            {currentPage === 'budgets' && <Budgets />}
            {currentPage === 'bills' && <Bills />}
            {currentPage === 'rewards' && <Rewards />}
            {currentPage === 'insights' && <Insights />}
            {currentPage === 'settings' && <Settings userProfile={userProfile} onUpdateProfile={handleUpdateProfile} />}
          </main>
        </div>
      </div>
      <Toaster position="top-right" />
    </>
  );
}