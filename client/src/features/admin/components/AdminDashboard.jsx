import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';
import {
    Users,
    ShieldCheck,
    AlertTriangle,
    TrendingUp,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    Server,
    Database,
    Cpu
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockPerformanceData = [
    { time: '00:00', cpu: 25, memory: 40, latency: 45 },
    { time: '04:00', cpu: 30, memory: 42, latency: 42 },
    { time: '08:00', cpu: 65, memory: 58, latency: 120 },
    { time: '12:00', cpu: 85, memory: 72, latency: 150 },
    { time: '16:00', cpu: 70, memory: 65, latency: 110 },
    { time: '20:00', cpu: 45, memory: 50, latency: 80 },
    { time: '23:59', cpu: 30, memory: 45, latency: 50 },
];

export default function AdminDashboard() {
    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Operations Overview</h1>
                <p className="text-muted-foreground mt-1">Real-time system health and management pulse</p>
            </div>

            {/* High Level Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-border/50 group hover:border-primary/40 transition-all shadow-xl bg-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Active Users</CardTitle>
                        <Users className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold tracking-tighter">1,284</div>
                        <div className="flex items-center gap-1 mt-2 text-success font-bold text-xs">
                            <ArrowUpRight className="h-3 w-3" />
                            <span>+12% vs last week</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/50 group hover:border-warning/40 transition-all shadow-xl bg-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Pending KYC</CardTitle>
                        <ShieldCheck className="h-4 w-4 text-warning" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold tracking-tighter">42</div>
                        <div className="flex items-center gap-1 mt-2 text-warning font-bold text-xs">
                            <Activity className="h-3 w-3" />
                            <span>Newest 5 min ago</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/50 group hover:border-destructive/40 transition-all shadow-xl bg-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">System Alerts</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold tracking-tighter text-destructive">7</div>
                        <div className="flex items-center gap-1 mt-2 text-destructive font-bold text-xs">
                            <AlertTriangle className="h-3 w-3" />
                            <span>3 Critical failures</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/50 group hover:border-primary/40 transition-all shadow-xl bg-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Network Latency</CardTitle>
                        <TrendingUp className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold tracking-tighter">124ms</div>
                        <div className="flex items-center gap-1 mt-2 text-success font-bold text-xs">
                            <ArrowDownRight className="h-3 w-3" />
                            <span>-15ms improvement</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Resource Monitoring */}
                <Card className="border-border/50 shadow-xl overflow-hidden">
                    <CardHeader className="bg-muted/30 border-b border-border/50">
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-primary" />
                            System Performance
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={mockPerformanceData}>
                                    <defs>
                                        <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorLat" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px' }}
                                    />
                                    <Area type="monotone" dataKey="cpu" stroke="#ef4444" fillOpacity={1} fill="url(#colorCpu)" strokeWidth={2} />
                                    <Area type="monotone" dataKey="latency" stroke="#7c3aed" fillOpacity={1} fill="url(#colorLat)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center gap-6 mt-4">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                <div className="w-2 h-2 rounded-full bg-destructive" /> CPU Load (%)
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                <div className="w-2 h-2 rounded-full bg-primary" /> Latency (ms)
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Infrastructure Status */}
                <Card className="border-border/50 shadow-xl overflow-hidden flex flex-col">
                    <CardHeader className="bg-muted/30 border-b border-border/50">
                        <CardTitle>Core Infrastructure</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 flex-1 space-y-6">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <Server className="h-4 w-4 text-success" />
                                    <span className="font-bold">Primary Application Clusters</span>
                                </div>
                                <Badge variant="outline" className="bg-success/10 text-success border-none text-[10px] font-bold">Stable</Badge>
                            </div>
                            <Progress value={92} indicatorClassName="bg-success" className="h-1.5 bg-muted" />
                            <div className="text-[10px] text-muted-foreground flex justify-between uppercase font-bold tracking-widest">
                                <span>92/100 Nodes Healthy</span>
                                <span>Uptime: 99.98%</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <Database className="h-4 w-4 text-warning" />
                                    <span className="font-bold">PostgreSQL Replica Sync</span>
                                </div>
                                <Badge variant="outline" className="bg-warning/10 text-warning border-none text-[10px] font-bold">Latency Warning</Badge>
                            </div>
                            <Progress value={78} indicatorClassName="bg-warning" className="h-1.5 bg-muted" />
                            <div className="text-[10px] text-muted-foreground flex justify-between uppercase font-bold tracking-widest">
                                <span>Sync Delta: 4.2ms</span>
                                <span>Replica Lag: 5s</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <Cpu className="h-4 w-4 text-primary" />
                                    <span className="font-bold">Background Job Workers</span>
                                </div>
                                <Badge variant="outline" className="bg-primary/10 text-primary border-none text-[10px] font-bold">Scaling Required</Badge>
                            </div>
                            <Progress value={88} indicatorClassName="bg-primary" className="h-1.5 bg-muted" />
                            <div className="text-[10px] text-muted-foreground flex justify-between uppercase font-bold tracking-widest">
                                <span>Queue Size: 45.2k</span>
                                <span>Avg Processing: 250ms</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
