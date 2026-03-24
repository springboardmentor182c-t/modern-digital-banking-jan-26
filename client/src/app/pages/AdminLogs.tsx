import { useState, useEffect } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { 
  Search, 
  Filter, 
  Download,
  FileText,
  Clock
} from 'lucide-react';
import { logsApi } from '@/api/adminApi';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { toast } from 'sonner';

// Types matching the API response
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

interface LogStats {
  total: number;
  today: number;
  this_week: number;
  this_month: number;
}

export function AdminLogs() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<Log[]>([]);
  const [stats, setStats] = useState<LogStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  useEffect(() => {
    loadLogs();
    loadLogStats();
  }, [actionFilter]);

  useEffect(() => {
    // Filter logs based on search query
    if (logs.length > 0 && searchQuery) {
      const filtered = logs.filter(
        l => (l.admin_name && l.admin_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
             (l.action && l.action.toLowerCase().includes(searchQuery.toLowerCase())) ||
             (l.target_name && l.target_name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setLogs(filtered);
    } else if (!searchQuery) {
      loadLogs();
    }
  }, [searchQuery]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const result = await logsApi.getLogs(actionFilter !== 'all' ? actionFilter : undefined);
      if (result.error) {
        toast.error('Failed to load logs');
      } else if (result.data) {
        setLogs(result.data.logs || []);
      }
    } catch (error) {
      console.error('Error loading logs:', error);
      toast.error('Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  const loadLogStats = async () => {
    try {
      const result = await logsApi.getLogStats();
      if (result.data) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error loading log stats:', error);
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

  // Default stats for loading state
  const defaultStats = {
    total: 0,
    today: 0,
    this_week: 0,
    this_month: 0
  };

  const currentStats = stats || defaultStats;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Admin Activity Logs</h2>
          <p className="text-muted-foreground mt-1">Comprehensive audit trail of all admin actions</p>
        </div>
        <Button variant="outline" className="border-border hover:bg-accent">
          <Download className="w-4 h-4 mr-2" />
          Export Logs
        </Button>
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
              <p className="text-2xl font-semibold">{currentStats.total}</p>
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
              <p className="text-2xl font-semibold text-green-600">{currentStats.today}</p>
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
              <p className="text-2xl font-semibold text-blue-600">{currentStats.this_week}</p>
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
              <p className="text-2xl font-semibold text-purple-600">{currentStats.this_month}</p>
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
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading logs...</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No logs found</div>
        ) : (
          <>
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
                  {logs.map((log) => (
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
                              {log.admin_name ? log.admin_name.split(' ').map(n => n[0]).join('').toUpperCase() : 'AD'}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-sm">{log.admin_name || 'System'}</div>
                            <div className="text-xs text-muted-foreground">{log.admin_id || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={actionColors[log.action] || ''}>
                          {log.action}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={`${targetTypeColors[log.target_type || '']} border`}>
                          {log.target_type || 'N/A'}
                        </Badge>
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
                        <p className="text-sm text-muted-foreground truncate">{log.details || 'N/A'}</p>
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

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
              <div className="text-sm text-muted-foreground">
                Showing 1 to {logs.length} of {currentStats.total} logs
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>Previous</Button>
                <Button variant="outline" size="sm">1</Button>
                <Button variant="outline" size="sm">Next</Button>
              </div>
            </div>
          </>
        )}
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
