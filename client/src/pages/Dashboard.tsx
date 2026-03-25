import { useState, useEffect } from 'react';
import api from '@/services/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AccountCard } from '@/components/AccountCard';
import { TransactionItem } from '@/components/TransactionItem';
import { BudgetProgress } from '@/components/BudgetProgress';
import { BillItem } from '@/components/BillItem';
import { StatCard } from '@/components/StatCard';
import { CurrencySummary } from '@/components/CurrencySummary';
import { Badge } from '@/components/ui/badge';
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export function Dashboard() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [rewards, setRewards] = useState({ totalPoints: 0, programName: 'SmartBank Rewards', tier: 'Bronze', pointsToNextTier: 0, recentEarnings: [] as any[] });
  const [alerts, setAlerts] = useState<any[]>([]);
  const [spendingByCategory, setSpendingByCategory] = useState<any[]>([]);
  const [cashFlowData, setCashFlowData] = useState<any[]>([{ month: 'N/A', income: 0, expenses: 0 }]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await api.getUserDashboard();
        setAccounts(data.accounts || []);
        setTransactions(data.transactions || []);
        setBudgets(data.budgets || []);
        setBills(data.bills || []);
        setRewards(data.rewards || rewards);
        setAlerts(data.alerts || []);
        setSpendingByCategory(data.spendingByCategory || []);
        setCashFlowData(data.cashFlowData?.length ? data.cashFlowData : [{ month: 'N/A', income: 0, expenses: 0 }]);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const recentTransactions = transactions.slice(0, 5);
  const upcomingBills = bills.filter(b => b.status === 'upcoming').slice(0, 3);
  const topBudgets = budgets.slice(0, 3);

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const monthlyIncome = cashFlowData[cashFlowData.length - 1]?.income || 0;
  const monthlyExpenses = cashFlowData[cashFlowData.length - 1]?.expenses || 0;

  const alertIcons = {
    warning: AlertTriangle,
    success: CheckCircle,
    info: Info
  };

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Balance"
          value={`₹${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          change="+12.5% from last month"
          changeType="positive"
          icon={DollarSign}
          iconColor="bg-primary"
        />
        <StatCard
          title="Monthly Income"
          value={`₹${monthlyIncome.toLocaleString('en-US')}`}
          change="+5.2% from last month"
          changeType="positive"
          icon={ArrowUpRight}
          iconColor="bg-success"
        />
        <StatCard
          title="Monthly Expenses"
          value={`₹${monthlyExpenses.toLocaleString('en-US')}`}
          change="-8.4% from last month"
          changeType="positive"
          icon={ArrowDownRight}
          iconColor="bg-warning"
        />
        <StatCard
          title="Rewards Points"
          value={rewards.totalPoints.toLocaleString('en-US')}
          change={`${rewards.tier} Member`}
          changeType="neutral"
          icon={TrendingUp}
          iconColor="bg-secondary"
        />
      </div>

      {/* Accounts Overview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Account Overview</h2>
          <Button variant="outline" size="sm" className="border-border hover:bg-accent">View All</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {accounts.map((account) => (
            <AccountCard key={account.id} {...account} />
          ))}
        </div>
      </div>

      {/* Currency Summary */}
      <CurrencySummary />

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Transactions */}
          <Card className="p-6 shadow-md border-border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Recent Transactions</h3>
              <Button variant="ghost" size="sm" className="hover:bg-accent">View All</Button>
            </div>
            <div className="space-y-2">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction) => (
                  <TransactionItem key={transaction.id} {...transaction} />
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No recent transactions</p>
              )}
            </div>
          </Card>

          {/* Cash Flow Chart */}
          <Card className="p-6 shadow-md border-border">
            <h3 className="text-lg font-semibold mb-6">Cash Flow</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cashFlowData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="income" fill="#a8e6cf" name="Income" radius={[8, 8, 0, 0]} />
                <Bar dataKey="expenses" fill="#f4a4a4" name="Expenses" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Spending by Category */}
          <Card className="p-6 shadow-md border-border">
            <h3 className="text-lg font-semibold mb-4">Spending Breakdown</h3>
            {spendingByCategory.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={spendingByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {spendingByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-4">
                  {spendingByCategory.map((category) => (
                    <div key={category.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.fill }}
                        />
                        <span>{category.name}</span>
                      </div>
                      <span className="font-medium">₹{category.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No spending data yet</p>
            )}
          </Card>

          {/* Alerts */}
          <Card className="p-6 shadow-md border-border">
            <h3 className="text-lg font-semibold mb-4">Alerts</h3>
            <div className="space-y-3">
              {alerts.length > 0 ? (
                alerts.map((alert) => {
                  const Icon = alertIcons[alert.type as keyof typeof alertIcons] || Info;
                  const colors = {
                    warning: 'text-warning',
                    success: 'text-success',
                    info: 'text-info'
                  };

                  return (
                    <div key={alert.id} className="flex gap-3 p-3 bg-accent/50 rounded-lg border border-border">
                      <Icon className={`w-5 h-5 ${colors[alert.type as keyof typeof colors] || 'text-info'} flex-shrink-0 mt-0.5`} />
                      <div className="flex-1">
                        <p className="text-sm">{alert.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{alert.date}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No alerts</p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Budget Summary */}
      <Card className="p-6 shadow-md border-border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Budget Summary</h3>
          <Button variant="ghost" size="sm" className="hover:bg-accent">Manage Budgets</Button>
        </div>
        <div className="space-y-6">
          {topBudgets.length > 0 ? (
            topBudgets.map((budget) => (
              <BudgetProgress key={budget.id} {...budget} />
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No budgets created yet</p>
          )}
        </div>
      </Card>

      {/* Bills & Reminders */}
      <Card className="p-6 shadow-md border-border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Upcoming Bills</h3>
          <Button variant="ghost" size="sm" className="hover:bg-accent">View All</Button>
        </div>
        <div className="space-y-2">
          {upcomingBills.length > 0 ? (
            upcomingBills.map((bill) => (
              <BillItem key={bill.id} {...bill} />
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No upcoming bills</p>
          )}
        </div>
      </Card>
    </div>
  );
}