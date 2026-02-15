import React, { useState } from 'react';
import { useBudgets } from '../context/BudgetsContext';
import api from '../../../api/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Progress } from '../../../components/ui/progress';
import { Badge } from '../../../components/ui/badge';
import { formatCurrency, cn } from '../../../lib/utils';
import { Plus, Target, AlertCircle, CheckCircle2, MoreVertical, TrendingUp } from 'lucide-react';

export default function Budgets() {
  const { budgets, refreshBudgets } = useBudgets();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    limit_amount: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/budgets/', formData);
      setShowModal(false);
      setFormData({ category: '', limit_amount: '', month: new Date().getMonth() + 1, year: new Date().getFullYear() });
      refreshBudgets();
    } catch (error) {
      console.error("Failed to create budget", error);
    }
  };

  const currentMonth = new Date().toLocaleString('default', { month: 'long' });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
          <p className="text-muted-foreground mt-1">Manage your monthly spending limits for {currentMonth}</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4 mr-2" />
          Set Budget
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.map((budget) => {
          const spent = budget.spent_amount || 0;
          const limit = budget.limit_amount;
          const percentage = Math.min((spent / limit) * 100, 100);
          const remaining = limit - spent;
          const isOver = spent > limit;
          const isWarning = percentage >= 80 && !isOver;

          return (
            <Card key={budget.id} className={cn(
              "group transition-all duration-300 hover:shadow-xl",
              isOver ? "border-destructive/50" : "hover:border-primary/40"
            )}>
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      isOver ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                    )}>
                      <Target className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg capitalize">{budget.category}</CardTitle>
                      <CardDescription>Target for {currentMonth}</CardDescription>
                    </div>
                  </div>
                  <button className="text-muted-foreground hover:text-foreground">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <div className="text-2xl font-bold tracking-tight">
                      {formatCurrency(spent)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      of {formatCurrency(limit)}
                    </div>
                  </div>
                  <Progress
                    value={percentage}
                    className="h-2"
                    indicatorClassName={cn(
                      isOver ? "bg-destructive" : isWarning ? "bg-warning" : "bg-primary"
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                  <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase">Remaining</div>
                    <div className={cn("text-sm font-semibold", isOver ? "text-destructive" : "text-success")}>
                      {isOver ? "Limit Exceeded" : formatCurrency(remaining)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase">Status</div>
                    <Badge variant="outline" className={cn(
                      "mt-0.5",
                      isOver ? "text-destructive border-destructive/20 bg-destructive/5" :
                        isWarning ? "text-warning border-warning/20 bg-warning/5" :
                          "text-success border-success/20 bg-success/5"
                    )}>
                      {isOver ? "Over Budget" : isWarning ? "Warning" : "On Track"}
                    </Badge>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="bg-muted/30 pt-4 pb-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  <span>Calculated from your {currentMonth} transactions</span>
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <Card className="w-full max-w-sm relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <CardHeader>
              <CardTitle>Set Category Budget</CardTitle>
              <CardDescription>Define a monthly spending limit for a category</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dining, Shopping"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Limit Amount (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="0.00"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all"
                    value={formData.limit_amount}
                    onChange={(e) => setFormData({ ...formData, limit_amount: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase">Month</div>
                    <div className="text-sm font-medium">{currentMonth}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase">Year</div>
                    <div className="text-sm font-medium">{new Date().getFullYear()}</div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-3">
                <Button variant="ghost" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit">Set Budget</Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
