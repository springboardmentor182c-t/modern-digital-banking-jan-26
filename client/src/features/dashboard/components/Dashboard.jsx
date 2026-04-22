import React, { useState, useEffect } from 'react';
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
import { ArrowUpRight, ArrowDownRight, TrendingUp, Calendar, Gift, Wallet, CreditCard, Landmark, Banknote, Sparkles, Target, Bot, Loader2 } from 'lucide-react';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function Dashboard() {
  const { accounts } = useAccounts();
  const { transactions } = useTransactions();
  const { budgets } = useBudgets();
  const { bills } = useBills();
  const { rewards } = useRewards();

  const [animatingBudgets, setAnimatingBudgets] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatingBudgets(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const [aiSummary, setAiSummary] = useState(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiError, setAiError] = useState(null);

  const generateAiSummary = async () => {
    setIsGeneratingAi(true);
    setAiError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/ai-insights/summary`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}` // simple assumption based on standard JWT integration
        }
      });
      if (!response.ok) {
        throw new Error('Failed to generate summary');
      }
      const data = await response.json();
      setAiSummary(data.summary);
    } catch (err) {
      setAiError('Oops! We encountered an error generating your summary. Please ensure your API key is correctly configured.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

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
    <div className="space-y-8 animate-in fade-in duration-700 pb-12 relative min-h-screen">
      {/* Decorative Background Glows */}
      <div className="absolute top-0 left-0 right-0 h-[600px] bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/20 via-primary/5 to-background -z-10 opacity-80 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-success/10 via-transparent to-transparent -z-10 opacity-50 pointer-events-none" />

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

      {/* AI Assistant Card */}
      <Card className="relative overflow-hidden group border-primary/20 shadow-xl bg-gradient-to-br from-card to-primary/5">
        <CardHeader className="pb-3 border-b border-border/50">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-full">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <span className="font-extrabold text-xl">Neo AI Financial Assistant</span>
            </div>
            {!aiSummary && !isGeneratingAi && (
              <Button onClick={generateAiSummary} className="rounded-full shadow-lg hover:shadow-primary/25 transition-all">
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Weekly Summary
              </Button>
            )}
          </CardTitle>
          <CardDescription className="text-sm font-medium ml-11">
            Get personalized, contextual insights on your recent spending habits powered by AI.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {isGeneratingAi && (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground space-y-4 animate-pulse">
               <Loader2 className="h-8 w-8 animate-spin text-primary" />
               <p className="font-medium">Analyzing your recent transactions and preparing insights...</p>
            </div>
          )}
          {aiError && (
             <div className="p-4 bg-destructive/10 text-destructive rounded-xl text-sm font-medium flex items-center gap-2">
                <Bot className="h-5 w-5" />
                {aiError}
             </div>
          )}
          {aiSummary && !isGeneratingAi && (
            <div className="space-y-4 ml-2">
              <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-li:font-medium prose-p:text-base">
                {/* We are rendering plain text with simple newlines for now. Using a markdown parser would be better, but we'll simulate basic parsing */}
                {aiSummary.split('\n').map((paragraph, i) => {
                  if (paragraph.trim().startsWith('- ') || paragraph.trim().startsWith('* ')) {
                     return <li key={i} className="ml-4 mb-2">{paragraph.replace(/^[-*]\s/, '')}</li>;
                  } else if (paragraph.trim() !== '') {
                     return <p key={i} className="mb-4 text-foreground/90">{paragraph}</p>;
                  }
                  return null;
                })}
              </div>
              <div className="flex justify-end mt-4">
                 <Button variant="outline" size="sm" onClick={generateAiSummary} className="rounded-full text-xs font-bold border-primary/20 hover:bg-primary/10">
                   <Sparkles className="h-3 w-3 mr-1.5" /> Regenerate
                 </Button>
              </div>
            </div>
          )}
          {!aiSummary && !isGeneratingAi && !aiError && (
            <div className="py-6 text-center text-muted-foreground">
               <p className="text-sm">Click the button above to generate your first AI summary.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="relative overflow-hidden group hover:border-primary/50 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/30 transition-all duration-500 shadow-2xl bg-card/40 backdrop-blur-xl border border-white/10 dark:border-white/5">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent z-0 opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
              <div className="p-1.5 rounded-md bg-gradient-to-br from-primary/30 to-primary/5"><Landmark className="h-3.5 w-3.5 text-primary" /></div>
              Total Net Worth
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl md:text-5xl font-black tracking-tighter transition-transform group-hover:scale-[1.02] duration-500 bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/60">
              {formatCurrency(totalBalance)}
            </div>
            <div className="flex items-center gap-2 mt-4 text-success font-medium bg-success/10 w-fit px-2.5 py-1 rounded-full border border-success/20">
              <TrendingUp className="h-3.5 w-3.5" />
              <span className="text-xs font-bold tracking-wide">4.2% top up</span>
            </div>
          </CardContent>
          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors duration-500 pointer-events-none" />
        </Card>

        <Card className="relative overflow-hidden group hover:border-destructive/50 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl hover:shadow-destructive/30 transition-all duration-500 shadow-2xl bg-card/40 backdrop-blur-xl border border-white/10 dark:border-white/5">
          <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 to-transparent z-0 opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
              <div className="p-1.5 rounded-md bg-destructive/10"><Banknote className="h-3.5 w-3.5 text-destructive" /></div>
              Monthly Expenses
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl md:text-5xl font-black tracking-tighter transition-transform group-hover:scale-[1.02] duration-500">
              {formatCurrency(monthlySpending)}
            </div>
            <div className="flex items-center gap-2 mt-4 text-warning font-medium bg-warning/10 w-fit px-2.5 py-1 rounded-full border border-warning/20">
              <ArrowDownRight className="h-3.5 w-3.5" />
              <span className="text-xs font-bold tracking-wide">On Track</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group bg-gradient-to-br from-violet-600 via-fuchsia-600 to-indigo-600 border-none shadow-xl shadow-primary/40 text-white transition-all duration-500 hover:-translate-y-2 hover:scale-[1.03] hover:shadow-2xl hover:shadow-primary/60">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.05] mix-blend-overlay" />
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="flex items-center gap-2 text-xs font-bold text-white/80 uppercase tracking-widest">
              <div className="p-1.5 rounded-md bg-white/20 backdrop-blur-md"><Gift className="h-3.5 w-3.5 text-white" /></div>
              Available Rewards
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-5xl font-black tracking-tighter flex items-center gap-2 group-hover:scale-[1.03] duration-500 drop-shadow-md cursor-default">
              {rewardPoints.toLocaleString()}
              <Sparkles className="h-7 w-7 text-warning fill-warning drop-shadow-[0_0_15px_rgba(250,204,21,0.8)] animate-pulse" />
            </div>
            <div className="flex items-center gap-2 mt-4 text-primary-foreground font-medium bg-white/10 w-fit px-3 py-1 rounded-full border border-white/20 backdrop-blur-sm shadow-inner shadow-white/10">
              <span className="text-xs font-bold tracking-wide">Value: ₹{(rewardPoints / 10).toFixed(0)}</span>
            </div>
          </CardContent>
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/20 rounded-full blur-3xl pointer-events-none" />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Spending Trends Chart */}
        <Card className="border-border/50 shadow-xl hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/40 transition-all duration-500">
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
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--border)" opacity={0.4} />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 13, fontWeight: 600 }}
                    dy={15}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}
                    tickFormatter={(value) => `₹${value / 1000}k`}
                    dx={-10}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(var(--card), 0.95)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid var(--border)',
                      borderRadius: '16px',
                      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
                    }}
                    itemStyle={{ color: 'var(--primary)', fontWeight: '900', fontSize: '1.2rem' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="var(--primary)"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorAmount)"
                    activeDot={{ r: 6, strokeWidth: 0, fill: "var(--primary)" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Budget Progress */}
        <Card className="border-border/50 shadow-xl hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/40 transition-all duration-500">
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
                  value={animatingBudgets ? 100 : budget.percentage}
                  className="h-2.5 rounded-full bg-muted/50"
                  indicatorClassName={cn(
                    "transition-transform duration-[1500ms] ease-out",
                    budget.percentage > 90 ? "bg-destructive" : budget.percentage > 70 ? "bg-warning" : "bg-gradient-to-r from-primary to-purple-400"
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
        <Card className="border-border/50 shadow-xl hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/40 transition-all duration-500">
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
                className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
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
        <Card className="border-border/50 shadow-xl hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/40 transition-all duration-500">
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
