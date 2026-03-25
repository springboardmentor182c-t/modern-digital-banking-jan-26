
import { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import {
  Search,
  Filter,
  Download,
  FileText,
  Clock
} from 'lucide-react';
import { logsApi, exportCsv } from '../api/adminApi';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { toast } from 'sonner';

interface Log {
  id: number;
  admin_id: string | null;
  admin_name: string | null;
  action: string;
  target_type: string | null;
  target_id: number | null;
  target_name: string | null;
  details: string | null;
  timestamp: string | null;
}

export function AdminLogs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [logs, setLogs] = useState<Log[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    week: 0,
    month: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadLogs();
    loadStats();
  }, [actionFilter]);

  const loadLogs = async () => {
    setIsLoading(true);
    const response = await logsApi.getLogs(actionFilter !== 'all' ? actionFilter : undefined);

    if (response.data) {
      const transformedLogs: Log[] = response.data.logs.map(log => ({
        id: log.id,
        admin_id: log.admin_id,
        admin_name: log.admin_name || 'System',
        action: log.action,
        target_type: log.target_type,
        target_id: log.target_id,
        target_name: log.target_name,
        details: log.details,
        timestamp: log.timestamp
      }));

      setLogs(transformedLogs);
      setTotal(response.data.total);
    } else {
      // API unavailable
      toast.error('Failed to load logs', { description: 'Please check your connection and try again' });
    }
    setIsLoading(false);
  };

  const loadStats = async () => {
    const response = await logsApi.getLogStats();
    if (response.data) {
      setStats({
        total: response.data.total,
        today: response.data.today,
        week: response.data.this_week,
        month: response.data.this_month
      });
    } else {
      // API unavailable — keep defaults
      toast.error('Failed to load log stats');
    }
  };

  const actionColors: Record<string, string> = {
    'User Suspended': 'bg-red-100 text-red-700 border-0',
    'User Activated': 'bg-green-100 text-green-700 border-0',
    'Alert Dismissed': 'bg-yellow-100 text-yellow-700 border-0',
    'System Settings Updated': 'bg-blue-100 text-blue-700 border-0',
    'Report Generated': 'bg-purple-100 text-purple-700 border-0'
  };

  const targetTypeColors: Record<string, string> = {
    'User': 'bg-primary/10 text-primary border-primary/20',
    'Alert': 'bg-warning/10 text-warning-foreground border-warning/20',
    'Settings': 'bg-secondary/10 text-secondary-foreground border-secondary/20',
    'Report': 'bg-info/10 text-info-foreground border-info/20'
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchQuery === '' ||
      (log.admin_name && log.admin_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.target_name && log.target_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const handleExport = async () => {
    toast.loading('Exporting audit logs...');
    const success = await exportCsv('/admin/logs/export/csv', 'audit_logs.csv');
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
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-700 to-gray-900">
            Audit Logs
          </h1>
          <p className="text-gray-500 text-sm mt-1">System activity and administrator actions trace</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-4 border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Actions</p>
              <p className="text-2xl font-semibold">{isLoading ? '...' : stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Today</p>
              <p className="text-2xl font-semibold text-green-600">{isLoading ? '...' : stats.today}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">This Week</p>
              <p className="text-2xl font-semibold text-blue-600">{isLoading ? '...' : stats.week}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">This Month</p>
              <p className="text-2xl font-semibold text-purple-600">{isLoading ? '...' : stats.month}</p>
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
              placeholder="Search by admin, action, or target..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-input-background"
            />
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-full md:w-[250px] bg-input-background">
              <SelectValue placeholder="Action Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="user">User Actions</SelectItem>
              <SelectItem value="alert">Alert Actions</SelectItem>
              <SelectItem value="settings">Settings Changes</SelectItem>
              <SelectItem value="report">Reports</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Date Range
          </Button>
        </div>
      </Card>

      {/* Logs Table */}
      <Card className="p-6 shadow-md border-border">
        <h3 className="text-lg font-semibold mb-6">Activity Timeline</h3>
        {isLoading ? (
          <div className="py-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Log ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Admin</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Action</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Target Type</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Target</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Details</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-border hover:bg-accent/30 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <span className="font-mono text-sm text-muted-foreground">
                        #{log.id.toString().padStart(5, '0')}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-medium text-primary">
                            {(log.admin_name || 'SY').split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-sm">{log.admin_name || 'System'}</div>
                          {log.admin_id && (
                            <div className="text-xs text-muted-foreground">{log.admin_id}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={actionColors[log.action] || 'bg-gray-100 text-gray-700 border-0'}>
                        {log.action}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      {log.target_type && (
                        <Badge className={`${targetTypeColors[log.target_type]} border`}>
                          {log.target_type}
                        </Badge>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm">
                        <div className="font-medium">{log.target_name || 'N/A'}</div>
                        {log.target_id && (
                          <div className="text-xs text-muted-foreground">ID: {log.target_id}</div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 max-w-xs">
                      <p className="text-sm text-muted-foreground truncate">
                        {log.details || 'No details'}
                      </p>
                    </td>
                    <td className="py-4 px-4 text-sm text-muted-foreground">
                      {log.timestamp ? (
                        <>
                          <div>{new Date(log.timestamp).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}</div>
                          <div className="text-xs">{new Date(log.timestamp).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</div>
                        </>
                      ) : (
                        'N/A'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            {searchQuery || actionFilter !== 'all'
              ? 'No logs match your search criteria'
              : 'No admin actions recorded yet'}
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
          <div className="text-sm text-muted-foreground">
            Showing {filteredLogs.length} of {total} logs
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm">1</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </div>
      </Card>

      {/* Compliance Notice */}
      <Card className="p-6 bg-info/10 border-info/30">
        <div className="flex gap-3">
          <FileText className="w-5 h-5 text-info-foreground flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-info-foreground mb-2">Audit & Compliance</h4>
            <p className="text-sm text-info-foreground">
              All administrative actions are logged for security and compliance purposes.
              Logs are retained for 7 years and cannot be modified or deleted.
              For detailed audit reports, please contact the compliance team.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

