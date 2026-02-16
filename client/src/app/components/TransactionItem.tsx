import { Badge } from '@/app/components/ui/badge';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';

interface TransactionItemProps {
  merchant: string;
  category: string;
  date: string;
  amount: number;
  type: 'debit' | 'credit';
}

export function TransactionItem({ 
  merchant, 
  category, 
  date, 
  amount, 
  type 
}: TransactionItemProps) {
  const isCredit = type === 'credit';
  
  return (
    <div className="flex items-center justify-between py-3 hover:bg-accent/50 px-4 -mx-4 rounded-lg transition-colors">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          isCredit ? 'bg-green-100' : 'bg-gray-100'
        }`}>
          {isCredit ? (
            <ArrowUpRight className="w-5 h-5 text-green-600" />
          ) : (
            <ArrowDownLeft className="w-5 h-5 text-gray-600" />
          )}
        </div>
        <div>
          <div className="font-medium">{merchant}</div>
          <div className="text-sm text-muted-foreground">{category}</div>
        </div>
      </div>
      
      <div className="text-right">
        <div className={`font-semibold ${
          isCredit ? 'text-green-600' : 'text-foreground'
        }`}>
          {isCredit ? '+' : '-'}₹{Math.abs(amount).toFixed(2)}
        </div>
        <div className="text-sm text-muted-foreground">
          {new Date(date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          })}
        </div>
      </div>
    </div>
  );
}