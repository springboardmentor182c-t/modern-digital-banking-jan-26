import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { mockAlerts } from '../../../lib/mock-admin-data';
import { formatDateTime, cn } from '../../../lib/utils';
import { AlertCircle, CheckCircle, Info, AlertTriangle, Bell, Trash2 } from 'lucide-react';

export default function SystemAlerts() {
    const getAlertIcon = (type) => {
        switch (type) {
            case 'error':
                return <AlertCircle className="h-5 w-5 text-destructive" />;
            case 'warning':
                return <AlertTriangle className="h-5 w-5 text-warning" />;
            case 'success':
                return <CheckCircle className="h-5 w-5 text-success" />;
            case 'info':
                return <Info className="h-5 w-5 text-primary" />;
            default:
                return <Info className="h-5 w-5" />;
        }
    };

    const getAlertBadge = (type) => {
        switch (type) {
            case 'error':
                return <Badge className="bg-destructive text-white border-none text-[10px] font-bold uppercase tracking-widest">Critical</Badge>;
            case 'warning':
                return <Badge className="bg-warning text-warning-foreground border-none text-[10px] font-bold uppercase tracking-widest">Warning</Badge>;
            case 'success':
                return <Badge className="bg-success text-success-foreground border-none text-[10px] font-bold uppercase tracking-widest">Normal</Badge>;
            case 'info':
                return <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest">Notice</Badge>;
            default:
                return <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest">{type}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-1">System Alerts</h1>
                <p className="text-muted-foreground">Monitor system-wide security alerts and notifications</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Active Alerts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <Bell className="h-6 w-6 text-primary" />
                            <div className="text-3xl font-extrabold tracking-tight">{mockAlerts.length}</div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Critical Failures</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold tracking-tight text-destructive">
                            {mockAlerts.filter(a => a.type === 'error').length}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Security Warnings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold tracking-tight text-warning">
                            {mockAlerts.filter(a => a.type === 'warning').length}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Unresolved Issues</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold tracking-tight">
                            {mockAlerts.filter(a => !a.read).length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* System Alerts Table */}
            <Card className="border-border/50 shadow-xl overflow-hidden">
                <CardHeader className="bg-muted/30">
                    <CardTitle className="text-lg">Security Events Log</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/10">
                            <TableRow>
                                <TableHead>Event ID</TableHead>
                                <TableHead>User Context</TableHead>
                                <TableHead>Severity</TableHead>
                                <TableHead>Event Description</TableHead>
                                <TableHead>Timestamp</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockAlerts.map((alert) => (
                                <TableRow key={alert.id} className="hover:bg-muted/20">
                                    <TableCell className="font-mono text-xs">{alert.id}</TableCell>
                                    <TableCell className="font-mono text-xs">{alert.user_id}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {getAlertIcon(alert.type)}
                                            {getAlertBadge(alert.type)}
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-md text-sm font-medium">{alert.message}</TableCell>
                                    <TableCell className="text-xs text-muted-foreground">{formatDateTime(alert.created_at)}</TableCell>
                                    <TableCell>
                                        {alert.read ? (
                                            <Badge variant="outline" className="border-none bg-muted px-2 py-0.5 text-[10px] uppercase font-bold tracking-widest">Resolved</Badge>
                                        ) : (
                                            <Badge className="bg-primary/20 text-primary border-none px-2 py-0.5 text-[10px] uppercase font-bold tracking-widest">Active</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" size="sm" className="h-8">Audit</Button>
                                            {!alert.read ? (
                                                <Button variant="ghost" size="sm" className="h-8 text-primary hover:bg-primary/10">
                                                    Resolve
                                                </Button>
                                            ) : (
                                                <Button variant="ghost" size="sm" className="h-8 text-muted-foreground">
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
