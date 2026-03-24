import { Progress } from '@/app/components/ui/progress';
import { 
  ShoppingBasket, 
  Utensils, 
  Car, 
  Film, 
  ShoppingBag 
} from 'lucide-react';

interface BudgetProgressProps {
  category: string;
  spent: number;
  limit: number;
  icon: 'shopping-basket' | 'utensils' | 'car' | 'film' | 'shopping-bag';
  color: string;
}

const iconMap = {
  'shopping-basket': ShoppingBasket,
  'utensils': Utensils,
  'car': Car,
  'film': Film,
  'shopping-bag': ShoppingBag,
};

export function BudgetProgress({ 
  category, 
  spent, 
  limit, 
  icon, 
  color 
}: BudgetProgressProps) {
  const Icon = iconMap[icon];
  const percentage = (spent / limit) * 100;
  const isNearLimit = percentage >= 90;
  const isOverLimit = percentage >= 100;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <div className="font-medium">{category}</div>
        </div>
        <div className="text-sm">
          <span className={`font-semibold ${isOverLimit ? 'text-destructive' : ''}`}>
            ₹{spent.toFixed(2)}
          </span>
          <span className="text-muted-foreground"> / ₹{limit.toFixed(2)}</span>
        </div>
      </div>
      
      <Progress 
        value={Math.min(percentage, 100)} 
        className={`h-2 ${isOverLimit ? '[&>div]:bg-destructive' : isNearLimit ? '[&>div]:bg-warning' : ''}`}
      />
      
      <div className="text-xs text-muted-foreground text-right">
        {percentage.toFixed(0)}% of budget used
      </div>
    </div>
  );
}