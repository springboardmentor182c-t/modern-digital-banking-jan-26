import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Badge } from '@/app/components/ui/badge';
import { TrendingUp, TrendingDown, RefreshCw, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/app/components/ui/tooltip';

interface CurrencyBalance {
  currency: string;
  symbol: string;
  balance: number;
  exchangeRate: number;
  trend: 'up' | 'down';
  trendPercent: number;
}

export function CurrencySummary() {
  const [baseCurrency, setBaseCurrency] = useState('INR');
  const [lastUpdated] = useState(new Date());

  // Mock data - in real app this would come from ExchangeRate API
  const currencyBalances: CurrencyBalance[] = [
    {
      currency: 'INR',
      symbol: '₹',
      balance: 125000,
      exchangeRate: 1,
      trend: 'up',
      trendPercent: 0
    },
    {
      currency: 'USD',
      symbol: '$',
      balance: 850,
      exchangeRate: 83.25,
      trend: 'down',
      trendPercent: 0.5
    },
    {
      currency: 'EUR',
      symbol: '€',
      balance: 420,
      exchangeRate: 90.15,
      trend: 'up',
      trendPercent: 0.3
    },
    {
      currency: 'GBP',
      symbol: '£',
      balance: 250,
      exchangeRate: 105.80,
      trend: 'up',
      trendPercent: 0.2
    }
  ];

  const calculateConvertedValue = (balance: number, rate: number) => {
    if (baseCurrency === 'INR') {
      return balance * rate;
    }
    return balance;
  };

  const totalBalance = currencyBalances.reduce(
    (sum, curr) => sum + calculateConvertedValue(curr.balance, curr.exchangeRate),
    0
  );

  const getMinutesAgo = () => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastUpdated.getTime()) / 60000);
    return diff < 1 ? 'just now' : `${diff} min${diff > 1 ? 's' : ''} ago`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Multi-Currency Summary</CardTitle>
            <CardDescription>View and convert your balances across currencies</CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Base Currency</p>
              <Select value={baseCurrency} onValueChange={setBaseCurrency}>
                <SelectTrigger className="w-[100px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">INR ₹</SelectItem>
                  <SelectItem value="USD">USD $</SelectItem>
                  <SelectItem value="EUR">EUR €</SelectItem>
                  <SelectItem value="GBP">GBP £</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Balance */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-2">Total Balance (Converted)</p>
          <p className="text-3xl font-semibold">
            {baseCurrency === 'INR' ? '₹' : baseCurrency === 'USD' ? '$' : baseCurrency === 'EUR' ? '€' : '£'}
            {totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        {/* Currency Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currencyBalances.map((curr) => {
            const convertedValue = calculateConvertedValue(curr.balance, curr.exchangeRate);
            return (
              <div key={curr.currency} className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm text-muted-foreground">{curr.currency}</p>
                    <p className="text-xl font-semibold">
                      {curr.symbol}{curr.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={curr.trend === 'up' ? 'text-green-600 border-green-200' : 'text-red-600 border-red-200'}
                  >
                    {curr.trend === 'up' ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {curr.trendPercent > 0 && `${curr.trendPercent}%`}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Exchange Rate:</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="flex items-center gap-1">
                          <span className="font-medium">
                            {curr.currency === 'INR' ? '1.00' : curr.exchangeRate.toFixed(2)}
                          </span>
                          <Info className="h-3 w-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">
                            1 {curr.currency} = {curr.exchangeRate} {baseCurrency}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t">
                    <span className="text-muted-foreground">Converted Value:</span>
                    <span className="font-semibold">
                      {baseCurrency === 'INR' ? '₹' : baseCurrency === 'USD' ? '$' : baseCurrency === 'EUR' ? '€' : '£'}
                      {convertedValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Currency Breakdown Table */}
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium">Currency</th>
                <th className="text-right py-3 px-4 text-sm font-medium">Balance</th>
                <th className="text-right py-3 px-4 text-sm font-medium">Exchange Rate</th>
                <th className="text-right py-3 px-4 text-sm font-medium">Converted Value</th>
              </tr>
            </thead>
            <tbody>
              {currencyBalances.map((curr, index) => {
                const convertedValue = calculateConvertedValue(curr.balance, curr.exchangeRate);
                return (
                  <tr key={curr.currency} className={index !== currencyBalances.length - 1 ? 'border-b' : ''}>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{curr.currency}</span>
                        <span className="text-muted-foreground">{curr.symbol}</span>
                      </div>
                    </td>
                    <td className="text-right py-3 px-4">
                      {curr.symbol}{curr.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="text-right py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        {curr.currency === 'INR' ? '1.00' : curr.exchangeRate.toFixed(2)}
                        {curr.trendPercent > 0 && (
                          curr.trend === 'up' ? (
                            <TrendingUp className="h-3 w-3 text-green-600" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-red-600" />
                          )
                        )}
                      </div>
                    </td>
                    <td className="text-right py-3 px-4 font-medium">
                      {baseCurrency === 'INR' ? '₹' : baseCurrency === 'USD' ? '$' : baseCurrency === 'EUR' ? '€' : '£'}
                      {convertedValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Exchange Rate Info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/30 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-3 w-3" />
            <span>Rates updated {getMinutesAgo()}</span>
          </div>
          <span>Powered by ExchangeRate API</span>
        </div>
      </CardContent>
    </Card>
  );
}
