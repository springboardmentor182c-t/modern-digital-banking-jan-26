import { Badge } from '@/app/components/ui/badge';
import { Switch } from '@/app/components/ui/switch';
import { 
  Zap, 
  Wifi, 
  Smartphone, 
  Home, 
  CreditCard 
} from 'lucide-react';

interface BillItemProps {
  name: string;
  dueDate: string;
  amount: number;
  status: 'paid' | 'upcoming' | 'overdue';
  autoPay: boolean;
  icon: 'zap' | 'wifi' | 'smartphone' | 'home' | 'credit-card';
}

const iconMap = {
  'zap': Zap,
  'wifi': Wifi,
  'smartphone': Smartphone,
  'home': Home,
  'credit-card': CreditCard,
};

export function BillItem({ 
  name, 
  dueDate, 
  amount, 
  status, 
  autoPay, 
  icon 
}: BillItemProps) {
  const Icon = iconMap[icon];
  
  const statusColors = {
    paid: 'bg-green-100 text-green-700',
    upcoming: 'bg-blue-100 text-blue-700',
    overdue: 'bg-red-100 text-red-700',
  };

  const daysUntilDue = Math.ceil(
    (new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="flex items-center justify-between py-4 hover:bg-accent/50 px-4 -mx-4 rounded-lg transition-colors">
      <div className="flex items-center gap-4 flex-1">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <div className="font-medium">{name}</div>
          <div className="text-sm text-muted-foreground">
            Due {new Date(dueDate).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            })}
            {status === 'upcoming' && daysUntilDue > 0 && (
              <span> • {daysUntilDue} days</span>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="font-semibold">₹{amount.toFixed(2)}</div>
          <Badge className={`${statusColors[status]} border-0`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Auto-pay</span>
          <Switch checked={autoPay} />
        </div>
      </div>
    </div>
  );
}