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
    Wallet,
    RefreshCw,
    X
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
    { name: 'Currency Converter', href: '/currency-converter', icon: RefreshCw },
    { name: 'Alerts', href: '/alerts', icon: Bell },
];

export default function Sidebar({ isOpen, onClose }) {
    const location = useLocation();
    const { logout } = useAuth();

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden animate-in fade-in"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}
            
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:flex-shrink-0",
                isOpen ? "translate-x-0 shadow-2xl md:shadow-none" : "-translate-x-full"
            )}>
                <div className="flex flex-col h-full w-full">
                    <div className="flex-1 flex flex-col pt-8 pb-4 overflow-y-auto">
                        <div className="flex items-center justify-between px-6 mb-8">
                            <Link to="/dashboard" onClick={onClose} className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer group">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 via-fuchsia-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-primary/40 group-hover:scale-110 transition-transform duration-300">
                                    <Wallet className="h-6 w-6 text-white" />
                                </div>
                                <span className="text-xl font-bold tracking-tight text-foreground">NeoVault</span>
                            </Link>
                            <button
                                onClick={onClose}
                                className="md:hidden p-2 -mr-2 text-muted-foreground hover:bg-muted/50 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                                aria-label="Close Sidebar"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <nav className="flex-1 px-4 space-y-1">
                            {navigation.map((item) => {
                                const isActive = location.pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        onClick={onClose}
                                        className={cn(
                                            "group flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-300",
                                            isActive
                                                ? "bg-gradient-to-r from-primary to-purple-500 text-white shadow-lg shadow-primary/30 scale-[1.03]"
                                                : "text-muted-foreground hover:bg-muted/80 hover:text-foreground hover:translate-x-1"
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
                            onClick={() => {
                                onClose?.();
                                logout();
                            }}
                            className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-muted-foreground rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
                        >
                            <LogOut className="mr-3 h-5 w-5" />
                            Logout
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
