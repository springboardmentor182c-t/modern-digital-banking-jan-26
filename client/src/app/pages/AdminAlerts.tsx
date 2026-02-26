import { useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { 
  Search, 
  Filter, 
  Download,
  AlertCircle,
  DollarSign,
  FileText,
  TrendingUp
} from 'lucide-react';
import { systemAlerts } from '@/app/data/adminMockData';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';

export function AdminAlerts() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');

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

  const alertTypeCounts = {
    low_balance: systemAlerts.filter(a => a.type === 'low_balance').length,
    bill_due: systemAlerts.filter(a => a.type === 'bill_due').length,
    budget_exceeded: systemAlerts.filter(a => a.type === 'budget_exceeded').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Alerts Management</h2>
          <p className="text-muted-foreground mt-1">Monitor and manage system-wide alerts</p>
        </div>
        <Button variant="outline" className="border-border hover:bg-accent">
          <Download className="w-4 h-4 mr-2" />
          Export Alerts
        </Button>
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
              <p className="text-2xl font-semibold">{systemAlerts.length}</p>
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
              <p className="text-2xl font-semibold text-red-600">{alertTypeCounts.low_balance}</p>
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
              <p className="text-2xl font-semibold text-yellow-600">{alertTypeCounts.bill_due}</p>
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
              <p className="text-2xl font-semibold text-blue-600">{alertTypeCounts.budget_exceeded}</p>
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
              {systemAlerts.map((alert) => {
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
                            {alert.userName.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-sm">{alert.userName}</div>
                          <div className="text-xs text-muted-foreground">ID: {alert.userId}</div>
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
                      <Badge className={`${severityColors[alert.severity]} border text-xs`}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={statusColors[alert.status]}>
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

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
          <div className="text-sm text-muted-foreground">
            Showing 1 to {systemAlerts.length} of {systemAlerts.length} alerts
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
