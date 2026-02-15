import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { FileText, Download, Calendar } from 'lucide-react';
import { formatDate, cn } from '../../../lib/utils';

export default function Reports() {
    const mockReports = [
        { id: 'REP-001', name: 'Monthly Financial Audit', type: 'System', date: '2024-05-01', status: 'Generated' },
        { id: 'REP-002', name: 'User Growth Analytics', type: 'Growth', date: '2024-05-15', status: 'Generating' },
        { id: 'REP-003', name: 'KYC Verification Throughput', type: 'Compliance', date: '2024-05-20', status: 'Generated' },
        { id: 'REP-004', name: 'Security Breach Intelligence', type: 'Security', date: '2024-05-21', status: 'Scheduled' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-1">Intelligence & Reports</h1>
                    <p className="text-muted-foreground">Deep data insights and system-wide generated audits</p>
                </div>
                <Button className="font-bold shadow-lg shadow-primary/20">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule New Report
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-border/50">
                    <CardHeader className="pb-3 flex flex-row items-center justify-between">
                        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Storage Used</CardTitle>
                        <FileText className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold tracking-tight">4.2 TB</div>
                        <p className="text-[10px] text-muted-foreground mt-1 font-bold uppercase tracking-widest">85% of assigned quota</p>
                    </CardContent>
                </Card>

                <Card className="border-border/50">
                    <CardHeader className="pb-3 flex flex-row items-center justify-between">
                        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Reports Ready</CardTitle>
                        <Download className="h-4 w-4 text-success" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold tracking-tight">12</div>
                        <p className="text-[10px] text-muted-foreground mt-1 font-bold uppercase tracking-widest">Available for offline download</p>
                    </CardContent>
                </Card>

                <Card className="border-border/50">
                    <CardHeader className="pb-3 flex flex-row items-center justify-between">
                        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Avg Resolution</CardTitle>
                        <div className="h-4 w-4 rounded-full border-2 border-warning" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold tracking-tight">18.5m</div>
                        <p className="text-[10px] text-muted-foreground mt-1 font-bold uppercase tracking-widest">Time to resolve critical bugs</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-border/50 shadow-xl overflow-hidden">
                <CardHeader className="bg-muted/30">
                    <CardTitle className="text-lg">Recent Reports</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/10">
                            <TableRow>
                                <TableHead>Report ID</TableHead>
                                <TableHead>Report Title</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Generated Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockReports.map((report) => (
                                <TableRow key={report.id} className="hover:bg-muted/20">
                                    <TableCell className="font-mono text-xs">{report.id}</TableCell>
                                    <TableCell className="font-bold">{report.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="border-border/50">{report.type}</Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">{formatDate(report.date)}</TableCell>
                                    <TableCell>
                                        <Badge className={cn(
                                            "border-none text-[10px] font-bold uppercase tracking-widest",
                                            report.status === 'Generated' ? "bg-success/20 text-success" :
                                                report.status === 'Generating' ? "bg-warning/20 text-warning" : "bg-muted text-muted-foreground"
                                        )}>
                                            {report.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" disabled={report.status !== 'Generated'}>
                                            <Download className="h-4 w-4" />
                                        </Button>
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
