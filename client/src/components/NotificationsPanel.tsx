import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, BellRing, CheckCircle, AlertTriangle, Info, Circle } from 'lucide-react';

interface Notification {
  id: string;
  type: 'bill' | 'balance' | 'budget' | 'security' | 'info';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'bill',
      title: 'Bill Due Soon',
      message: 'Your electricity bill of ₹2,450 is due in 3 days',
      time: '2 hours ago',
      read: false
    },
    {
      id: '2',
      type: 'balance',
      title: 'Low Balance Alert',
      message: 'Your savings account balance has dropped below ₹5,000',
      time: '5 hours ago',
      read: false
    },
    {
      id: '3',
      type: 'budget',
      title: 'Budget Exceeded',
      message: 'You have exceeded your Food & Dining budget by ₹450',
      time: '1 day ago',
      read: false
    },
    {
      id: '4',
      type: 'security',
      title: 'New Login Detected',
      message: 'Login from Chrome on Windows at 2:30 PM',
      time: '1 day ago',
      read: true
    },
    {
      id: '5',
      type: 'info',
      title: 'Monthly Statement Ready',
      message: 'Your December statement is now available to download',
      time: '2 days ago',
      read: true
    },
    {
      id: '6',
      type: 'bill',
      title: 'Bill Payment Successful',
      message: 'Internet bill of ₹999 paid successfully',
      time: '3 days ago',
      read: true
    },
    {
      id: '7',
      type: 'budget',
      title: 'Budget Alert',
      message: 'You have used 85% of your Shopping budget',
      time: '3 days ago',
      read: true
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'bill':
        return <BellRing className="h-5 w-5 text-orange-600" />;
      case 'balance':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'budget':
        return <AlertTriangle className="h-5 w-5 text-amber-600" />;
      case 'security':
        return <Info className="h-5 w-5 text-blue-600" />;
      case 'info':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      default:
        return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationBgColor = (type: Notification['type']) => {
    switch (type) {
      case 'bill':
        return 'bg-orange-50';
      case 'balance':
        return 'bg-red-50';
      case 'budget':
        return 'bg-amber-50';
      case 'security':
        return 'bg-blue-50';
      case 'info':
        return 'bg-green-50';
      default:
        return 'bg-gray-50';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full md:w-[420px] bg-background border-l shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">Notifications</h2>
            {unreadCount > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Actions */}
        {notifications.length > 0 && (
          <div className="flex items-center gap-2 px-6 py-3 border-b bg-muted/30">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
              >
                Mark all as read
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
            >
              Clear all
            </Button>
          </div>
        )}

        {/* Notifications List */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`p-4 cursor-pointer hover:shadow-md transition-shadow ${
                    !notification.read ? 'border-primary/50' : ''
                  }`}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <div className="flex gap-3">
                    <div className={`p-2 rounded-lg ${getNotificationBgColor(notification.type)} flex-shrink-0`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-medium text-sm">{notification.title}</h4>
                        {!notification.read && (
                          <Circle className="h-2 w-2 fill-primary text-primary flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="flex justify-center mb-4">
                  <div className="p-4 rounded-full bg-muted">
                    <BellRing className="h-8 w-8 text-muted-foreground" />
                  </div>
                </div>
                <h3 className="text-lg font-medium mb-2">No notifications</h3>
                <p className="text-sm text-muted-foreground">
                  You're all caught up! Check back later for updates.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </>
  );
}
