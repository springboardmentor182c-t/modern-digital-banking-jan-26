import React, { useState } from 'react';
import { useAccounts } from '../context/AccountsContext';
import api from '../../../api/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { formatCurrency, cn } from '../../../lib/utils';
import { Plus, Wallet, CreditCard, Landmark, Banknote, MoreVertical, ExternalLink } from 'lucide-react';

export default function Accounts() {
  const { accounts, refreshAccounts } = useAccounts();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    bank_name: '',
    account_type: 'checking',
    masked_account: '',
    currency: 'INR',
    balance: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/accounts/', formData);
      setShowModal(false);
      setFormData({ bank_name: '', account_type: 'checking', masked_account: '', currency: 'INR', balance: '' });
      refreshData();
    } catch (error) {
      console.error("Failed to create account", error);
    }
  };

  const getAccountIcon = (type) => {
    switch (type) {
      case 'savings': return <Landmark className="h-5 w-5 text-primary" />;
      case 'credit_card': return <CreditCard className="h-5 w-5 text-primary" />;
      case 'checking': return <Wallet className="h-5 w-5 text-primary" />;
      default: return <Banknote className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Accounts</h1>
          <p className="text-muted-foreground mt-1">Manage your verified bank accounts and cards</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4 mr-2" />
          Add Account
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((account) => (
          <Card key={account.id} className="group hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />

            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    {getAccountIcon(account.account_type)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{account.bank_name}</CardTitle>
                    <CardDescription className="capitalize">{account.account_type}</CardDescription>
                  </div>
                </div>
                <button className="text-muted-foreground hover:text-foreground">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-1">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Available Balance</div>
                <div className="text-3xl font-bold tracking-tight">
                  {formatCurrency(account.balance, account.currency)}
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm font-mono text-muted-foreground">
                  {account.masked_account}
                </div>
                <Badge variant="secondary" className="bg-success/10 text-success border-none">
                  Active
                </Badge>
              </div>
            </CardContent>

            <CardFooter className="pt-0">
              <Button variant="ghost" className="w-full justify-between text-muted-foreground hover:text-primary transition-colors group/btn pt-4 border-t border-border/50">
                View Statement
                <ExternalLink className="h-4 w-4 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <Card className="w-full max-w-md relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <CardHeader>
              <CardTitle>Add New Account</CardTitle>
              <CardDescription>Link a new bank account to your NeoVault</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Bank Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HDFC Bank, SBI"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                    value={formData.bank_name}
                    onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Account Type</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                    value={formData.account_type}
                    onChange={(e) => setFormData({ ...formData, account_type: e.target.value })}
                  >
                    <option value="checking">Checking</option>
                    <option value="savings">Savings</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="investment">Investment</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Account Number (Last 4 Digits)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. **** 1234"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                    value={formData.masked_account}
                    onChange={(e) => setFormData({ ...formData, masked_account: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Initial Balance (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="0.00"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                    value={formData.balance}
                    onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-3">
                <Button variant="ghost" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit">Complete Link</Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
