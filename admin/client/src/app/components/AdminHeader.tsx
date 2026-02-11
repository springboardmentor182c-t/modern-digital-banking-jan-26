import { Bell, Search, Shield } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';

interface AdminHeaderProps {
  title: string;
  onNavigate: (page: string) => void;
}

export function AdminHeader({ title, onNavigate }: AdminHeaderProps) {
  return (
    <header className="h-16 bg-card border-b border-border px-8 flex items-center justify-between shadow-sm">
      {/* Title Section */}
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        <Badge className="bg-primary/10 text-primary border border-primary/30 text-xs">
          <Shield className="w-3 h-3 mr-1" />
          Admin
        </Badge>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search users, alerts..."
            className="pl-10 w-64 bg-input-background border-border"
          />
        </div>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative hover:bg-accent">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>System Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">New user registered</p>
                <p className="text-xs text-muted-foreground">2 minutes ago</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">High alert triggered</p>
                <p className="text-xs text-muted-foreground">15 minutes ago</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">System update available</p>
                <p className="text-xs text-muted-foreground">1 hour ago</p>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Admin Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 hover:bg-accent">
              <Avatar className="w-8 h-8 border-2 border-primary shadow-sm">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  AD
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden md:block">Admin</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onNavigate('admin-settings')}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem>Activity Log</DropdownMenuItem>
            <DropdownMenuItem>Help & Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive"
              onClick={() => onNavigate('admin-login')}
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
