import { 
  LayoutDashboard, 
  Wallet, 
  Receipt, 
  PieChart, 
  FileText, 
  Gift, 
  TrendingUp, 
  Settings, 
  LogOut,
  Landmark
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string | null;
}

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  userProfile: UserProfile;
}

export function Sidebar({ activePage, onNavigate, userProfile }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'accounts', label: 'Accounts', icon: Wallet },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'budgets', label: 'Budgets', icon: PieChart },
    { id: 'bills', label: 'Bills & Reminders', icon: FileText },
    { id: 'rewards', label: 'Rewards', icon: Gift },
    { id: 'insights', label: 'Insights & Alerts', icon: TrendingUp },
  ];

  const getInitials = () => {
    return `${userProfile.firstName.charAt(0)}${userProfile.lastName.charAt(0)}`.toUpperCase();
  };

  const fullName = `${userProfile.firstName} ${userProfile.lastName}`;

  return (
    <aside className="w-64 h-screen bg-card border-r border-border flex flex-col shadow-sm">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-md">
            <Landmark className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold">SmartBank</span>
        </div>
      </div>

      {/* User Profile Section */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
          <Avatar className="w-10 h-10 border-2 border-background shadow-sm">
            {userProfile.avatar ? (
              <AvatarImage src={userProfile.avatar} alt={fullName} />
            ) : (
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {getInitials()}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{fullName}</p>
            <p className="text-xs text-muted-foreground truncate">{userProfile.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-[#5a9fd1] text-primary-foreground shadow-sm'
                  : 'text-foreground hover:bg-accent'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-border space-y-1">
        <button
          onClick={() => onNavigate('settings')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            activePage === 'settings'
              ? 'bg-[#5a9fd1] text-primary-foreground shadow-sm'
              : 'text-foreground hover:bg-accent'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-sm">Settings</span>
        </button>
        <button
          onClick={() => onNavigate('login')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
}