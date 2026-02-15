import React, { useState } from 'react';
import { useBills } from '../context/BillsContext';
import api from '../../../api/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { formatCurrency, formatDate, cn } from '../../../lib/utils';
import { Plus, Calendar, AlertCircle, CheckCircle2, MoreVertical, CreditCard, ExternalLink, SwitchCamera } from 'lucide-react';

export default function Bills() {
  const { bills, refreshBills } = useBills();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    biller_name: '',
    due_date: '',
    amount_due: '',
    status: 'upcoming',
    auto_pay: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/bills/', formData);
      setShowModal(false);
      setFormData({ biller_name: '', due_date: '', amount_due: '', status: 'upcoming', auto_pay: false });
      refreshData();
    } catch (error) {
      console.error("Failed to add bill", error);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid': return <Badge className="bg-success/10 text-success border-none">Paid</Badge>;
      case 'overdue': return <Badge className="bg-destructive/10 text-destructive border-none">Overdue</Badge>;
      default: return <Badge variant="secondary" className="bg-warning/10 text-warning border-none">Upcoming</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bills & Utilities</h1>
          <p className="text-muted-foreground mt-1">Track and pay your upcoming utility bills and subscriptions</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4 mr-2" />
          Add Bill
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {bills.map((bill) => (
          <Card key={bill.id} className="group hover:border-primary/40 transition-all duration-300">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-bold text-lg">{bill.biller_name}</div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                      <span>Due on {formatDate(bill.due_date)}</span>
                      {bill.auto_pay && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-border" />
                          <div className="flex items-center gap-1 text-primary text-[10px] font-bold uppercase tracking-wider">
                            <SwitchCamera className="h-3 w-3" />
                            Auto-pay
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-8 border-t md:border-t-0 pt-4 md:pt-0">
                  <div className="text-right">
                    <div className="text-2xl font-bold tracking-tight">{formatCurrency(bill.amount_due)}</div>
                    <div className="mt-1">{getStatusBadge(bill.status)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="hidden sm:flex border-border font-semibold">
                      View Bill
                    </Button>
                    <Button size="sm" className="shadow-md shadow-primary/10">
                      Pay Now
                    </Button>
                    <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <Card className="w-full max-w-sm relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <CardHeader>
              <CardTitle>Register New Biller</CardTitle>
              <CardDescription>Add a utility biller to your tracking list</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Biller Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Airtel, BESCOM, Tata Play"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                    value={formData.biller_name}
                    onChange={(e) => setFormData({ ...formData, biller_name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Due Date</label>
                    <input
                      type="date"
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Amount (₹)</label>
                    <input
                      type="number"
                      required
                      placeholder="0.00"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                      value={formData.amount_due}
                      onChange={(e) => setFormData({ ...formData, amount_due: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border/50">
                  <input
                    type="checkbox"
                    id="auto_pay"
                    className="h-4 w-4 text-primary focus:ring-primary border-input rounded transition-all"
                    checked={formData.auto_pay}
                    onChange={(e) => setFormData({ ...formData, auto_pay: e.target.checked })}
                  />
                  <label htmlFor="auto_pay" className="text-sm font-medium cursor-pointer">Enable Auto-pay for this biller</label>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-3">
                <Button variant="ghost" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit">Add Bill</Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
