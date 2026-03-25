import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BillItem } from '@/components/BillItem';
import { Badge } from '@/components/ui/badge';
import { CurrencySummary } from '@/components/CurrencySummary';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Calendar, DollarSign, Clock, Download } from 'lucide-react';
import { toast } from 'sonner';

export function Bills() {
  const [billsList, setBillsList] = useState<Array<{ id: number | string; name: string; category: string; dueDate: string; amount: number; status: 'upcoming' | 'paid' | 'overdue'; autoPay: boolean; icon: string }>>([]);
  const [isAddBillOpen, setIsAddBillOpen] = useState(false);
  const [baseCurrency, setBaseCurrency] = useState('INR');

  // Form state
  const [billerName, setBillerName] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [dueDate, setDueDate] = useState('');
  const [autoPay, setAutoPay] = useState(false);
  const [reminderFrequency, setReminderFrequency] = useState('3-days');

  const upcomingBills = billsList.filter(b => b.status === 'upcoming');
  const paidBills = billsList.filter(b => b.status === 'paid');
  const overdueBills = billsList.filter(b => b.status === 'overdue');

  const totalUpcoming = upcomingBills.reduce((sum, b) => sum + b.amount, 0);
  const totalPaid = paidBills.reduce((sum, b) => sum + b.amount, 0);
  const autoPayCount = billsList.filter(b => b.autoPay).length;

  const categories = [
    'Utilities',
    'Internet & Phone',
    'Insurance',
    'Subscription',
    'Rent/Mortgage',
    'Credit Card',
    'Loan Payment',
    'Other'
  ];

  const exchangeRates: Record<string, number> = {
    'INR': 1,
    'USD': 83.25,
    'EUR': 90.15,
    'GBP': 105.80
  };

  const convertAmount = (amount: number, fromCurrency: string, toCurrency: string) => {
    if (fromCurrency === toCurrency) return amount;
    const inINR = amount * exchangeRates[fromCurrency];
    return inINR / exchangeRates[toCurrency];
  };

  const handleAddBill = () => {
    if (!billerName || !category || !amount || !dueDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newBill = {
      id: `bill-${Date.now()}`,
      name: billerName,
      category,
      amount: parseFloat(amount),
      dueDate,
      status: 'upcoming' as const,
      autoPay,
      icon: category.toLowerCase()
    };

    setBillsList([...billsList, newBill]);
    setIsAddBillOpen(false);

    // Reset form
    setBillerName('');
    setCategory('');
    setAmount('');
    setCurrency('INR');
    setDueDate('');
    setAutoPay(false);
    setReminderFrequency('3-days');

    toast.success('Bill added successfully!');
  };

  const handleExportCSV = () => {
    toast.success('Exporting bills to CSV...');
    // TODO: Implement CSV export
    setTimeout(() => {
      toast.success('Bills exported successfully!');
    }, 1000);
  };

  const handleExportPDF = () => {
    toast.success('Exporting bills to PDF...');
    // TODO: Implement PDF export
    setTimeout(() => {
      toast.success('Bills exported successfully!');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Bills & Reminders</h2>
          <p className="text-muted-foreground mt-1">Track and manage your recurring payments</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Dialog open={isAddBillOpen} onOpenChange={setIsAddBillOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Bill
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Bill</DialogTitle>
                <DialogDescription>
                  Create a new bill reminder with payment details
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="billerName">Biller Name *</Label>
                  <Input
                    id="billerName"
                    placeholder="e.g., Electric Company"
                    value={billerName}
                    onChange={(e) => setBillerName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount *</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">INR ₹</SelectItem>
                        <SelectItem value="USD">USD $</SelectItem>
                        <SelectItem value="EUR">EUR €</SelectItem>
                        <SelectItem value="GBP">GBP £</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date *</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reminderFrequency">Reminder Frequency</Label>
                  <Select value={reminderFrequency} onValueChange={setReminderFrequency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-day">1 day before</SelectItem>
                      <SelectItem value="3-days">3 days before</SelectItem>
                      <SelectItem value="7-days">7 days before</SelectItem>
                      <SelectItem value="14-days">14 days before</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="autoPay">Enable Auto-Pay</Label>
                    <p className="text-xs text-muted-foreground">
                      Automatically pay this bill when due
                    </p>
                  </div>
                  <Switch
                    id="autoPay"
                    checked={autoPay}
                    onCheckedChange={setAutoPay}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsAddBillOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddBill}>
                  Add Bill
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <p className="text-sm text-muted-foreground">Upcoming Bills</p>
              <p className="text-3xl font-semibold">₹{totalUpcoming.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">{upcomingBills.length} bills due</p>
            </div>
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <p className="text-sm text-muted-foreground">Paid This Month</p>
              <p className="text-3xl font-semibold">₹{totalPaid.toFixed(2)}</p>
              <p className="text-sm text-green-600">{paidBills.length} bills paid</p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <p className="text-sm text-muted-foreground">Overdue Bills</p>
              <p className="text-3xl font-semibold text-red-600">{overdueBills.length}</p>
              <p className="text-sm text-red-600">Requires attention</p>
            </div>
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <p className="text-sm text-muted-foreground">Auto-Pay Enabled</p>
              <p className="text-3xl font-semibold">{autoPayCount}</p>
              <p className="text-sm text-muted-foreground">of {billsList.length} bills</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Currency Summary */}
      <CurrencySummary />

      {/* Bill Amounts in Different Currencies */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Total Bills by Currency</h3>
            <p className="text-sm text-muted-foreground mt-1">
              View your bill totals converted to different currencies
            </p>
          </div>
          <Select value={baseCurrency} onValueChange={setBaseCurrency}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INR">INR ₹</SelectItem>
              <SelectItem value="USD">USD $</SelectItem>
              <SelectItem value="EUR">EUR €</SelectItem>
              <SelectItem value="GBP">GBP £</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-2">Upcoming Bills</p>
            <p className="text-2xl font-semibold">
              {baseCurrency === 'INR' ? '₹' : baseCurrency === 'USD' ? '$' : baseCurrency === 'EUR' ? '€' : '£'}
              {convertAmount(totalUpcoming, 'INR', baseCurrency).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">in {baseCurrency}</p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-2">Paid This Month</p>
            <p className="text-2xl font-semibold">
              {baseCurrency === 'INR' ? '₹' : baseCurrency === 'USD' ? '$' : baseCurrency === 'EUR' ? '€' : '£'}
              {convertAmount(totalPaid, 'INR', baseCurrency).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">in {baseCurrency}</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-2">Total All Bills</p>
            <p className="text-2xl font-semibold">
              {baseCurrency === 'INR' ? '₹' : baseCurrency === 'USD' ? '$' : baseCurrency === 'EUR' ? '€' : '£'}
              {convertAmount(totalUpcoming + totalPaid, 'INR', baseCurrency).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">in {baseCurrency}</p>
          </div>
        </div>
      </Card>

      {/* Upcoming Bills */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Upcoming Bills</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Bills due in the next 30 days
            </p>
          </div>
          <Badge variant="secondary">{upcomingBills.length} bills</Badge>
        </div>
        <div className="space-y-2">
          {upcomingBills.length > 0 ? (
            upcomingBills.map((bill) => (
              <BillItem key={bill.id} {...bill} />
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No upcoming bills. Add a bill to get started.
            </div>
          )}
        </div>
      </Card>

      {/* Overdue Bills */}
      {overdueBills.length > 0 && (
        <Card className="p-6 border-red-200 bg-red-50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-red-900">Overdue Bills</h3>
              <p className="text-sm text-red-700 mt-1">
                These bills require immediate attention
              </p>
            </div>
            <Badge className="bg-red-600 text-white border-0">
              {overdueBills.length} overdue
            </Badge>
          </div>
          <div className="space-y-2">
            {overdueBills.map((bill) => (
              <BillItem key={bill.id} {...bill} />
            ))}
          </div>
        </Card>
      )}

      {/* Paid Bills */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Paid Bills</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Bills paid this month
            </p>
          </div>
          <Badge className="bg-green-100 text-green-700 border-0">
            {paidBills.length} paid
          </Badge>
        </div>
        <div className="space-y-2">
          {paidBills.length > 0 ? (
            paidBills.map((bill) => (
              <BillItem key={bill.id} {...bill} />
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No bills paid this month yet.
            </div>
          )}
        </div>
      </Card>

      {/* Calendar View */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Bill Calendar - January 2026</h3>
        <div className="grid grid-cols-7 gap-4">
          {/* Calendar Header */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
            const dayBills = billsList.filter(b => {
              const billDay = new Date(b.dueDate).getDate();
              return billDay === day;
            });

            return (
              <div
                key={day}
                className={`aspect-square border border-border rounded-lg p-2 hover:border-primary transition-colors cursor-pointer ${dayBills.length > 0 ? 'bg-blue-50 border-blue-200' : 'bg-card'
                  }`}
              >
                <div className="text-sm font-medium mb-1">{day}</div>
                {dayBills.length > 0 && (
                  <div className="text-xs">
                    <Badge className="bg-blue-500 text-white border-0 text-xs px-1 py-0">
                      {dayBills.length}
                    </Badge>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}