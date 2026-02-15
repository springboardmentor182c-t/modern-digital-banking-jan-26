import React from 'react';
import { useAccounts } from '../../accounts';
import { useTransactions } from '../../transactions';
import { useBudgets } from '../../budgets';
import { useBills } from '../../bills';
import { useRewards } from '../../rewards';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Progress } from '../../../components/ui/progress';
import { formatCurrency, formatDate, cn } from '../../../lib/utils';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Calendar, Gift, Wallet, CreditCard, Landmark, Banknote, Sparkles, Target } from 'lucide-react';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function Dashboard() {
  const { accounts } = useAccounts();
  const { transactions } = useTransactions();
  const { budgets } = useBudgets();
  const { bills } = useBills();
  const { rewards } = useRewards();

  const totalBalance = accounts?.reduce((sum, acc) => sum + acc.balance, 0) || 0;
  const recentTransactions = transactions?.slice(0, 5) || [];

  // Calculate monthly spending
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlySpending = transactions
    ?.filter(t => {
      const d = new Date(t.txn_date);
      return t.txn_type === 'debit' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    ?.reduce((sum, t) => sum + t.amount, 0) || 0;

  // Reward data from state
  const rewardPoints = rewards?.reduce((sum, r) => sum + r.points_balance, 0) || 0;

  // Budget data
  const budgetData = budgets?.map(budget => ({
    category: budget.category,
    spent: budget.spent_amount || 0,
    limit: budget.limit_amount,
    percentage: Math.min(((budget.spent_amount || 0) / budget.limit_amount) * 100, 100)
  })) || [];

  // Spending trends (calculated from real transactions)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const last5Months = [];
  for (let i = 4; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const m = d.getMonth();
    const y = d.getFullYear();
    const amount = transactions
      ?.filter(t => {
        const td = new Date(t.txn_date);
        return t.txn_type === 'debit' && td.getMonth() === m && td.getFullYear() === y;
      })
      ?.reduce((sum, t) => sum + t.amount, 0) || 0;
    last5Months.push({ month: months[m], amount });
  }
  const spendingTrends = last5Months;

  // Category Breakdown (calculated from real transactions)
  const categories = {};
  transactions
    ?.filter(t => t.txn_type === 'debit')
    ?.forEach(t => {
      categories[t.category] = (categories[t.category] || 0) + t.amount;
    });

  const colors = ['#7c3aed', '#a78bfa', '#c4b5fd', '#10b981', '#f59e0b', '#ef4444'];
  const categoryBreakdown = Object.entries(categories).map(([name, value], i) => ({
    name,
    value,
    color: colors[i % colors.length]
  })).slice(0, 6);

  const upcomingBills = bills?.filter(b => b.status === 'upcoming')?.slice(0, 3) || [];

  const getAccountIcon = (type) => {
    switch (type) {
      case 'savings': return <Landmark className="h-5 w-5 text-primary" />;
      case 'credit_card': return <CreditCard className="h-5 w-5 text-primary" />;
      default: return <Wallet className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Financial Overview</h1>
          <p className="text-muted-foreground mt-2 text-lg">Detailed insights into your wealth and spending patterns</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-2xl border border-border/50 backdrop-blur-sm">
          <Calendar className="h-4 w-4 text-primary" />
          <span className="text-sm font-bold">{new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="relative overflow-hidden group hover:border-primary/40 transition-all shadow-xl bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Net Worth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold tracking-tighter transition-transform group-hover:scale-[1.02] duration-300">
              {formatCurrency(totalBalance)}
            </div>
            <div className="flex items-center gap-1.5 mt-3 text-success font-medium">
              <div className="p-1 rounded-full bg-success/10">
                <TrendingUp className="h-3.5 w-3.5" />
              </div>
              <span className="text-sm">4.2% increase since last month</span>
            </div>
          </CardContent>
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:bg-primary/10 transition-colors" />
        </Card>

        <Card className="relative overflow-hidden group hover:border-destructive/40 transition-all shadow-xl bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Expenses (Current Month)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold tracking-tighter transition-transform group-hover:scale-[1.02] duration-300">
              {formatCurrency(monthlySpending)}
            </div>
            <div className="flex items-center gap-1.5 mt-3 text-destructive font-medium">
              <div className="p-1 rounded-full bg-destructive/10">
                <ArrowDownRight className="h-3.5 w-3.5" />
              </div>
              <span className="text-sm">Ahead of budget by 12,000</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group bg-gradient-to-br from-primary to-primary-foreground border-none shadow-2xl shadow-primary/20 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-white/60 uppercase tracking-widest">Available Rewards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold tracking-tighter flex items-center gap-2 group-hover:scale-[1.02] duration-300">
              {rewardPoints.toLocaleString()}
              <Sparkles className="h-6 w-6 text-warning fill-warning" />
            </div>
            <div className="flex items-center gap-1.5 mt-3 text-white/90 font-medium">
              <div className="p-1 rounded-full bg-white/10">
                <Gift className="h-3.5 w-3.5" />
              </div>
              <span className="text-sm">Points worth ₹{(rewardPoints / 10).toFixed(0)} in vouchers</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Spending Trends Chart */}
        <Card className="border-border/50 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Spending Trends
            </CardTitle>
            <CardDescription>Visualizing your expenditure over the past 5 months</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={spendingTrends}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12, fontWeight: 500 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12, fontWeight: 500 }}
                    tickFormatter={(value) => `₹${value / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '16px',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                    }}
                    itemStyle={{ color: 'var(--foreground)', fontWeight: 'bold' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="var(--primary)"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorAmount)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Budget Progress */}
        <Card className="border-border/50 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Budget Utilization
            </CardTitle>
            <CardDescription>Live tracking of your active monthly limits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {budgetData.map((budget) => (
              <div key={budget.category} className="group">
                <div className="flex items-end justify-between mb-3 px-1">
                  <div>
                    <span className="text-sm font-bold capitalize transition-colors group-hover:text-primary">{budget.category}</span>
                    <div className="text-xs text-muted-foreground font-medium">{budget.percentage.toFixed(0)}% Utilized</div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold">{formatCurrency(budget.spent)}</span>
                    <span className="text-xs text-muted-foreground ml-1.5 font-medium">/ {formatCurrency(budget.limit)}</span>
                  </div>
                </div>
                <Progress
                  value={budget.percentage}
                  className="h-2.5 rounded-full bg-muted/50"
                  indicatorClassName={cn(
                    budget.percentage > 90 ? "bg-destructive" : budget.percentage > 70 ? "bg-warning" : "bg-primary"
                  )}
                />
              </div>
            ))}
            {budgetData.length === 0 && (
              <div className="p-8 text-center bg-muted/20 rounded-2xl border border-dashed border-border/50">
                <p className="text-sm text-muted-foreground">No active budgets found for this month</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Linked Accounts */}
        <Card className="border-border/50 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle>Linked Accounts</CardTitle>
              <CardDescription>Manage your synchronized bank feeds</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-primary font-bold hover:bg-primary/10">View All</Button>
          </CardHeader>
          <CardContent className="space-y-4 pt-4 border-t border-border/50">
            {accounts?.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 hover:bg-muted/50 transition-all cursor-pointer group border border-transparent hover:border-primary/20"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-card flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    {getAccountIcon(account.account_type)}
                  </div>
                  <div>
                    <div className="font-bold text-sm tracking-tight">{account.bank_name}</div>
                    <div className="text-xs text-muted-foreground font-medium">
                      {account.account_type} • {account.masked_account}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg tracking-tight">{formatCurrency(account.balance, account.currency)}</div>
                  <Badge variant="secondary" className="bg-success/10 text-success border-none text-[10px] mt-1 h-4">Verified</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="border-border/50 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest transactions across all vectors</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-primary font-bold hover:bg-primary/10">History</Button>
          </CardHeader>
          <CardContent className="space-y-3 pt-4 border-t border-border/50">
            {recentTransactions.map((txn) => (
              <div
                key={txn.id}
                className="flex items-center justify-between p-3.5 rounded-xl hover:bg-muted/30 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110",
                      txn.txn_type === 'credit' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                    )}
                  >
                    {txn.txn_type === 'credit' ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                  </div>
                  <div>
                    <div className="font-bold text-sm tracking-tight">{txn.description}</div>
                    <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{txn.category} • {formatDate(txn.txn_date)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={cn(
                    "font-bold text-base tracking-tight",
                    txn.txn_type === 'credit' ? 'text-success' : ''
                  )}>
                    {txn.txn_type === 'credit' ? '+' : '-'} {formatCurrency(txn.amount, txn.currency)}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
