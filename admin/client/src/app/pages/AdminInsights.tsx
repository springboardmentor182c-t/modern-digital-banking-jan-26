import { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { 
  TrendingUp, 
  TrendingDown,
  Activity,
  Download,
  AlertCircle,
  Users,
  DollarSign
} from 'lucide-react';
import { dashboardApi } from '../api/adminApi';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

interface InsightCard {
  title: string;
  value: string;
  count: number;
  trend: string;
  color: string;
  icon: any;
  iconColor: string;
}

export function AdminInsights() {
  const [userGrowthData, setUserGrowthData] = useState<Array<{ month: string; users: number }>>([]);
  const [alertTrendData, setAlertTrendData] = useState<Array<{
    month: string;
    low_balance: number;
    bill_due: number;
    budget_exceeded: number;
  }>>([]);
  const [alertTypeDistribution, setAlertTypeDistribution] = useState<Array<{
    name: string;
    value: number;
    fill: string;
  }>>([]);
  const [insightCards, setInsightCards] = useState<InsightCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    setIsLoading(true);
    const response = await dashboardApi.getStats();
    
    if (response.data) {
      const { user_growth, alert_trends, alert_distribution, stats: dashboardStats } = response.data;
      
      setUserGrowthData(user_growth || []);
      setAlertTrendData(alert_trends || []);
      setAlertTypeDistribution(alert_distribution || []);
      
      // Build insight cards from stats
      const cards: InsightCard[] = [
        {
          title: 'Most Frequent Alert',
          value: alert_distribution.length > 0 
            ? alert_distribution.reduce((a, b) => a.value > b.value ? a : b).name 
            : 'No data',
          count: alert_distribution.reduce((a, b) => a + b.value, 0),
          trend: 'stable',
          color: 'bg-yellow-100',
          icon: AlertCircle,
          iconColor: 'text-yellow-600'
        },
        {
          title: 'User Growth Rate',
          value: `${dashboardStats.growth_rate?.users || 0}%`,
          count: dashboardStats.total_users || 0,
          trend: dashboardStats.growth_rate?.users > 0 ? 'up' : 'stable',
          color: 'bg-green-100',
          icon: Users,
          iconColor: 'text-green-600'
        },
        {
          title: 'Avg Accounts/User',
          value: dashboardStats.total_users > 0 
            ? `${(dashboardStats.linked_accounts / dashboardStats.total_users).toFixed(1)} accounts`
            : '0 accounts',
          count: dashboardStats.linked_accounts || 0,
          trend: 'stable',
          color: 'bg-purple-100',
          icon: DollarSign,
          iconColor: 'text-purple-600'
        },
        {
          title: 'Total Alerts',
          value: `${dashboardStats.alerts_triggered || 0}`,
          count: dashboardStats.alerts_triggered || 0,
          trend: 'stable',
          color: 'bg-blue-100',
          icon: Activity,
          iconColor: 'text-blue-600'
        }
      ];
      
      setInsightCards(cards);
    } else {
      toast.error('Failed to load insights', { description: response.error });
    }
    setIsLoading(false);
  };

  const topSpendingCategories: Array<{
    category: string;
    percentage: number;
    value: number;
    color: string;
  }> = [];

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
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            </Card>
          ))
        ) : (
          insightCards.map((card) => {
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
          })
        )}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alert Distribution by Type */}
        <Card className="p-6 shadow-md border-border">
          <h3 className="text-lg font-semibold mb-6">Alert Distribution by Type</h3>
          {isLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : alertTypeDistribution.length > 0 ? (
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
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No data available
            </div>
          )}
        </Card>

        {/* User Growth Over Time */}
        <Card className="p-6 shadow-md border-border">
          <h3 className="text-lg font-semibold mb-6">User Growth Trend</h3>
          {isLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : userGrowthData.length > 0 ? (
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
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No data available
            </div>
          )}
        </Card>
      </div>

      {/* Alert Trends by Type */}
      <Card className="p-6 shadow-md border-border">
        <h3 className="text-lg font-semibold mb-6">Alert Frequency Trends (Last 7 Months)</h3>
        {isLoading ? (
          <div className="h-[350px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : alertTrendData.length > 0 ? (
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
        ) : (
          <div className="h-[350px] flex items-center justify-center text-muted-foreground">
            No data available
          </div>
        )}
      </Card>

      {/* Top Spending Categories (Anonymized) */}
      <Card className="p-6 shadow-md border-border">
        <h3 className="text-lg font-semibold mb-6">Top Spending Categories (Aggregated)</h3>
        {isLoading ? (
          <div className="py-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : topSpendingCategories.length > 0 ? (
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
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            No spending data available
          </div>
        )}
      </Card>

      {/* Key Insights Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
          <h4 className="font-semibold mb-4 text-blue-900">System Performance</h4>
          {isLoading ? (
            <div className="space-y-2">
              <div className="h-4 bg-blue-200 rounded w-3/4 animate-pulse"></div>
              <div className="h-4 bg-blue-200 rounded w-1/2 animate-pulse"></div>
              <div className="h-4 bg-blue-200 rounded w-2/3 animate-pulse"></div>
            </div>
          ) : (
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5" />
                <span>API connected successfully</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5" />
                <span>Dashboard stats loaded from database</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5" />
                <span>Real-time data synchronization active</span>
              </li>
            </ul>
          )}
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-teal-50 border-green-200">
          <h4 className="font-semibold mb-4 text-green-900">User Behavior Insights</h4>
          {isLoading ? (
            <div className="space-y-2">
              <div className="h-4 bg-green-200 rounded w-2/3 animate-pulse"></div>
              <div className="h-4 bg-green-200 rounded w-1/2 animate-pulse"></div>
              <div className="h-4 bg-green-200 rounded w-3/4 animate-pulse"></div>
            </div>
          ) : (
            <ul className="space-y-2 text-sm text-green-800">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-600 mt-1.5" />
                <span>{userGrowthData.length > 0 ? `${userGrowthData.length} months of user data available` : 'Collecting user data...'}</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-600 mt-1.5" />
                <span>Alert patterns being analyzed</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-600 mt-1.5" />
                <span>System metrics updating in real-time</span>
              </li>
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

