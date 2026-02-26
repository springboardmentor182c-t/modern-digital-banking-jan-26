import { useState, useEffect } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { 
  Search, 
  Filter, 
  Eye,
  UserCheck,
  UserX,
  Download,
  MoreHorizontal
} from 'lucide-react';
import { usersApi } from '@/api/adminApi';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { toast } from 'sonner';

// Types matching the API response
interface User {
  id: number;
  name: string;
  email: string;
  status: string;
  kyc_status: string;
  account_count: number;
  joined_date: string;
  last_active: string;
}

interface UserStats {
  total: number;
  active: number;
  suspended: number;
  inactive: number;
  verified_kyc: number;
  pending_kyc: number;
}

export function AdminUsers() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;

  useEffect(() => {
    loadUsers();
    loadUserStats();
  }, [statusFilter, currentPage]);

  useEffect(() => {
    // Filter users based on search query
    if (users.length > 0 && searchQuery) {
      const filtered = users.filter(
        u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             u.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setUsers(filtered);
    } else if (!searchQuery) {
      loadUsers();
    }
  }, [searchQuery]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const result = await usersApi.getUsers(currentPage, pageSize, statusFilter);
      if (result.error) {
        toast.error('Failed to load users');
      } else if (result.data) {
        setUsers(result.data.users || []);
        setTotalUsers(result.data.total || 0);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      const result = await usersApi.getUserStats();
      if (result.data) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const handleViewUser = (userId: number) => {
    toast.info(`Viewing details for user #${userId}`);
  };

  const handleSuspendUser = async (userId: number, userName: string) => {
    try {
      const result = await usersApi.updateUserStatus(userId, 'suspended');
      if (result.error) {
        toast.error('Failed to suspend user');
      } else {
        toast.warning(`User ${userName} has been suspended`, {
          description: 'User will be notified via email'
        });
        loadUsers();
        loadUserStats();
      }
    } catch (error) {
      console.error('Error suspending user:', error);
      toast.error('Failed to suspend user');
    }
  };

  const handleActivateUser = async (userId: number, userName: string) => {
    try {
      const result = await usersApi.updateUserStatus(userId, 'active');
      if (result.error) {
        toast.error('Failed to activate user');
      } else {
        toast.success(`User ${userName} has been activated`, {
          description: 'User can now access their account'
        });
        loadUsers();
        loadUserStats();
      }
    } catch (error) {
      console.error('Error activating user:', error);
      toast.error('Failed to activate user');
    }
  };

  const kycStatusColors = {
    verified: 'bg-green-100 text-green-700 border-green-200',
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    rejected: 'bg-red-100 text-red-700 border-red-200',
    unverified: 'bg-gray-100 text-gray-700 border-gray-200'
  };

  const statusColors = {
    active: 'bg-green-100 text-green-700 border-0',
    suspended: 'bg-red-100 text-red-700 border-0',
    inactive: 'bg-gray-100 text-gray-700 border-0'
  };

  // Default stats for loading state
  const defaultStats = {
    total: 0,
    active: 0,
    suspended: 0,
    inactive: 0,
    verified_kyc: 0,
    pending_kyc: 0
  };

  const currentStats = stats || defaultStats;

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
          <p className="text-2xl font-semibold">{currentStats.total}</p>
        </Card>
        <Card className="p-4 border-border">
          <p className="text-sm text-muted-foreground mb-1">Active Users</p>
          <p className="text-2xl font-semibold text-green-600">{currentStats.active}</p>
        </Card>
        <Card className="p-4 border-border">
          <p className="text-sm text-muted-foreground mb-1">KYC Verified</p>
          <p className="text-2xl font-semibold text-blue-600">{currentStats.verified_kyc}</p>
        </Card>
        <Card className="p-4 border-border">
          <p className="text-sm text-muted-foreground mb-1">Pending KYC</p>
          <p className="text-2xl font-semibold text-yellow-600">{currentStats.pending_kyc}</p>
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
          <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setCurrentPage(1); }}>
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
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No users found</div>
        ) : (
          <>
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
                  {users.map((user) => (
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
                        <Badge className={`${kycStatusColors[user.kyc_status as keyof typeof kycStatusColors] || kycStatusColors.unverified} border`}>
                          {user.kyc_status.charAt(0).toUpperCase() + user.kyc_status.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="secondary">{user.account_count} accounts</Badge>
                      </td>
                      <td className="py-4 px-4 text-sm">
                        {user.joined_date ? new Date(user.joined_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        }) : 'N/A'}
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={statusColors[user.status as keyof typeof statusColors] || statusColors.inactive}>
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-sm text-muted-foreground">
                        {user.last_active ? new Date(user.last_active).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        }) : 'Never'}
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

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalUsers)} of {totalUsers} users
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  {currentPage}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={currentPage * pageSize >= totalUsers}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
