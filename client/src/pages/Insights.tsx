import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  CheckCircle,
  Info,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign
} from 'lucide-react';
import { alerts, spendingByCategory, cashFlowData } from '@/data/mockData';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar
} from 'recharts';

export function Insights() {
  const alertIcons = {
    warning: AlertTriangle,
    success: CheckCircle,
    info: Info
  };

  const alertColors = {
    warning: 'bg-orange-50 border-orange-200',
    success: 'bg-green-50 border-green-200',
    info: 'bg-blue-50 border-blue-200'
  };

  const iconColors = {
    warning: 'text-orange-600',
    success: 'text-green-600',
    info: 'text-blue-600'
  };

  const totalIncome = cashFlowData.reduce((sum, d) => sum + d.income, 0);
  const totalExpenses = cashFlowData.reduce((sum, d) => sum + d.expenses, 0);
  const netSavings = totalIncome - totalExpenses;
  const savingsRate = (netSavings / totalIncome) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Insights & Alerts</h2>
          <p className="text-muted-foreground mt-1">Track your financial health and get personalized insights</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <p className="text-sm text-muted-foreground">Net Savings (7 months)</p>
              <p className="text-3xl font-semibold">₹{netSavings.toLocaleString()}</p>
              <div className="flex items-center gap-1 text-sm text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span>{savingsRate.toFixed(1)}% savings rate</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <p className="text-sm text-muted-foreground">Avg Monthly Income</p>
              <p className="text-3xl font-semibold">
                ₹{(totalIncome / cashFlowData.length).toLocaleString(undefined, {
                  maximumFractionDigits: 0
                })}
              </p>
              <div className="flex items-center gap-1 text-sm text-blue-600">
                <TrendingUp className="w-4 h-4" />
                <span>+2.5% vs last period</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <p className="text-sm text-muted-foreground">Avg Monthly Expenses</p>
              <p className="text-3xl font-semibold">
                ₹{(totalExpenses / cashFlowData.length).toLocaleString(undefined, {
                  maximumFractionDigits: 0
                })}
              </p>
              <div className="flex items-center gap-1 text-sm text-green-600">
                <TrendingDown className="w-4 h-4" />
                <span>-5.2% vs last period</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Alerts */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Recent Alerts</h3>
          <Button variant="ghost" size="sm">Mark All Read</Button>
        </div>
        <div className="space-y-3">
          {alerts.map((alert) => {
            const Icon = alertIcons[alert.type];

            return (
              <div
                key={alert.id}
                className={`flex gap-4 p-4 rounded-lg border ${alertColors[alert.type]}`}
              >
                <Icon className={`w-5 h-5 ${iconColors[alert.type]} flex-shrink-0 mt-0.5`} />
                <div className="flex-1">
                  <p className="font-medium">{alert.message}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(alert.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <Button variant="ghost" size="sm">Dismiss</Button>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cash Flow Trend */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Cash Flow Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={cashFlowData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#10b981"
                strokeWidth={2}
                name="Income"
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#ef4444"
                strokeWidth={2}
                name="Expenses"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Spending by Category */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">Spending Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={spendingByCategory} layout="vertical">
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                {spendingByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Financial Health Score */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Financial Health Score</h3>
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Savings Rate</span>
              <Badge className="bg-green-100 text-green-700 border-0">Excellent</Badge>
            </div>
            <div className="h-2 bg-accent rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${savingsRate}%` }}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Budget Adherence</span>
              <Badge className="bg-blue-100 text-blue-700 border-0">Good</Badge>
            </div>
            <div className="h-2 bg-accent rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '78%' }} />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Payment History</span>
              <Badge className="bg-green-100 text-green-700 border-0">Excellent</Badge>
            </div>
            <div className="h-2 bg-accent rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: '95%' }} />
            </div>
          </div>
        </div>
      </Card>

      {/* Insights & Recommendations */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50">
        <h3 className="text-lg font-semibold mb-4">Personalized Insights</h3>
        <div className="space-y-4">
          <div className="flex gap-3 p-4 bg-white rounded-lg">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium mb-1">Great job on savings!</p>
              <p className="text-sm text-muted-foreground">
                You're saving {savingsRate.toFixed(1)}% of your income, which is above the recommended 20%.
              </p>
            </div>
          </div>

          <div className="flex gap-3 p-4 bg-white rounded-lg">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Info className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium mb-1">Opportunity to save more</p>
              <p className="text-sm text-muted-foreground">
                Consider reducing dining expenses by 10% to save an additional ₹28.50 per month.
              </p>
            </div>
          </div>

          <div className="flex gap-3 p-4 bg-white rounded-lg">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="font-medium mb-1">Investment opportunity</p>
              <p className="text-sm text-muted-foreground">
                Based on your savings, you could invest ₹500/month in a diversified portfolio.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}