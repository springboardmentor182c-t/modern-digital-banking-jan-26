import { useState, useEffect } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { AccountCard } from '@/app/components/AccountCard';
import { Badge } from '@/app/components/ui/badge';
import { Plus, Download, ArrowUpRight, ArrowDownRight, MoreHorizontal, Loader2 } from 'lucide-react';
import {
  getAccounts,
  createAccount,
  deleteAccount,
  transferMoney,
  requestPayment,
  downloadStatement,
  Account,
  CreateAccountData,
} from '@/services/api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { toast } from 'sonner';

export function Accounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // Transfer dialog state
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferData, setTransferData] = useState({
    fromAccountId: '',
    toAccountId: '',
    amount: '',
    description: ''
  });
  
  // View Details dialog state
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  
  // Payment request dialog state
  const [isPaymentRequestOpen, setIsPaymentRequestOpen] = useState(false);
  const [isRequestingPayment, setIsRequestingPayment] = useState(false);
  const [paymentRequestData, setPaymentRequestData] = useState({
    fromAccountId: '',
    amount: '',
    description: ''
  });
  
  // Statement download state
  const [isStatementOpen, setIsStatementOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [statementData, setStatementData] = useState({
    accountId: '',
    format: 'csv',
    startDate: '',
    endDate: ''
  });
  
  // Export state
  const [exportAccountId, setExportAccountId] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const [newAccount, setNewAccount] = useState({
    bankName: '',
    accountType: '',
    accountNumber: '',
    currency: 'INR',
    balance: ''
  });

  // Fetch accounts from backend on component mount
  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const data = await getAccounts();
      setAccounts(data);
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
      toast.error('Failed to load accounts. Please make sure you are logged in.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const accountData: CreateAccountData = {
        bankName: newAccount.bankName,
        accountType: newAccount.accountType,
        accountNumber: newAccount.accountNumber,
        currency: newAccount.currency,
        initialBalance: parseFloat(newAccount.balance) || 0,
      };

      const newAcc = await createAccount(accountData);
      setAccounts([...accounts, newAcc]);
      
      toast.success('Account added successfully!', {
        description: `${newAccount.bankName} ${newAccount.accountType} account has been added.`
      });
      
      setIsAddAccountOpen(false);
      setNewAccount({
        bankName: '',
        accountType: '',
        accountNumber: '',
        currency: 'INR',
        balance: ''
      });
    } catch (error: any) {
      console.error('Failed to create account:', error);
      toast.error(error.message || 'Failed to create account. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteAccount = async (accountId: number) => {
    try {
      await deleteAccount(accountId);
      setAccounts(accounts.map(acc => 
        acc.id === accountId ? { ...acc, status: 'Inactive' } : acc
      ));
      toast.success('Account deleted successfully!');
    } catch (error) {
      console.error('Failed to delete account:', error);
      toast.error('Failed to delete account. Please try again.');
    }
  };

  // Handle transfer money
  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTransferring(true);

    try {
      const result = await transferMoney({
        from_account_id: parseInt(transferData.fromAccountId),
        to_account_id: parseInt(transferData.toAccountId),
        amount: parseFloat(transferData.amount),
        description: transferData.description || undefined
      });

      toast.success('Transfer successful!', {
        description: result.message
      });

      // Refresh accounts to show updated balances
      await fetchAccounts();
      
      setIsTransferOpen(false);
      setTransferData({
        fromAccountId: '',
        toAccountId: '',
        amount: '',
        description: ''
      });
    } catch (error: any) {
      console.error('Transfer failed:', error);
      toast.error(error.message || 'Failed to transfer money. Please try again.');
    } finally {
      setIsTransferring(false);
    }
  };

  // Handle payment request
  const handlePaymentRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRequestingPayment(true);

    try {
      const result = await requestPayment({
        from_account_id: parseInt(paymentRequestData.fromAccountId),
        amount: parseFloat(paymentRequestData.amount),
        description: paymentRequestData.description || undefined
      });

      toast.success('Payment request created!', {
        description: result.message
      });

      setIsPaymentRequestOpen(false);
      setPaymentRequestData({
        fromAccountId: '',
        amount: '',
        description: ''
      });
    } catch (error: any) {
      console.error('Payment request failed:', error);
      toast.error(error.message || 'Failed to create payment request. Please try again.');
    } finally {
      setIsRequestingPayment(false);
    }
  };

  // Handle statement download
  const handleStatementDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDownloading(true);

    try {
      const blob = await downloadStatement(
        parseInt(statementData.accountId),
        statementData.format as 'csv' | 'pdf',
        statementData.startDate || undefined,
        statementData.endDate || undefined
      );

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `account_statement_${statementData.accountId}.${statementData.format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Statement downloaded successfully!');
      
      setIsStatementOpen(false);
      setStatementData({
        accountId: '',
        format: 'csv',
        startDate: '',
        endDate: ''
      });
    } catch (error: any) {
      console.error('Download failed:', error);
      toast.error(error.message || 'Failed to download statement. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle export (CSV/PDF from header dropdown)
  const handleExport = async (format: string) => {
    if (!exportAccountId) {
      toast.error('Please select an account to export');
      return;
    }

    setIsExporting(true);
    try {
      const blob = await downloadStatement(
        parseInt(exportAccountId),
        format as 'csv' | 'pdf'
      );

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `account_statement_${exportAccountId}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Exported as ${format.toUpperCase()} successfully!`);
    } catch (error: any) {
      console.error('Export failed:', error);
      toast.error(error.message || `Failed to export as ${format.toUpperCase()}. Please try again.`);
    } finally {
      setIsExporting(false);
    }
  };

  // Helper function to get icon and color based on account type
  const getAccountIconAndColor = (accountType: string): { icon: 'piggy-bank' | 'wallet' | 'credit-card' | 'trending-up'; color: string } => {
    switch (accountType) {
      case 'Savings':
        return { icon: 'piggy-bank', color: 'bg-success' };
      case 'Checking':
        return { icon: 'wallet', color: 'bg-primary' };
      case 'Credit':
        return { icon: 'credit-card', color: 'bg-warning' };
      case 'Investment':
        return { icon: 'trending-up', color: 'bg-secondary' };
      default:
        return { icon: 'wallet', color: 'bg-primary' };
    }
  };

  // Filter active accounts for dropdowns
  const activeAccounts = accounts.filter(acc => acc.status === 'Active');

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">All Accounts</h2>
          <p className="text-muted-foreground mt-1">Manage your accounts and view transactions</p>
        </div>
        <div className="flex gap-3">
          {/* Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-border hover:bg-accent">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="px-2 py-1">
                <Label className="text-xs text-muted-foreground">Select Account</Label>
                <Select 
                  value={exportAccountId} 
                  onValueChange={setExportAccountId}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map(acc => (
                      <SelectItem key={acc.id} value={acc.id.toString()}>
                        {acc.bank_name} - {acc.account_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DropdownMenuItem 
                onClick={() => handleExport('csv')}
                disabled={!exportAccountId || isExporting}
              >
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleExport('pdf')}
                disabled={!exportAccountId || isExporting}
              >
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Add Account Dialog */}
          <Dialog open={isAddAccountOpen} onOpenChange={setIsAddAccountOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Account
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Account</DialogTitle>
                <DialogDescription>
                  Connect a new bank account to your SmartBank dashboard.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddAccount} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    placeholder="e.g., Chase Bank"
                    value={newAccount.bankName}
                    onChange={(e: { target: { value: any; }; }) => setNewAccount({ ...newAccount, bankName: e.target.value })}
                    required
                    className="bg-input-background border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountType">Account Type</Label>
                  <Select
                    value={newAccount.accountType}
                    onValueChange={(value: any) => setNewAccount({ ...newAccount, accountType: value })}
                    required
                  >
                    <SelectTrigger className="bg-input-background border-border">
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Checking">Checking</SelectItem>
                      <SelectItem value="Savings">Savings</SelectItem>
                      <SelectItem value="Credit">Credit Card</SelectItem>
                      <SelectItem value="Investment">Investment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    placeholder="Enter account number"
                    value={newAccount.accountNumber}
                    onChange={(e: { target: { value: any; }; }) => setNewAccount({ ...newAccount, accountNumber: e.target.value })}
                    required
                    className="bg-input-background border-border"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={newAccount.currency}
                      onValueChange={(value: any) => setNewAccount({ ...newAccount, currency: value })}
                    >
                      <SelectTrigger className="bg-input-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="JPY">JPY (¥)</SelectItem>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="balance">Initial Balance</Label>
                    <Input
                      id="balance"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newAccount.balance}
                      onChange={(e: { target: { value: any; }; }) => setNewAccount({ ...newAccount, balance: e.target.value })}
                      required
                      className="bg-input-background border-border"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddAccountOpen(false)}
                    className="flex-1 border-border"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90" disabled={isCreating}>
                    {isCreating ? 'Adding...' : 'Add Account'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Account Cards */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading accounts...</span>
        </div>
      ) : activeAccounts.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Active Accounts</h3>
            <p className="text-muted-foreground mb-4">Add your first account to get started</p>
            <Button onClick={() => setIsAddAccountOpen(true)} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Account
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {activeAccounts.map((account) => {
            const { icon, color } = getAccountIconAndColor(account.account_type);
            return (
              <AccountCard 
                key={account.id} 
                type={account.account_type}
                accountNumber={account.account_number}
                balance={account.balance}
                currency={account.currency}
                icon={icon}
                color={color}
              />
            );
          })}
        </div>
      )}

      {/* Account Details Table */}
      {!isLoading && activeAccounts.length > 0 && (
        <Card className="p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-6">Account Details</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Bank</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Account Number</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Balance</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeAccounts.map((account) => (
                  <tr key={account.id} className="border-b border-border hover:bg-accent/30 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-medium">{account.bank_name}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-muted-foreground">{account.account_number}</div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant="secondary" className="bg-secondary text-secondary-foreground">{account.account_type}</Badge>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className={`font-semibold ${account.balance < 0 ? 'text-destructive' : ''}`}>
                        {account.balance < 0 ? '-' : ''}
                        {account.currency} {Math.abs(account.balance).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Badge className={account.status === 'Active' ? 'bg-success text-success-foreground border-0' : 'bg-muted text-muted-foreground'}>
                        {account.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="hover:bg-accent">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setSelectedAccount(account);
                            setIsViewDetailsOpen(true);
                          }}>View Details</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setTransferData({ ...transferData, fromAccountId: account.id.toString() });
                            setIsTransferOpen(true);
                          }}>Transfer Funds</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setStatementData({ ...statementData, accountId: account.id.toString() });
                            setIsStatementOpen(true);
                          }}>Download Statement</DropdownMenuItem>
                          {account.status === 'Active' && (
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDeleteAccount(account.id)}
                            >
                              Close Account
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* View Details Dialog */}
      <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Account Details</DialogTitle>
            <DialogDescription>
              Detailed information about your account
            </DialogDescription>
          </DialogHeader>
          {selectedAccount && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-sm">Bank Name</Label>
                  <p className="font-medium">{selectedAccount.bank_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm">Account Name</Label>
                  <p className="font-medium">{selectedAccount.account_name}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-sm">Account Number</Label>
                  <p className="font-medium">{selectedAccount.account_number}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm">Account Type</Label>
                  <p className="font-medium">{selectedAccount.account_type}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-sm">Currency</Label>
                  <p className="font-medium">{selectedAccount.currency}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-sm">Status</Label>
                  <Badge className={selectedAccount.status === 'Active' ? 'bg-success text-success-foreground border-0' : 'bg-muted text-muted-foreground'}>
                    {selectedAccount.status}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground text-sm">Current Balance</Label>
                <p className={`text-2xl font-bold ${selectedAccount.balance < 0 ? 'text-destructive' : ''}`}>
                  {selectedAccount.currency} {selectedAccount.balance.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsViewDetailsOpen(false)}
                  className="flex-1 border-border"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Transfer Money */}
        <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
          <DialogTrigger asChild>
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-border">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-success rounded-xl flex items-center justify-center shadow-md">
                  <ArrowUpRight className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold">Transfer Money</h4>
                  <p className="text-sm text-muted-foreground">Send to another account</p>
                </div>
              </div>
            </Card>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Transfer Money</DialogTitle>
              <DialogDescription>
                Transfer funds from one account to another.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleTransfer} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="fromAccount">From Account</Label>
                <Select
                  value={transferData.fromAccountId}
                  onValueChange={(value: any) => setTransferData({ ...transferData, fromAccountId: value, toAccountId: '' })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source account" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeAccounts.map(acc => (
                      <SelectItem key={acc.id} value={acc.id.toString()}>
                        {acc.bank_name} - {acc.account_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="toAccountId">To Account</Label>
                <Select
                  value={transferData.toAccountId}
                  onValueChange={(value: any) => setTransferData({ ...transferData, toAccountId: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination account" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeAccounts.filter(acc => acc.id.toString() !== transferData.fromAccountId).map(acc => (
                      <SelectItem key={acc.id} value={acc.id.toString()}>
                        {acc.bank_name} - {acc.account_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={transferData.amount}
                  onChange={(e: { target: { value: any; }; }) => setTransferData({ ...transferData, amount: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  placeholder="What's this transfer for?"
                  value={transferData.description}
                  onChange={(e: { target: { value: any; }; }) => setTransferData({ ...transferData, description: e.target.value })}
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsTransferOpen(false)}
                  className="flex-1 border-border"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-success hover:bg-success/90" disabled={isTransferring}>
                  {isTransferring ? 'Transferring...' : 'Transfer'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Request Payment */}
        <Dialog open={isPaymentRequestOpen} onOpenChange={setIsPaymentRequestOpen}>
          <DialogTrigger asChild>
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-border">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-md">
                  <ArrowDownRight className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold">Request Payment</h4>
                  <p className="text-sm text-muted-foreground">Request from others</p>
                </div>
              </div>
            </Card>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Request Payment</DialogTitle>
              <DialogDescription>
                Create a payment request to receive funds.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handlePaymentRequest} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="paymentAccount">From Account</Label>
                <Select
                  value={paymentRequestData.fromAccountId}
                  onValueChange={(value: any) => setPaymentRequestData({ ...paymentRequestData, fromAccountId: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeAccounts.map(acc => (
                      <SelectItem key={acc.id} value={acc.id.toString()}>
                        {acc.bank_name} - {acc.account_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="paymentAmount">Amount</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={paymentRequestData.amount}
                  onChange={(e: { target: { value: any; }; }) => setPaymentRequestData({ ...paymentRequestData, amount: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="paymentDescription">Description (Optional)</Label>
                <Input
                  id="paymentDescription"
                  placeholder="What's this payment for?"
                  value={paymentRequestData.description}
                  onChange={(e: { target: { value: any; }; }) => setPaymentRequestData({ ...paymentRequestData, description: e.target.value })}
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsPaymentRequestOpen(false)}
                  className="flex-1 border-border"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90" disabled={isRequestingPayment}>
                  {isRequestingPayment ? 'Creating...' : 'Request Payment'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Download Statement */}
        <Dialog open={isStatementOpen} onOpenChange={setIsStatementOpen}>
          <DialogTrigger asChild>
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-border">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center shadow-md">
                  <Download className="w-6 h-6 text-secondary-foreground" />
                </div>
                <div>
                  <h4 className="font-semibold">Download Statement</h4>
                  <p className="text-sm text-muted-foreground">Get account statement</p>
                </div>
              </div>
            </Card>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Download Statement</DialogTitle>
              <DialogDescription>
                Download your account statement in CSV or PDF format.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleStatementDownload} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="statementAccount">Account</Label>
                <Select
                  value={statementData.accountId}
                  onValueChange={(value: any) => setStatementData({ ...statementData, accountId: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map(acc => (
                      <SelectItem key={acc.id} value={acc.id.toString()}>
                        {acc.bank_name} - {acc.account_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="statementFormat">Format</Label>
                <Select
                  value={statementData.format}
                  onValueChange={(value: any) => setStatementData({ ...statementData, format: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date (Optional)</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={statementData.startDate}
                    onChange={(e: { target: { value: any; }; }) => setStatementData({ ...statementData, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date (Optional)</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={statementData.endDate}
                    onChange={(e: { target: { value: any; }; }) => setStatementData({ ...statementData, endDate: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsStatementOpen(false)}
                  className="flex-1 border-border"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-secondary hover:bg-secondary/90" disabled={isDownloading}>
                  {isDownloading ? 'Downloading...' : 'Download'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
