import { 
  LayoutDashboard, 
  Users, 
  AlertCircle, 
  TrendingUp, 
  FileText,
  Settings, 
  LogOut,
  Landmark,
  Shield
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface AdminSidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

export function AdminSidebar({ activePage, onNavigate }: AdminSidebarProps) {
  const menuItems = [
    { id: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'admin-users', label: 'User Management', icon: Users },
    { id: 'admin-alerts', label: 'Alerts Management', icon: AlertCircle },
    { id: 'admin-insights', label: 'System Insights', icon: TrendingUp },
    { id: 'admin-logs', label: 'Admin Logs', icon: FileText },
  ];

  return (
    <aside className="w-64 h-screen bg-card border-r border-border flex flex-col shadow-sm">
      {/* Logo with Admin Badge */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-md">
            <Landmark className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold">SmartBank</span>
        </div>
        <Badge className="bg-primary/10 text-primary border border-primary/30 flex items-center gap-1.5 w-fit">
          <Shield className="w-3 h-3" />
          <span className="text-xs">Admin Portal</span>
        </Badge>
      </div>

      {/* Admin Profile Section */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
          <Avatar className="w-10 h-10 border-2 border-primary shadow-sm">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              AD
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Admin User</p>
            <p className="text-xs text-muted-foreground truncate">admin@smartbank.com</p>
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
                  ? 'bg-primary text-primary-foreground shadow-sm'
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
          onClick={() => onNavigate('admin-settings')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            activePage === 'admin-settings'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-foreground hover:bg-accent'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-sm">Settings</span>
        </button>
        <button
          onClick={() => onNavigate('admin-login')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
}
