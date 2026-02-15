import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    Users,
    ShieldCheck,
    AlertTriangle,
    FileText,
    Settings,
    LogOut,
    Menu,
    X,
    LayoutDashboard,
    Search,
    Bell,
    BarChart3
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { ThemeToggle } from '../components/ThemeToggle';

const adminNavItems = [
    { name: 'Overview', icon: LayoutDashboard, path: '/admin/dashboard' },
    { name: 'User Management', icon: Users, path: '/admin/users' },
    { name: 'KYC Verification', icon: ShieldCheck, path: '/admin/kyc' },
    { name: 'System Alerts', icon: AlertTriangle, path: '/admin/alerts' },
    { name: 'Audit Logs', icon: FileText, path: '/admin/logs' },
    { name: 'Reports', icon: BarChart3, path: '/admin/reports' },
];

export default function AdminPageContainer({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const handleSearch = (e) => {
        if (e.key === 'Enter' && searchTerm.trim()) {
            // For now, we'll navigate to logs or users based on content
            if (searchTerm.toLowerCase().includes('log')) {
                navigate('/admin/logs');
            } else {
                navigate('/admin/users');
            }
        }
    };

    return (
        <div className="flex h-screen bg-background text-foreground transition-colors duration-300">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 w-64 bg-card border-r border-border z-50 transition-transform duration-300 md:relative md:translate-x-0",
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="h-full flex flex-col p-6">
                    <div className="flex items-center gap-3 mb-10 px-2">
                        <div className="w-10 h-10 rounded-xl bg-destructive flex items-center justify-center shadow-lg shadow-destructive/20">
                            <ShieldCheck className="text-destructive-foreground h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight">Admin Portal</h2>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">NeoVault Operations</p>
                        </div>
                    </div>

                    <nav className="flex-1 space-y-1">
                        {adminNavItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                                    location.pathname === item.path
                                        ? "bg-destructive/10 text-destructive"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <item.icon className={cn(
                                    "h-5 w-5 transition-transform group-hover:scale-110",
                                    location.pathname === item.path ? "text-destructive" : "text-muted-foreground"
                                )} />
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    <div className="pt-6 border-t border-border mt-6">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all group"
                        >
                            <LogOut className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-16 flex items-center justify-between px-8 bg-card/80 backdrop-blur-xl border-b border-border sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <button
                            className="md:hidden p-2 hover:bg-muted rounded-lg"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                        <div className="hidden md:flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <span>Admin</span>
                            <span className="text-border">/</span>
                            <span className="text-foreground capitalize">{location.pathname.split('/').pop()}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center bg-muted/50 rounded-lg px-3 py-1.5 border border-border/50 transition-all focus-within:ring-1 focus-within:ring-destructive/50">
                            <Search className="h-4 w-4 text-muted-foreground mr-2" />
                            <input
                                type="text"
                                placeholder="Search logs, users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={handleSearch}
                                className="bg-transparent border-none text-xs focus:ring-0 outline-none w-40"
                            />
                        </div>

                        <button
                            onClick={() => navigate('/admin/alerts')}
                            className="p-2 text-muted-foreground hover:bg-muted rounded-full relative group"
                        >
                            <Bell className="h-5 w-5 group-hover:scale-110 transition-transform" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-card animate-pulse"></span>
                        </button>

                        <ThemeToggle />

                        <div className="h-8 w-px bg-border mx-2" />

                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <div className="text-sm font-bold">{user?.name || 'Administrator'}</div>
                                <div className="text-[10px] text-destructive uppercase font-bold tracking-widest leading-none">Super Admin</div>
                            </div>
                            <div className="w-9 h-9 rounded-xl bg-destructive text-destructive-foreground flex items-center justify-center font-bold shadow-lg shadow-destructive/20 transition-transform hover:scale-105">
                                {user?.name?.[0] || 'A'}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8 bg-background/50">
                    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
