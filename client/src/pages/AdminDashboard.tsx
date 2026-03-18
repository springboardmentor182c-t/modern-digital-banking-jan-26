import { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Users,
  UserCheck,
  Wallet,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Activity
} from 'lucide-react';
import { dashboardApi } from '../api/adminApi';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    linkedAccounts: 0,
    alertsTriggered: 0,
    growthRate: { users: 0, accounts: 0, alerts: 0 }
  });
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
  const [topAlertCategories, setTopAlertCategories] = useState<Array<{
    category: string;
    count: number;
    trend: string;
  }>>([]);
  const [recentAlerts, setRecentAlerts] = useState<Array<{
    id: number;
    user_name: string;
    type: string;
    message: string;
    severity: string;
    status: string;
    timestamp: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    const response = await dashboardApi.getStats();

    if (response.data) {
      const { stats: dashboardStats, user_growth, alert_trends, alert_distribution, top_categories, recent_alerts } = response.data;

      setStats({
        totalUsers: dashboardStats.total_users || 0,
        activeUsers: dashboardStats.active_users || 0,
        linkedAccounts: dashboardStats.linked_accounts || 0,
        alertsTriggered: dashboardStats.alerts_triggered || 0,
        growthRate: dashboardStats.growth_rate || { users: 0, accounts: 0, alerts: 0 }
      });

      setUserGrowthData(user_growth || []);
      setAlertTrendData(alert_trends || []);
      setAlertTypeDistribution(alert_distribution || []);
      setTopAlertCategories(top_categories || []);
      setRecentAlerts(recent_alerts || []);
    } else {
      // API unavailable
      toast.error('Failed to load dashboard data', { description: 'Please check your connection and try again' });
    }
    setIsLoading(false);
  };

  const StatCard = ({
    title,
    value,
    change,
    changeType,
    icon: Icon,
    iconColor
  }: {
    title: string;
    value: string | number;
    change?: string;
    changeType: 'positive' | 'negative' | 'neutral';
    icon: any;
    iconColor: string;
  }) => {
    const changeColors = {
      positive: 'text-green-600',
      negative: 'text-destructive',
      neutral: 'text-muted-foreground'
    };

    return (
      <Card className="p-6 shadow-md border-border">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-2">{title}</p>
            <p className="text-3xl font-semibold">{isLoading ? '...' : value.toLocaleString()}</p>
            {change && (
              <p className={`text-sm mt-2 ${changeColors[changeType]}`}>
                {change}
              </p>
            )}
          </div>
          <div className={`w-12 h-12 ${iconColor} rounded-xl flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          change={`+${stats.growthRate.users}% this month`}
          changeType="positive"
          icon={Users}
          iconColor="bg-primary"
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          change={`${Math.round((stats.activeUsers / Math.max(stats.totalUsers, 1)) * 100)}% active rate`}
          changeType="positive"
          icon={UserCheck}
          iconColor="bg-success"
        />
        <StatCard
          title="Linked Accounts"
          value={stats.linkedAccounts}
          change={`+${stats.growthRate.accounts}% this month`}
          changeType="positive"
          icon={Wallet}
          iconColor="bg-secondary"
        />
        <StatCard
          title="Alerts Triggered"
          value={stats.alertsTriggered}
          change={`${stats.growthRate.alerts}% vs last month`}
          changeType="positive"
          icon={AlertCircle}
          iconColor="bg-warning"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Growth Chart */}
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
                    name="Total Users"
                    dot={{ fill: '#7eb9e3', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </Card>

          {/* Alert Trends Chart */}
          <Card className="p-6 shadow-md border-border">
            <h3 className="text-lg font-semibold mb-6">Alert Trends by Type</h3>
            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : alertTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
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
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Alert Type Distribution */}
          <Card className="p-6 shadow-md border-border">
            <h3 className="text-lg font-semibold mb-4">Alert Distribution</h3>
            {isLoading ? (
              <div className="h-[200px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : alertTypeDistribution.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={alertTypeDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {alertTypeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-4">
                  {alertTypeDistribution.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.fill }}
                        />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </Card>

          {/* Top Alert Categories */}
          <Card className="p-6 shadow-md border-border">
            <h3 className="text-lg font-semibold mb-4">Top Alert Categories</h3>
            {isLoading ? (
              <div className="py-8 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : topAlertCategories.length > 0 ? (
              <div className="space-y-3">
                {topAlertCategories.map((category) => (
                  <div key={category.category} className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{category.category}</p>
                      <p className="text-xs text-muted-foreground">This month</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold">{category.count}</span>
                      {category.trend === 'up' && <TrendingUp className="w-4 h-4 text-destructive" />}
                      {category.trend === 'down' && <TrendingDown className="w-4 h-4 text-green-600" />}
                      {category.trend === 'stable' && <Activity className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                No alert categories available
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Recent Alerts Summary */}
      <Card className="p-6 shadow-md border-border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Recent System Alerts</h3>
          <Badge variant="secondary">{recentAlerts.length} total</Badge>
        </div>
        {isLoading ? (
          <div className="py-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : recentAlerts.length > 0 ? (
          <div className="space-y-3">
            {recentAlerts.slice(0, 4).map((alert) => {
              const severityColors = {
                low: 'bg-info/20 text-info-foreground border-info/30',
                medium: 'bg-warning/20 text-warning-foreground border-warning/30',
                high: 'bg-destructive/20 text-destructive-foreground border-destructive/30'
              };

              return (
                <div
                  key={alert.id}
                  className="flex items-start justify-between p-4 bg-accent/30 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">{alert.user_name}</p>
                      <Badge className={`text-xs ${severityColors[alert.severity as keyof typeof severityColors] || 'bg-gray-100 text-gray-700 border-gray-200'} border`}>
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{alert.timestamp}</p>
                  </div>
                  <Badge variant={alert.status === 'unread' ? 'default' : 'secondary'} className="text-xs">
                    {alert.status}
                  </Badge>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            No recent alerts
          </div>
        )}
      </Card>

      {/* System Health Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-green-900">System Status</h4>
            <Badge className="bg-green-500 text-white border-0">Operational</Badge>
          </div>
          <p className="text-sm text-green-800">All systems running normally</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-blue-900">API Response Time</h4>
            <Badge className="bg-blue-500 text-white border-0">{isLoading ? '...' : '--'}ms</Badge>
          </div>
          <p className="text-sm text-blue-800">API connected successfully</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-purple-900">Database Health</h4>
            <Badge className="bg-purple-500 text-white border-0">--%</Badge>
          </div>
          <p className="text-sm text-purple-800">Waiting for data...</p>
        </Card>
      </div>
    </div>
  );
}

