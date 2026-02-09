import { Card } from '../app/components/ui/card';
import { Badge } from '../app/components/ui/badge';
import { Button } from '../app/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown,
  Activity,
  Download,
  AlertCircle,
  Users,
  DollarSign
} from 'lucide-react';
import { alertTrendData, alertTypeDistribution, userGrowthData } from '../app/data/adminMockData';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function AdminInsights() {
  const insightCards = [
    {
      title: 'Most Frequent Alert',
      value: 'Bill Due Reminders',
      count: 62,
      trend: 'up',
      color: 'bg-yellow-100',
      icon: AlertCircle,
      iconColor: 'text-yellow-600'
    },
    {
      title: 'Peak Alert Time',
      value: '2:00 PM - 4:00 PM',
      count: 45,
      trend: 'stable',
      color: 'bg-blue-100',
      icon: Activity,
      iconColor: 'text-blue-600'
    },
    {
      title: 'User Growth Rate',
      value: '+12.5%',
      count: 155,
      trend: 'up',
      color: 'bg-green-100',
      icon: Users,
      iconColor: 'text-green-600'
    },
    {
      title: 'Avg Accounts/User',
      value: '3.1 accounts',
      count: 3856,
      trend: 'up',
      color: 'bg-purple-100',
      icon: DollarSign,
      iconColor: 'text-purple-600'
    }
  ];

  const topSpendingCategories = [
    { category: 'Bills & Utilities', percentage: 35, value: 680, color: '#daf5e7' },
    { category: 'Groceries', percentage: 24, value: 456, color: '#a8e6cf' },
    { category: 'Shopping', percentage: 17, value: 320, color: '#f4a4a4' },
    { category: 'Dining Out', percentage: 15, value: 285, color: '#ffd4a3' },
    { category: 'Transportation', percentage: 9, value: 145, color: '#7eb9e3' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">System Insights</h2>
          <p className="text-muted-foreground mt-1">Aggregated analytics and user behavior patterns</p>
        </div>
        <Button variant="outline" className="border-border hover:bg-accent">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {insightCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className={`p-6 ${card.color} border-0`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">{card.title}</p>
                  <p className="text-lg font-semibold">{card.value}</p>
                </div>
                <div className={`w-10 h-10 bg-white/50 rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="secondary" className="bg-white/50">
                  {card.count} total
                </Badge>
                {card.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-600" />}
                {card.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-600" />}
                {card.trend === 'stable' && <Activity className="w-4 h-4 text-gray-600" />}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alert Distribution by Type */}
        <Card className="p-6 shadow-md border-border">
          <h3 className="text-lg font-semibold mb-6">Alert Distribution by Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={alertTypeDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {alertTypeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* User Growth Over Time */}
        <Card className="p-6 shadow-md border-border">
          <h3 className="text-lg font-semibold mb-6">User Growth Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userGrowthData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="users" 
                stroke="#7eb9e3" 
                strokeWidth={3}
                dot={{ fill: '#7eb9e3', r: 5 }}
                name="Total Users"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Alert Trends by Type */}
      <Card className="p-6 shadow-md border-border">
        <h3 className="text-lg font-semibold mb-6">Alert Frequency Trends (Last 7 Months)</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={alertTrendData}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="low_balance" fill="#f4a4a4" name="Low Balance" radius={[8, 8, 0, 0]} />
            <Bar dataKey="bill_due" fill="#ffd4a3" name="Bill Due" radius={[8, 8, 0, 0]} />
            <Bar dataKey="budget_exceeded" fill="#7eb9e3" name="Budget Exceeded" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Top Spending Categories (Anonymized) */}
      <Card className="p-6 shadow-md border-border">
        <h3 className="text-lg font-semibold mb-6">Top Spending Categories (Aggregated)</h3>
        <div className="space-y-4">
          {topSpendingCategories.map((category) => (
            <div key={category.category} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded" 
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="font-medium">{category.category}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">₹{category.value}</span>
                  <Badge variant="secondary">{category.percentage}%</Badge>
                </div>
              </div>
              <div className="h-2 bg-accent rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all"
                  style={{ 
                    width: `${category.percentage}%`,
                    backgroundColor: category.color
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Key Insights Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
          <h4 className="font-semibold mb-4 text-blue-900">System Performance</h4>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5" />
              <span>Alert response time averaging under 2 minutes</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5" />
              <span>User engagement rate increased by 15% this month</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5" />
              <span>Peak usage hours: 2 PM - 4 PM on weekdays</span>
            </li>
          </ul>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-teal-50 border-green-200">
          <h4 className="font-semibold mb-4 text-green-900">User Behavior Insights</h4>
          <ul className="space-y-2 text-sm text-green-800">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-600 mt-1.5" />
              <span>71% of users actively monitor budgets weekly</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-600 mt-1.5" />
              <span>Average 3.1 linked accounts per verified user</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-600 mt-1.5" />
              <span>Bill payment reminders reduce late payments by 40%</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
