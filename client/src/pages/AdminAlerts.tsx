import { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import {
  Search,
  Filter,
  Download,
  AlertCircle,
  DollarSign,
  FileText,
  TrendingUp
} from 'lucide-react';
import { alertsApi, exportCsv } from '../api/adminApi';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { toast } from 'sonner';

interface Alert {
  id: number;
  user_id: number | null;
  user_name: string;
  type: 'low_balance' | 'bill_due' | 'budget_exceeded';
  message: string;
  severity: 'low' | 'medium' | 'high';
  status: 'read' | 'unread';
  timestamp: string;
}

export function AdminAlerts() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [typeCounts, setTypeCounts] = useState({
    low_balance: 0,
    bill_due: 0,
    budget_exceeded: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadAlerts();
  }, [typeFilter, severityFilter]);

  const loadAlerts = async () => {
    setIsLoading(true);
    const response = await alertsApi.getAlerts(
      typeFilter !== 'all' ? typeFilter : undefined,
      severityFilter !== 'all' ? severityFilter : undefined
    );

    if (response.data) {
      // Transform API data
      const transformedAlerts: Alert[] = response.data.alerts.map(alert => ({
        id: alert.id,
        user_id: alert.user_id,
        user_name: alert.user_name,
        type: alert.type as 'low_balance' | 'bill_due' | 'budget_exceeded',
        message: alert.message,
        severity: alert.severity as 'low' | 'medium' | 'high',
        status: alert.status as 'read' | 'unread',
        timestamp: alert.timestamp || new Date().toISOString()
      }));

      setAlerts(transformedAlerts);
      setTypeCounts(response.data.type_counts);
      setTotal(response.data.total);
    } else {
      // API unavailable
      toast.error('Failed to load alerts', { description: 'Please check your connection and try again' });
    }
    setIsLoading(false);
  };

  const handleMarkAsRead = async (alertId: number) => {
    const response = await alertsApi.markAsRead(alertId);
    if (response.data) {
      toast.success('Alert marked as read');
      loadAlerts();
    } else {
      toast.error('Failed to update alert', { description: response.error });
    }
  };

  const typeIcons = {
    low_balance: DollarSign,
    bill_due: FileText,
    budget_exceeded: TrendingUp
  };

  const typeColors = {
    low_balance: 'bg-red-100 text-red-700 border-red-200',
    bill_due: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    budget_exceeded: 'bg-blue-100 text-blue-700 border-blue-200'
  };

  const severityColors = {
    low: 'bg-info/20 text-info-foreground border-info/30',
    medium: 'bg-warning/20 text-warning-foreground border-warning/30',
    high: 'bg-destructive/20 text-destructive-foreground border-destructive/30'
  };

  const statusColors = {
    read: 'bg-gray-100 text-gray-700 border-0',
    unread: 'bg-blue-100 text-blue-700 border-0'
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = searchQuery === '' ||
      alert.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleExport = async () => {
    toast.loading('Exporting alerts data...');
    const success = await exportCsv('/admin/alerts/export/csv', 'alerts_export.csv');
    toast.dismiss();
    if (success) {
      toast.success('Export successful');
    } else {
      toast.error('Export failed');
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-orange-600">
            System Alerts
          </h1>
          <p className="text-gray-500 text-sm mt-1">Monitor and manage platform alerts and notifications</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-4 border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Alerts</p>
              <p className="text-2xl font-semibold">{isLoading ? '...' : total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Low Balance</p>
              <p className="text-2xl font-semibold text-red-600">{isLoading ? '...' : typeCounts.low_balance}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bills Due</p>
              <p className="text-2xl font-semibold text-yellow-600">{isLoading ? '...' : typeCounts.bill_due}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Budget Alerts</p>
              <p className="text-2xl font-semibold text-blue-600">{isLoading ? '...' : typeCounts.budget_exceeded}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6 border-border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search alerts by user or message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-input-background"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-[200px] bg-input-background">
              <SelectValue placeholder="Alert Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="low_balance">Low Balance</SelectItem>
              <SelectItem value="bill_due">Bill Due</SelectItem>
              <SelectItem value="budget_exceeded">Budget Exceeded</SelectItem>
            </SelectContent>
          </Select>
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-full md:w-[200px] bg-input-background">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            More
          </Button>
        </div>
      </Card>

      {/* Alerts Table */}
      <Card className="p-6 shadow-md border-border">
        <h3 className="text-lg font-semibold mb-6">All System Alerts</h3>
        {isLoading ? (
          <div className="py-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredAlerts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Alert ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Message</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Severity</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filteredAlerts.map((alert) => {
                  const Icon = typeIcons[alert.type];

                  return (
                    <tr
                      key={alert.id}
                      className="border-b border-border hover:bg-accent/30 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <span className="font-mono text-sm text-muted-foreground">#{alert.id.toString().padStart(4, '0')}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-medium text-primary">
                              {alert.user_name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-sm">{alert.user_name}</div>
                            {alert.user_id && (
                              <div className="text-xs text-muted-foreground">ID: {alert.user_id}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={`${typeColors[alert.type]} border flex items-center gap-1 w-fit`}>
                          <Icon className="w-3 h-3" />
                          <span className="text-xs">
                            {alert.type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                          </span>
                        </Badge>
                      </td>
                      <td className="py-4 px-4 max-w-xs">
                        <p className="text-sm truncate">{alert.message}</p>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={`${severityColors[alert.severity] || 'bg-gray-100 text-gray-700 border-gray-200'} border text-xs`}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Badge
                          className={statusColors[alert.status]}
                          onClick={() => alert.status === 'unread' && handleMarkAsRead(alert.id)}
                          style={{ cursor: alert.status === 'unread' ? 'pointer' : 'default' }}
                        >
                          {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-sm text-muted-foreground">
                        <div>{new Date(alert.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}</div>
                        <div className="text-xs">{new Date(alert.timestamp).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            {searchQuery || typeFilter !== 'all' || severityFilter !== 'all'
              ? 'No alerts match your search criteria'
              : 'No alerts in the system'}
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
          <div className="text-sm text-muted-foreground">
            Showing {filteredAlerts.length} of {total} alerts
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm">1</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

