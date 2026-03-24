import { useState, useEffect } from 'react';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { 
  Users, 
  UserCheck, 
  Wallet,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Activity
} from 'lucide-react';
import { dashboardApi } from '@/api/adminApi';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

// Types matching the API response
interface DashboardStats {
  total_users: number;
  active_users: number;
  linked_accounts: number;
  alerts_triggered: number;
  growth_rate: {
    users: number;
    accounts: number;
    alerts: number;
  };
}

interface AlertTrendData {
  month: string;
  low_balance: number;
  bill_due: number;
  budget_exceeded: number;
}

interface UserGrowthData {
  month: string;
  users: number;
}

interface AlertDistribution {
  name: string;
  value: number;
  fill: string;
}

interface TopCategory {
  category: string;
  count: number;
  trend: string;
}

interface RecentAlert {
  id: number;
  user_name: string;
  type: string;
  message: string;
  severity: string;
  status: string;
  timestamp: string;
}

export function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [userGrowthData, setUserGrowthData] = useState<UserGrowthData[]>([]);
  const [alertTrendData, setAlertTrendData] = useState<AlertTrendData[]>([]);
  const [alertTypeDistribution, setAlertTypeDistribution] = useState<AlertDistribution[]>([]);
  const [topAlertCategories, setTopAlertCategories] = useState<TopCategory[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<RecentAlert[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const result = await dashboardApi.getStats();
      if (result.error) {
        toast.error('Failed to load dashboard data');
      } else if (result.data) {
        setStats(result.data.stats);
        setUserGrowthData(result.data.user_growth || []);
        setAlertTrendData(result.data.alert_trends || []);
        setAlertTypeDistribution(result.data.alert_distribution || []);
        setTopAlertCategories(result.data.top_categories || []);
        setRecentAlerts(result.data.recent_alerts || []);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get growth rate display
  const getGrowthText = (value: number) => {
    if (value >= 0) {
      return `+${value}% this month`;
    }
    return `${value}% vs last month`;
  };

  // Default stats for loading state
  const defaultStats = {
    total_users: 0,
    active_users: 0,
    linked_accounts: 0,
    alerts_triggered: 0,
    growth_rate: { users: 0, accounts: 0, alerts: 0 }
  };

  const currentStats = stats || defaultStats;

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
    change: string; 
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
            <p className="text-3xl font-semibold">{value.toLocaleString()}</p>
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
          value={currentStats.total_users}
          change={getGrowthText(currentStats.growth_rate.users)}
          changeType={currentStats.growth_rate.users >= 0 ? 'positive' : 'negative'}
          icon={Users}
          iconColor="bg-primary"
        />
        <StatCard
          title="Active Users"
          value={currentStats.active_users}
          change={currentStats.total_users > 0 ? `${Math.round((currentStats.active_users / currentStats.total_users) * 100)}% active rate` : 'N/A'}
          changeType="positive"
          icon={UserCheck}
          iconColor="bg-success"
        />
        <StatCard
          title="Linked Accounts"
          value={currentStats.linked_accounts}
          change={getGrowthText(currentStats.growth_rate.accounts)}
          changeType={currentStats.growth_rate.accounts >= 0 ? 'positive' : 'negative'}
          icon={Wallet}
          iconColor="bg-secondary"
        />
        <StatCard
          title="Alerts Triggered"
          value={currentStats.alerts_triggered}
          change={getGrowthText(currentStats.growth_rate.alerts)}
          changeType={currentStats.growth_rate.alerts >= 0 ? 'positive' : 'negative'}
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
          </Card>

          {/* Alert Trends Chart */}
          <Card className="p-6 shadow-md border-border">
            <h3 className="text-lg font-semibold mb-6">Alert Trends by Type</h3>
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
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Alert Type Distribution */}
          <Card className="p-6 shadow-md border-border">
            <h3 className="text-lg font-semibold mb-4">Alert Distribution</h3>
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
          </Card>

          {/* Top Alert Categories */}
          <Card className="p-6 shadow-md border-border">
            <h3 className="text-lg font-semibold mb-4">Top Alert Categories</h3>
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
          </Card>
        </div>
      </div>

      {/* Recent Alerts Summary */}
      <Card className="p-6 shadow-md border-border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Recent System Alerts</h3>
          <Badge variant="secondary">{recentAlerts.length} total</Badge>
        </div>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading alerts...</div>
        ) : recentAlerts.length > 0 ? (
          <div className="space-y-3">
            {recentAlerts.map((alert) => {
              const severityColors: Record<string, string> = {
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
                      <Badge className={`text-xs ${severityColors[alert.severity] || ''} border`}>
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
          <div className="text-center py-8 text-muted-foreground">No recent alerts</div>
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
            <Badge className="bg-blue-500 text-white border-0">125ms</Badge>
          </div>
          <p className="text-sm text-blue-800">Average response time</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-purple-900">Database Health</h4>
            <Badge className="bg-purple-500 text-white border-0">99.9%</Badge>
          </div>
          <p className="text-sm text-purple-800">Uptime this month</p>
        </Card>
      </div>
    </div>
  );
}