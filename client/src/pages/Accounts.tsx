import { useState, useEffect } from 'react';
import api from '@/services/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AccountCard } from '@/components/AccountCard';
import { Badge } from '@/components/ui/badge';
import { Plus, Download, ArrowUpRight, ArrowDownRight, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

export function Accounts() {
  const [accounts, setAccounts] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const data = await api.getAccounts();
      const mapped = data.map(acc => {
        let icon = 'wallet';
        let color = 'bg-primary';
        if (acc.account_type === 'Savings') { icon = 'piggy-bank'; color = 'bg-success'; }
        else if (acc.account_type === 'Credit') { icon = 'credit-card'; color = 'bg-destructive'; }
        else if (acc.account_type === 'Investment') { icon = 'trending-up'; color = 'bg-secondary'; }

        return {
          id: acc.id,
          type: acc.account_type,
          accountNumber: acc.account_number,
          balance: acc.balance,
          currency: acc.currency,
          status: acc.status,
          icon,
          color
        };
      });
      setAccounts(mapped);
    } catch (error) {
      toast.error('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [newAccount, setNewAccount] = useState({
    bankName: '',
    accountType: '',
    accountNumber: '',
    currency: 'USD',
    balance: ''
  });

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createAccount({
        bankName: newAccount.bankName,
        accountType: newAccount.accountType,
        accountNumber: newAccount.accountNumber,
        currency: newAccount.currency,
        initialBalance: Number(newAccount.balance)
      });
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
      fetchAccounts();
    } catch (error: any) {
      toast.error('Failed to add account', {
        description: error.message || 'An error occurred'
      });
    }
  };

  const handleExport = (format: string) => {
    toast.success(`Exporting as ${format}`, {
      description: 'Your account data is being prepared for download.'
    });
  };

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
              <DropdownMenuItem onClick={() => handleExport('CSV')}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('PDF')}>
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
                    onChange={(e) => setNewAccount({ ...newAccount, bankName: e.target.value })}
                    required
                    className="bg-input-background border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountType">Account Type</Label>
                  <Select
                    value={newAccount.accountType}
                    onValueChange={(value) => setNewAccount({ ...newAccount, accountType: value })}
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
                  <Label htmlFor="accountNumber">Account Number (Last 4 digits)</Label>
                  <Input
                    id="accountNumber"
                    placeholder="****1234"
                    maxLength={4}
                    value={newAccount.accountNumber}
                    onChange={(e) => setNewAccount({ ...newAccount, accountNumber: e.target.value })}
                    required
                    className="bg-input-background border-border"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={newAccount.currency}
                      onValueChange={(value) => setNewAccount({ ...newAccount, currency: value })}
                    >
                      <SelectTrigger className="bg-input-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD (₹)</SelectItem>
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
                      onChange={(e) => setNewAccount({ ...newAccount, balance: e.target.value })}
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
                  <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90">
                    Add Account
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Account Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {accounts.map((account) => (
          <AccountCard key={account.id} {...account} />
        ))}
      </div>

      {/* Account Details Table */}
      <Card className="p-6 shadow-md">
        <h3 className="text-lg font-semibold mb-6">Account Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Account</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Account Number</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Balance</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.id} className="border-b border-border hover:bg-accent/30 transition-colors">
                  <td className="py-4 px-4">
                    <div className="font-medium">{account.type} Account</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-muted-foreground">{account.accountNumber}</div>
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant="secondary" className="bg-secondary text-secondary-foreground">{account.type}</Badge>
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
                    <Badge className={account.status === 'Active' ? 'bg-success text-success-foreground border-0' : 'bg-muted text-muted-foreground border-0'}>{account.status || 'Active'}</Badge>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="hover:bg-accent">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Transfer Funds</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => api.downloadStatement(account.id, 'csv')}>Download Statement (CSV)</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => api.downloadStatement(account.id, 'pdf')}>Download Statement (PDF)</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={async () => {
                          try {
                            await api.deleteAccount(account.id);
                            toast.success('Account deleted successfully');
                            fetchAccounts();
                          } catch (err) {
                            toast.error('Failed to delete account');
                          }
                        }}>Close Account</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
      </div>
    </div>
  );
}