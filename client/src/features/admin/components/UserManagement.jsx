import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import api from '../../../api/axios';
import { formatDate } from '../../../lib/utils';
import { Search, UserX, Eye, UserCheck, Loader2 } from 'lucide-react';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await api.get('/analytics/admin/users');
            setUsers(res.data);
        } catch (error) {
            console.error("Failed to fetch admin users", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateKyc = async (userId, newStatus) => {
        try {
            await api.patch(`/analytics/admin/users/${userId}/kyc?status=${newStatus}`);
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, kyc_status: newStatus } : u));
        } catch (error) {
            console.error("Failed to update KYC status", error);
            alert("Error updating KYC status. Check console for details.");
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || user.kyc_status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getKycBadge = (status) => {
        switch (status) {
            case 'verified':
                return <Badge className="bg-success text-success-foreground border-none">Verified</Badge>;
            case 'unverified':
                return <Badge className="bg-warning text-warning-foreground border-none">Unverified</Badge>;
            case 'rejected':
                return <Badge className="bg-destructive text-white border-none">Rejected</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-1">User Management</h1>
                <p className="text-muted-foreground">Manage and monitor NeoVault user accounts</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold tracking-tight">{users.length}</div>
                    </CardContent>
                </Card>

                <Card className="border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Verified Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold tracking-tight text-success">
                            {users.filter(u => u.kyc_status === 'verified').length}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pending KYC</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold tracking-tight text-warning">
                            {users.filter(u => u.kyc_status === 'unverified').length}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Rejected</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold tracking-tight text-destructive">
                            {users.filter(u => u.kyc_status === 'rejected').length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="border-border/50">
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-48">
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="verified">Verified</SelectItem>
                                <SelectItem value="unverified">Unverified</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Users Table */}
            <Card className="border-border/50 shadow-xl overflow-hidden">
                <CardHeader className="bg-muted/30">
                    <CardTitle className="text-lg">All Registered Users ({filteredUsers.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/10">
                            <TableRow>
                                <TableHead>User ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>KYC Status</TableHead>
                                <TableHead>Member Since</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center">
                                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Syncing with directory...
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredUsers.map((user) => (
                                <TableRow key={user.id} className="hover:bg-muted/20">
                                    <TableCell className="font-mono text-xs">{user.id}</TableCell>
                                    <TableCell className="font-bold">{user.name}</TableCell>
                                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                                    <TableCell>{getKycBadge(user.kyc_status)}</TableCell>
                                    <TableCell className="text-muted-foreground text-sm">{formatDate(user.created_at)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {user.kyc_status === 'unverified' && (
                                                <>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 text-success hover:bg-success/10 border-success/20"
                                                        onClick={() => handleUpdateKyc(user.id, 'verified')}
                                                    >
                                                        <UserCheck className="h-3.5 w-3.5 mr-1.5" />
                                                        Verify
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 text-destructive hover:bg-destructive/10 border-destructive/20"
                                                        onClick={() => handleUpdateKyc(user.id, 'rejected')}
                                                    >
                                                        <UserX className="h-3.5 w-3.5 mr-1.5" />
                                                        Reject
                                                    </Button>
                                                </>
                                            )}
                                            <Button variant="ghost" size="sm" className="h-8 group">
                                                <Eye className="h-3.5 w-3.5 mr-1.5 group-hover:text-primary transition-colors" />
                                                View
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {!loading && filteredUsers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                        No users found matching your criteria
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
