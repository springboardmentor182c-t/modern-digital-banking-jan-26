import { 
  PiggyBank, 
  Wallet, 
  CreditCard, 
  TrendingUp,
  Eye,
  EyeOff
} from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { useState } from 'react';

interface AccountCardProps {
  type: string;
  accountNumber: string;
  balance: number;
  currency: string;
  icon: 'piggy-bank' | 'wallet' | 'credit-card' | 'trending-up';
  color: string;
}

const iconMap = {
  'piggy-bank': PiggyBank,
  'wallet': Wallet,
  'credit-card': CreditCard,
  'trending-up': TrendingUp,
};

export function AccountCard({ 
  type, 
  accountNumber, 
  balance, 
  currency, 
  icon, 
  color 
}: AccountCardProps) {
  const [showBalance, setShowBalance] = useState(true);
  const Icon = iconMap[icon];
  const isNegative = balance < 0;

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow border-border">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center shadow-md`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-accent"
          onClick={() => setShowBalance(!showBalance)}
        >
          {showBalance ? (
            <Eye className="w-4 h-4" />
          ) : (
            <EyeOff className="w-4 h-4" />
          )}
        </Button>
      </div>
      
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">{type}</div>
        <div className="text-sm text-muted-foreground">{accountNumber}</div>
        <div className={`text-2xl font-semibold ${isNegative ? 'text-destructive' : ''}`}>
          {showBalance ? (
            <>
              {isNegative ? '-' : ''}
              {currency} {Math.abs(balance).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </>
          ) : (
            '••••••'
          )}
        </div>
      </div>
    </Card>
  );
}