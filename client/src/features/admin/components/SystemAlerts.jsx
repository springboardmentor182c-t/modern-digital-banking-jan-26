import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { cn } from '../../../lib/utils';
import { AlertCircle, CheckCircle, Info, AlertTriangle, Bell, Wallet } from 'lucide-react';

export default function SystemAlerts() {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/admin/alerts')
            .then(({ data }) => {
                const nextAlerts = Array.isArray(data) ? data : data.alerts ?? [];
                setAlerts(nextAlerts);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching alerts:", err);
                setLoading(false);
            });
    }, []);

    const getAlertIcon = (type) => {
        switch (type) {
            case 'critical':
            case 'error':
                return <AlertCircle className="h-5 w-5 text-destructive" />;
            case 'warning':
            case 'budget_crossing':
                return <AlertTriangle className="h-5 w-5 text-warning" />;
            case 'success':
                return <CheckCircle className="h-5 w-5 text-success" />;
            default:
                return <Info className="h-5 w-5 text-primary" />;
        }
    };

    const getAlertBadge = (type) => {
        switch (type) {
            case 'critical':
                return <Badge className="bg-destructive text-white border-none text-[10px] font-bold uppercase tracking-widest">Critical</Badge>;
            case 'budget_crossing':
                return <Badge className="bg-orange-500 text-white border-none text-[10px] font-bold uppercase tracking-widest">Budget Overlimit</Badge>;
            case 'warning':
                return <Badge className="bg-warning text-warning-foreground border-none text-[10px] font-bold uppercase tracking-widest">Warning</Badge>;
            default:
                return <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest">{type}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-1">System Alerts</h1>
                <p className="text-muted-foreground">Monitor system-wide security alerts and budget crossing notifications</p>
            </div>

            {/* Stats Header */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Active Alerts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <Bell className="h-6 w-6 text-primary" />
                            <div className="text-3xl font-extrabold tracking-tight">{alerts.length}</div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Critical Failures</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold tracking-tight text-destructive">
                            {alerts.filter(a => a.type === 'critical').length}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Budget Crossings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <Wallet className="h-6 w-6 text-orange-500" />
                            <div className="text-3xl font-extrabold tracking-tight text-orange-500">
                                {alerts.filter(a => a.type === 'budget_crossing').length}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold tracking-tight text-success">Active</div>
                    </CardContent>
                </Card>
            </div>

            {/* System Alerts Table */}
            <Card className="border-border/50 shadow-xl overflow-hidden">
                <CardHeader className="bg-muted/30">
                    <CardTitle className="text-lg">Security & Budget Events Log</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-8 text-center">Loading live system alerts...</div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-muted/10">
                                <TableRow>
                                    <TableHead>Severity</TableHead>
                                    <TableHead>Event Description</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {alerts.map((alert, index) => (
                                    <TableRow key={index} className={cn("hover:bg-muted/20", alert.type === 'budget_crossing' && "bg-orange-50/30")}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {getAlertIcon(alert.type)}
                                                {getAlertBadge(alert.type)}
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-md text-sm font-medium">{alert.message}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-primary/10 text-primary border-none uppercase text-[10px]">
                                                {alert.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" className="h-8 text-primary">Resolve</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
