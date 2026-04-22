import React, { useState, useRef } from 'react';
import { useTransactions } from '../context/TransactionsContext';
import { useAccounts } from '../../accounts';
import api from '../../../api/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { formatCurrency, formatDate, cn } from '../../../lib/utils';
import { Plus, ArrowUpRight, ArrowDownRight, Filter, Download, Upload, Search, MoreHorizontal, Edit, Trash } from 'lucide-react';
import { useBudgets } from '../../budgets/context/BudgetsContext';

export default function Transactions() {
  const { transactions, refreshTransactions } = useTransactions();
  const { accounts } = useAccounts();
  const { budgets } = useBudgets();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importAccountId, setImportAccountId] = useState('');
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    account_id: '',
    description: '',
    category: '',
    amount: '',
    txn_type: 'debit',
    merchant: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/transactions/${editingId}`, formData);
      } else {
        await api.post('/transactions', formData);
      }
      setShowModal(false);
      setEditingId(null);
      setFormData({ account_id: '', description: '', category: '', amount: '', txn_type: 'debit', merchant: '' });
      refreshTransactions();
    } catch (error) {
      console.error("Failed to save transaction", error);
    }
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!importFile || !importAccountId) return;
    
    setImporting(true);
    const formData = new FormData();
    formData.append('file', importFile);
    formData.append('account_id', importAccountId);
    
    try {
      await api.post('/transactions/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setShowImportModal(false);
      setImportFile(null);
      setImportAccountId('');
      refreshTransactions();
      alert('Transactions imported successfully!');
    } catch (error) {
      console.error("Failed to import transactions", error);
      alert('Failed to import transactions. Please check the CSV format.');
    } finally {
      setImporting(false);
    }
  };

  const handleDelete = async (txnId) => {
    if (window.confirm("Are you sure you want to delete this transaction? This action cannot be undone and will update your account balance.")) {
      try {
        await api.delete(`/transactions/${txnId}`);
        refreshTransactions();
      } catch (error) {
        console.error("Failed to delete transaction", error);
      }
    }
    setDropdownOpen(null);
  };

  const handleEditClick = (txn) => {
    setFormData({
      account_id: txn.account_id,
      description: txn.description,
      category: txn.category || '',
      amount: txn.amount,
      txn_type: txn.txn_type,
      merchant: txn.merchant || ''
    });
    setEditingId(txn.id);
    setShowModal(true);
    setDropdownOpen(null);
  };

  const filteredTransactions = transactions.filter(txn => {
    const matchesFilter = filter === 'all' || txn.txn_type === filter;
    const matchesSearch = txn.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.merchant.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground mt-1">Monitor your spending and income across all accounts</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="hidden sm:flex" onClick={() => setShowImportModal(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" className="hidden sm:flex">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowModal(true)} className="shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      <Card className="border-border/50 shadow-xl overflow-hidden">
        <CardHeader className="border-b border-border/50 bg-muted/20 pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search transactions..."
                className="bg-background border border-input rounded-full pl-10 pr-4 py-2 text-sm w-full focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant={filter === 'all' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter('all')}
                className="rounded-full"
              >
                All
              </Button>
              <Button
                variant={filter === 'credit' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter('credit')}
                className="rounded-full"
              >
                Income
              </Button>
              <Button
                variant={filter === 'debit' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter('debit')}
                className="rounded-full"
              >
                Expenses
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/30 text-muted-foreground text-[10px] uppercase tracking-widest font-bold border-b border-border/50">
                  <th className="px-6 py-4">Transaction Details</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredTransactions.map((txn) => (
                  <tr key={txn.id} className="group hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110",
                          txn.txn_type === 'credit' ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                        )}>
                          {txn.txn_type === 'credit' ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{txn.description}</div>
                          <div className="text-xs text-muted-foreground">{txn.merchant}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="bg-muted/50 rounded-full font-medium border-border/50">
                        {txn.category}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-success" />
                        <span className="text-xs font-medium">Completed</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {formatDate(txn.txn_date)}
                    </td>
                    <td className={cn(
                      "px-6 py-4 text-right font-bold",
                      txn.txn_type === 'credit' ? "text-success" : "text-foreground"
                    )}>
                      {txn.txn_type === 'credit' ? '+' : '-'} {formatCurrency(txn.amount, txn.currency)}
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDropdownOpen(dropdownOpen === txn.id ? null : txn.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>

                      {dropdownOpen === txn.id && (
                        <div className="absolute right-10 top-1/2 -translate-y-1/2 mt-1 w-32 rounded-md shadow-lg bg-background border border-border/50 z-10 flex flex-col py-1">
                          <button
                            onClick={() => handleEditClick(txn)}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-muted/50 flex items-center gap-2"
                          >
                            <Edit className="h-3.5 w-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(txn.id)}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-destructive/10 text-destructive flex items-center gap-2"
                          >
                            <Trash className="h-3.5 w-3.5" /> Delete
                          </button>
                        </div>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredTransactions.length === 0 && (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-muted-foreground/30" />
              </div>
              <h3 className="font-semibold text-lg">No transactions found</h3>
              <p className="text-muted-foreground text-sm max-w-[250px] mx-auto mt-1">Try adjusting your filters or search terms to find what you're looking for.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => { setShowModal(false); setEditingId(null); }} />
          <Card className="w-full max-w-md relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <CardHeader>
              <CardTitle>{editingId ? "Edit Transaction" : "Add Transaction"}</CardTitle>
              <CardDescription>{editingId ? "Modify an existing transaction" : "Record a new manual transaction"}</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Account</label>
                    <select
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                      value={formData.account_id}
                      onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
                    >
                      <option value="">Select Account</option>
                      {accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>{acc.bank_name} - {acc.masked_account}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Type</label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                      value={formData.txn_type}
                      onChange={(e) => setFormData({ ...formData, txn_type: e.target.value })}
                    >
                      <option value="debit">Expense</option>
                      <option value="credit">Income</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Monthly Grocery"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Amount (₹)</label>
                    <input
                      type="number"
                      required
                      placeholder="0.00"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <div className="relative">
                      <input
                        type="text"
                        list="budget-categories"
                        placeholder="e.g. Food"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      />
                      <datalist id="budget-categories">
                        {budgets.map((b) => (
                          <option key={b.id} value={b.category} />
                        ))}
                      </datalist>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Merchant</label>
                  <input
                    type="text"
                    placeholder="e.g. Amazon"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                    value={formData.merchant}
                    onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-3">
                <Button variant="ghost" type="button" onClick={() => { setShowModal(false); setEditingId(null); }}>Cancel</Button>
                <Button type="submit">{editingId ? "Save Changes" : "Add Transaction"}</Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}

      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowImportModal(false)} />
          <Card className="w-full max-w-md relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <CardHeader>
              <CardTitle>Import Transactions</CardTitle>
              <CardDescription>Upload a CSV file to bulk import transactions.</CardDescription>
            </CardHeader>
            <form onSubmit={handleImportSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Account</label>
                  <select
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                    value={importAccountId}
                    onChange={(e) => setImportAccountId(e.target.value)}
                  >
                    <option value="">Select Account</option>
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.bank_name} - {acc.masked_account}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">CSV File</label>
                  <div className="flex items-center gap-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Browse Files
                    </Button>
                    <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                      {importFile ? importFile.name : "No file selected"}
                    </span>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setImportFile(e.target.files[0]);
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Expected columns: Date, Description, Category, Amount, Type, Merchant</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-3">
                <Button variant="ghost" type="button" onClick={() => setShowImportModal(false)} disabled={importing}>Cancel</Button>
                <Button type="submit" disabled={importing}>
                  {importing ? "Importing..." : "Import"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
