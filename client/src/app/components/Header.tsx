import { useState } from 'react';
import { Search, Bell, ChevronDown } from 'lucide-react';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { NotificationsPanel } from '@/app/components/NotificationsPanel';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string | null;
}

interface HeaderProps {
  title: string;
  onNavigate: (page: string) => void;
  userProfile: UserProfile;
}

export function Header({ title, onNavigate, userProfile }: HeaderProps) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  const getInitials = () => {
    return `${userProfile.firstName.charAt(0)}${userProfile.lastName.charAt(0)}`.toUpperCase();
  };

  const fullName = `${userProfile.firstName} ${userProfile.lastName}`;

  return (
    <>
      <header className="h-16 bg-card border-b border-border px-8 flex items-center justify-between shadow-sm">
        {/* Page Title */}
        <h1 className="text-2xl font-semibold">{title}</h1>

        {/* Search & Actions */}
        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              className="pl-10 bg-input-background border-border"
            />
          </div>

          {/* Notifications */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative hover:bg-accent"
            onClick={() => setIsNotificationsOpen(true)}
          >
            <Bell className="w-5 h-5" />
            <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-destructive text-white text-xs">
              3
            </Badge>
          </Button>

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2 hover:bg-accent">
                <Avatar className="w-8 h-8 border-2 border-background shadow-sm">
                  {userProfile.avatar ? (
                    <AvatarImage src={userProfile.avatar} alt={fullName} />
                  ) : (
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="text-left hidden lg:block">
                  <div className="text-sm font-medium">{fullName}</div>
                  <div className="text-xs text-muted-foreground">{userProfile.email}</div>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onNavigate('settings')}>
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onNavigate('settings')}>
                Security
              </DropdownMenuItem>
              <DropdownMenuItem>Preferences</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onNavigate('login')}
                className="text-destructive"
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <NotificationsPanel 
        isOpen={isNotificationsOpen} 
        onClose={() => setIsNotificationsOpen(false)}
      />
    </>
  );
}