import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../features/transactions';
import { useAccounts } from '../features/accounts';
import { Bell, Search, User, ChevronDown, X, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { useNavigate, Link } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';

export default function PageContainer({ children }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { transactions } = useTransactions();
  const { accounts } = useAccounts();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ transactions: [], accounts: [] });
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const filteredTxns = transactions.filter(t =>
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5);

      const filteredAccs = accounts.filter(a =>
        a.bank_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.account_type.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 3);

      setSearchResults({ transactions: filteredTxns, accounts: filteredAccs });
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  }, [searchQuery, transactions, accounts]);

  // Close search results when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchRef]);

  return (
    <div className="flex h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card/80 backdrop-blur-xl border-b border-border h-16 flex items-center shrink-0 sticky top-0 z-20">
          <div className="flex-1 px-8 flex justify-between items-center">
            {/* Mobile Brand */}
            <div className="flex items-center md:hidden gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold">N</span>
              </div>
              <h2 className="text-lg font-bold tracking-tight">NeoVault</h2>
            </div>

            {/* Search Box */}
            <div className="hidden md:flex items-center flex-1 max-w-md relative" ref={searchRef}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search transactions, accounts..."
                className="bg-muted/50 border-none rounded-full pl-10 pr-10 py-2 text-sm w-full focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length > 1 && setShowResults(true)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              {/* Search Results Dropdown */}
              {showResults && (
                <div className="absolute top-full left-0 w-full mt-2 bg-card border border-border rounded-xl shadow-2xl z-30 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="max-h-[400px] overflow-y-auto p-2">
                    {searchResults.accounts.length > 0 && (
                      <div className="mb-4">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-3 mb-2">Accounts</h3>
                        {searchResults.accounts.map(acc => (
                          <div
                            key={acc.id}
                            onClick={() => {
                              navigate('/accounts');
                              setShowResults(false);
                              setSearchQuery('');
                            }}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                <Wallet className="h-4 w-4" />
                              </div>
                              <div>
                                <div className="text-sm font-medium">{acc.bank_name}</div>
                                <div className="text-xs text-muted-foreground">{acc.account_type} • {acc.masked_account}</div>
                              </div>
                            </div>
                            <div className="text-xs font-semibold">{formatCurrency(acc.balance, acc.currency)}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {searchResults.transactions.length > 0 && (
                      <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-3 mb-2">Transactions</h3>
                        {searchResults.transactions.map(txn => (
                          <div
                            key={txn.id}
                            onClick={() => {
                              navigate('/transactions');
                              setShowResults(false);
                              setSearchQuery('');
                            }}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                          >
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                                txn.txn_type === 'credit' ? "bg-success/10 text-success group-hover:bg-success group-hover:text-success-foreground" : "bg-destructive/10 text-destructive group-hover:bg-destructive group-hover:text-destructive-foreground"
                              )}>
                                {txn.txn_type === 'credit' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                              </div>
                              <div className="overflow-hidden">
                                <div className="text-sm font-medium truncate">{txn.description}</div>
                                <div className="text-xs text-muted-foreground">{txn.merchant}</div>
                              </div>
                            </div>
                            <div className="text-xs font-semibold text-right flex-shrink-0">
                              <div className={txn.txn_type === 'credit' ? "text-success" : ""}>
                                {txn.txn_type === 'credit' ? '+' : '-'} {formatCurrency(txn.amount, txn.currency)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {searchResults.accounts.length === 0 && searchResults.transactions.length === 0 && (
                      <div className="p-8 text-center">
                        <Search className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No results found for "{searchQuery}"</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate('/alerts')}
                className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-all relative group"
              >
                <Bell className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-card animate-pulse"></span>
              </button>

              <ThemeToggle />

              <div className="flex items-center gap-4 pl-6 border-l border-border h-8">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-semibold">{user?.name}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                    {user?.kyc_status || 'Verified'}
                  </div>
                </div>
                <div className="relative group/user">
                  <button className="flex items-center gap-2 group">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
                      {user?.name?.[0] || <User className="h-5 w-5" />}
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-y-0.5" />
                  </button>

                  {/* User Dropdown */}
                  <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-2xl z-30 opacity-0 invisible group-hover/user:opacity-100 group-hover/user:visible transition-all duration-200 transform origin-top-right group-hover/user:scale-100 scale-95">
                    <div className="p-2">
                      <button className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-colors">Profile Settings</button>
                      <button className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-colors">Security</button>
                      <div className="h-px bg-border my-1" />
                      <button
                        onClick={logout}
                        className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-8">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
