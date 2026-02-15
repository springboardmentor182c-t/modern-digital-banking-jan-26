import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    CreditCard,
    ArrowUpRight,
    PieChart,
    Bell,
    FileText,
    Gift,
    BarChart3,
    LogOut,
    Wallet
} from 'lucide-react';
import { cn } from '../lib/utils';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Accounts', href: '/accounts', icon: CreditCard },
    { name: 'Transactions', href: '/transactions', icon: ArrowUpRight },
    { name: 'Budgets', href: '/budgets', icon: PieChart },
    { name: 'Bills', href: '/bills', icon: FileText },
    { name: 'Rewards', href: '/rewards', icon: Gift },
    { name: 'Insights', href: '/insights', icon: BarChart3 },
    { name: 'Alerts', href: '/alerts', icon: Bell },
];

export default function Sidebar() {
    const location = useLocation();
    const { logout } = useAuth();

    return (
        <aside className="hidden md:flex md:flex-shrink-0 border-r border-border bg-card">
            <div className="flex flex-col w-64">
                <div className="flex flex-col h-screen">
                    <div className="flex-1 flex flex-col pt-8 pb-4 overflow-y-auto">
                        <div className="flex items-center gap-3 px-6 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                                <Wallet className="h-6 w-6 text-primary-foreground" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-foreground">NeoVault</span>
                        </div>
                        <nav className="flex-1 px-4 space-y-1">
                            {navigation.map((item) => {
                                const isActive = location.pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        className={cn(
                                            "group flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200",
                                            isActive
                                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground hover:translate-x-1"
                                        )}
                                    >
                                        <item.icon
                                            className={cn(
                                                "mr-3 flex-shrink-0 h-5 w-5 transition-colors",
                                                isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                                            )}
                                        />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                    <div className="flex-shrink-0 p-4 border-t border-border">
                        <button
                            onClick={logout}
                            className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-muted-foreground rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
                        >
                            <LogOut className="mr-3 h-5 w-5" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
}
