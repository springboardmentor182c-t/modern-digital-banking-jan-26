import { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { 
  Search, 
  Filter, 
  Eye,
  UserCheck,
  UserX,
  Download,
  MoreHorizontal
} from 'lucide-react';
import { usersApi } from '../api/adminApi';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { toast } from 'sonner';

interface User {
  id: number;
  name: string;
  email: string;
  kyc_status: 'verified' | 'pending' | 'rejected';
  account_count: number;
  joined_date: string;
  status: 'active' | 'suspended' | 'inactive';
  last_active: string;
}

export function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    verified_kyc: 0,
    pending_kyc: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadUsers();
    loadStats();
  }, [statusFilter]);

  const loadUsers = async () => {
    setIsLoading(true);
    const response = await usersApi.getUsers(1, 50, statusFilter !== 'all' ? statusFilter : undefined);
    
    if (response.data) {
      // Transform API data to match frontend expectations
      const transformedUsers: User[] = response.data.users.map(user => ({
        id: user.id,
        name: user.name || 'Unknown',
        email: user.email,
        kyc_status: user.kyc_status as 'verified' | 'pending' | 'rejected',
        account_count: user.account_count,
        joined_date: user.joined_date || new Date().toISOString(),
        status: user.status as 'active' | 'suspended' | 'inactive',
        last_active: user.last_active || new Date().toISOString()
      }));
      
      setUsers(transformedUsers);
      setTotal(response.data.total);
    } else {
      toast.error('Failed to load users', { description: response.error });
    }
    setIsLoading(false);
  };

  const loadStats = async () => {
    const response = await usersApi.getUserStats();
    if (response.data) {
      setStats(response.data);
    }
  };

  const handleViewUser = (userId: number) => {
    toast.info(`Viewing details for user #${userId}`);
  };

  const handleSuspendUser = async (userId: number, userName: string) => {
    const response = await usersApi.updateUserStatus(userId, 'suspended');
    if (response.data) {
      toast.warning(`User ${userName} has been suspended`, {
        description: 'User will be notified via email'
      });
      loadUsers();
    } else {
      toast.error('Failed to suspend user', { description: response.error });
    }
  };

  const handleActivateUser = async (userId: number, userName: string) => {
    const response = await usersApi.updateUserStatus(userId, 'active');
    if (response.data) {
      toast.success(`User ${userName} has been activated`, {
        description: 'User can now access their account'
      });
      loadUsers();
    } else {
      toast.error('Failed to activate user', { description: response.error });
    }
  };

  const kycStatusColors = {
    verified: 'bg-green-100 text-green-700 border-green-200',
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    rejected: 'bg-red-100 text-red-700 border-red-200'
  };

  const statusColors = {
    active: 'bg-green-100 text-green-700 border-0',
    suspended: 'bg-red-100 text-red-700 border-0',
    inactive: 'bg-gray-100 text-gray-700 border-0'
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchQuery === '' || 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">User Management</h2>
          <p className="text-muted-foreground mt-1">Manage registered users and their accounts</p>
        </div>
        <Button variant="outline" className="border-border hover:bg-accent">
          <Download className="w-4 h-4 mr-2" />
          Export Users
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-4 border-border">
          <p className="text-sm text-muted-foreground mb-1">Total Users</p>
          <p className="text-2xl font-semibold">{isLoading ? '...' : stats.total}</p>
        </Card>
        <Card className="p-4 border-border">
          <p className="text-sm text-muted-foreground mb-1">Active Users</p>
          <p className="text-2xl font-semibold text-green-600">{isLoading ? '...' : stats.active}</p>
        </Card>
        <Card className="p-4 border-border">
          <p className="text-sm text-muted-foreground mb-1">KYC Verified</p>
          <p className="text-2xl font-semibold text-blue-600">{isLoading ? '...' : stats.verified_kyc}</p>
        </Card>
        <Card className="p-4 border-border">
          <p className="text-sm text-muted-foreground mb-1">Pending KYC</p>
          <p className="text-2xl font-semibold text-yellow-600">{isLoading ? '...' : stats.pending_kyc}</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6 border-border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-input-background"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[200px] bg-input-background">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </Button>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="p-6 shadow-md border-border">
        <h3 className="text-lg font-semibold mb-6">All Users</h3>
        {isLoading ? (
          <div className="py-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">KYC Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Accounts</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Joined</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Last Active</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr 
                    key={user.id} 
                    className="border-b border-border hover:bg-accent/30 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="font-medium">{user.name}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-muted-foreground">
                      {user.email}
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={`${kycStatusColors[user.kyc_status]} border`}>
                        {user.kyc_status.charAt(0).toUpperCase() + user.kyc_status.slice(1)}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant="secondary">{user.account_count} accounts</Badge>
                    </td>
                    <td className="py-4 px-4 text-sm">
                      {new Date(user.joined_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={statusColors[user.status]}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-sm text-muted-foreground">
                      {user.last_active ? new Date(user.last_active).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      }) : 'N/A'}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="hover:bg-accent">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewUser(user.id)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {user.status === 'active' ? (
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleSuspendUser(user.id, user.name)}
                            >
                              <UserX className="w-4 h-4 mr-2" />
                              Suspend User
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              className="text-green-600"
                              onClick={() => handleActivateUser(user.id, user.name)}
                            >
                              <UserCheck className="w-4 h-4 mr-2" />
                              Activate User
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>View Activity</DropdownMenuItem>
                          <DropdownMenuItem>Send Message</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            {searchQuery || statusFilter !== 'all' 
              ? 'No users match your search criteria' 
              : 'No users registered yet'}
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
          <div className="text-sm text-muted-foreground">
            Showing {filteredUsers.length} of {total} users
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

