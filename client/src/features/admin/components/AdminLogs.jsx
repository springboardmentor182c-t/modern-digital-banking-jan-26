import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import api from '../../../api/axios';
import { Terminal, Loader2 } from 'lucide-react';
import { formatDateTime } from '../../../lib/utils';

export default function AdminLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                setLoading(true);
                const res = await api.get('/analytics/admin/logs');
                setLogs(res.data);
            } catch (error) {
                console.error("Failed to fetch admin logs", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight mb-1 text-destructive">System Audit Logs</h1>
                <p className="text-muted-foreground">Real-time trail of all administrative actions and security events</p>
            </div>

            <Card className="border-border/50 shadow-xl overflow-hidden bg-black/5">
                <CardHeader className="bg-destructive/10 border-b border-destructive/20 flex flex-row items-center gap-2">
                    <Terminal className="h-5 w-5 text-destructive" />
                    <CardTitle className="text-lg">Audit Trail</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="w-[100px]">Log ID</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Admin User</TableHead>
                                <TableHead>Details</TableHead>
                                <TableHead>Timestamp</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                                            <Loader2 className="h-8 w-8 animate-spin text-destructive" />
                                            <span className="font-mono text-xs uppercase tracking-widest">Decrypting logs...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : logs.length > 0 ? (
                                logs.map((log) => (
                                    <TableRow key={log.id} className="hover:bg-destructive/5 font-mono text-[13px]">
                                        <TableCell className="text-muted-foreground">#{log.id}</TableCell>
                                        <TableCell>
                                            <span className="font-bold text-destructive">{log.action || 'AUTH_EVENT'}</span>
                                        </TableCell>
                                        <TableCell>admin@neovault.com</TableCell>
                                        <TableCell className="max-w-[300px] truncate opacity-70">
                                            {log.details || 'System event recorded'}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {formatDateTime(log.timestamp)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                        No logs currently recorded in the active session.
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
