import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BudgetProgress } from '@/components/BudgetProgress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, TrendingUp, TrendingDown, Edit2, Trash2, Download } from 'lucide-react';
import api from '@/services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/** Read the user JWT stored by the Login page. */
function getUserToken(): string | null {
  return localStorage.getItem('access_token');
}

interface Budget {
  id: string;
  category: string;
  spent: number;
  limit: number;
  icon: string;
  color?: string;
}

export function Budgets() {
  const [token, setToken] = useState<string | null>(getUserToken());
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiSpending, setApiSpending] = useState<Array<{ name: string; value: number; fill: string }> | null>(null);
  const [apiTrends, setApiTrends] = useState<Array<{ month: string; spent: number }> | null>(null);

  const fetchBudgets = async () => {
    const currentToken = getUserToken();
    if (!currentToken) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/budgets/`, {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBudgets(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch budgets:', err);
      toast.error('Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const remaining = totalBudget - totalSpent;
  const percentageUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);

  // Form state
  const [category, setCategory] = useState('');
  const [limit, setLimit] = useState('');
  const [spent, setSpent] = useState('0');

  const CATEGORY_COLORS: Record<string, string> = {
    'Food & Dining': '#ff6384',
    'Shopping': '#36a2eb',
    'Transportation': '#ffce56',
    'Bills & Utilities': '#4bc0c0',
    'Entertainment': '#9966ff',
    'Healthcare': '#ff9f40',
    'Travel': '#c9cbcf',
    'Groceries': '#7bc043',
    'Education': '#f37735',
    'Personal Care': '#d11141',
    'Savings': '#00aedb',
    'Other': '#999999',
  };

  /** Derive pie-chart data from budgets when dashboard API has no transaction-based data */
  const deriveSpendingFromBudgets = (budgetList: Budget[]) => {
    return budgetList
      .filter(b => b.spent > 0)
      .map(b => ({
        name: b.category,
        value: b.spent,
        fill: CATEGORY_COLORS[b.category] || '#0066ff',
      }));
  };

  /** Derive a simple bar-chart entry from budgets when no monthly transaction data */
  const deriveTrendsFromBudgets = (budgetList: Budget[]) => {
    const tSpent = budgetList.reduce((sum, b) => sum + b.spent, 0);
    if (tSpent <= 0) return [];
    const currentMonth = new Date().toLocaleString('default', { month: 'short' });
    return [{ month: currentMonth, spent: tSpent }];
  };

  // Final charting data: pick API data if it has items, otherwise fallback to local budgets data
  const spendingByCategory = (apiSpending && apiSpending.length > 0) 
    ? apiSpending 
    : deriveSpendingFromBudgets(budgets);

  const monthlyData = (apiTrends && apiTrends.length > 0)
    ? apiTrends
    : deriveTrendsFromBudgets(budgets);

  useEffect(() => {
    setToken(getUserToken());
    fetchBudgets();
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const data = await api.getUserDashboard();
      setApiSpending(data.spendingByCategory || []);
      setApiTrends(data.monthlySpending || []);
    } catch (error) {
      console.error('Failed to load spending data:', error);
      setApiSpending([]);
      setApiTrends([]);
    }
  };

  const categories = [
    'Food & Dining',
    'Shopping',
    'Transportation',
    'Bills & Utilities',
    'Entertainment',
    'Healthcare',
    'Travel',
    'Groceries',
    'Education',
    'Personal Care',
    'Savings',
    'Other'
  ];



  const handleCreateBudget = async () => {
    if (!category || !limit) {
      toast.error('Please fill in all required fields');
      return;
    }

    const limitNum = parseFloat(limit);
    if (isNaN(limitNum) || limitNum <= 0) {
      toast.error('Please enter a valid budget limit');
      return;
    }

    // Check if category already exists
    if (budgets.find(b => b.category.toLowerCase() === category.toLowerCase())) {
      toast.error('A budget for this category already exists');
      return;
    }

    try {
      const currentToken = getUserToken();
      const res = await fetch(`${API_URL}/api/budgets/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentToken}`
        },
        body: JSON.stringify({
          category,
          limit: limitNum,
          spent: parseFloat(spent) || 0,
          icon: category.toLowerCase().replace(/\s+/g, '-')
        })
      });

      if (res.ok) {
        toast.success('Budget created successfully!');
        fetchBudgets();
        setIsCreateOpen(false);
        setCategory('');
        setLimit('');
        setSpent('0');
      } else {
        const errData = await res.json();
        toast.error(errData.detail || 'Failed to create budget');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to create budget due to network error');
    }
  };

  const handleEditBudget = async () => {
    if (!selectedBudget || !limit) {
      toast.error('Please enter a valid budget limit');
      return;
    }

    const limitNum = parseFloat(limit);
    if (isNaN(limitNum) || limitNum <= 0) {
      toast.error('Please enter a valid budget limit');
      return;
    }

    try {
      const currentToken = getUserToken();
      const res = await fetch(`${API_URL}/api/budgets/${selectedBudget.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentToken}`
        },
        body: JSON.stringify({
          limit: limitNum,
          spent: parseFloat(spent) || selectedBudget.spent,
          category: category
        })
      });

      if (res.ok) {
        toast.success('Budget updated successfully!');
        fetchBudgets();
        setIsEditOpen(false);
        setSelectedBudget(null);
        setLimit('');
        setSpent('0');
      } else {
        toast.error('Failed to update budget');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update budget due to network error');
    }
  };

  const handleDeleteBudget = async () => {
    if (!selectedBudget) return;

    try {
      const currentToken = getUserToken();
      const res = await fetch(`${API_URL}/api/budgets/${selectedBudget.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${currentToken}`
        }
      });
      if (res.ok) {
        toast.success('Budget deleted successfully!');
        fetchBudgets();
        setDeleteDialogOpen(false);
        setSelectedBudget(null);
      } else {
        toast.error('Failed to delete budget');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete budget due to network error');
    }
  };

  const openEditDialog = (budget: Budget) => {
    setSelectedBudget(budget);
    setCategory(budget.category);
    setLimit(budget.limit.toString());
    setSpent(budget.spent.toString());
    setIsEditOpen(true);
  };

  const openDeleteDialog = (budget: Budget) => {
    setSelectedBudget(budget);
    setDeleteDialogOpen(true);
  };

  const handleExportCSV = async () => {
    const currentToken = getUserToken();
    if (!currentToken) return;
    toast.info('Downloading CSV...');
    try {
      const res = await fetch(`${API_URL}/api/budgets/export-csv`, {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'budgets.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Budgets exported successfully!');
    } catch (err) {
      toast.error('Failed to export CSV');
    }
  };

  const handleExportPDF = async () => {
    const currentToken = getUserToken();
    if (!currentToken) return;
    toast.info('Downloading PDF...');
    try {
      const res = await fetch(`${API_URL}/api/budgets/export-pdf`, {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'budgets.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Budgets exported successfully!');
    } catch (err) {
      toast.error('Failed to export PDF');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Budget Management</h2>
          <p className="text-muted-foreground mt-1">Track and manage your spending budgets</p>
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
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Budget
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Budget</DialogTitle>
                <DialogDescription>
                  Set a monthly spending limit for a category
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
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

                <div className="space-y-2">
                  <Label htmlFor="limit">Monthly Limit (₹) *</Label>
                  <Input
                    id="limit"
                    type="number"
                    placeholder="e.g., 5000"
                    value={limit}
                    onChange={(e) => setLimit(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Set the maximum amount you want to spend in this category per month
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="spent">Current Spent (₹)</Label>
                  <Input
                    id="spent"
                    type="number"
                    placeholder="0"
                    value={spent}
                    onChange={(e) => setSpent(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Optional: Enter amount already spent this month
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateBudget}>
                  Create Budget
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Total Budget</p>
            <p className="text-3xl font-semibold">₹{totalBudget.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">For January 2026</p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Total Spent</p>
            <p className="text-3xl font-semibold">₹{totalSpent.toFixed(2)}</p>
            <div className="flex items-center gap-1 text-sm text-orange-600">
              <TrendingUp className="w-4 h-4" />
              <span>{percentageUsed.toFixed(1)}% of budget</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Remaining</p>
            <p className="text-3xl font-semibold">₹{remaining.toFixed(2)}</p>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <TrendingDown className="w-4 h-4" />
              <span>{(100 - percentageUsed).toFixed(1)}% available</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Budget List - Takes 2 columns */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Budget Categories</h3>
              <span className="text-sm text-muted-foreground">{budgets.length} budgets</span>
            </div>
            <div className="space-y-6">
              {budgets.length > 0 ? (
                budgets.map((budget) => (
                  <div key={budget.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <BudgetProgress {...budget} color={budget.color || '#0066ff'} />
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(budget)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(budget)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="mb-4">No budgets created yet</p>
                  <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Budget
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Spending Trends */}
          <Card className="p-6 mt-6">
            <h3 className="text-lg font-semibold mb-6">Spending Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="spent" fill="#0066ff" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Spending Breakdown */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Spending Breakdown</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={spendingByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {spendingByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {spendingByCategory.map((category) => (
                <div key={category.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.fill }}
                    />
                    <span>{category.name}</span>
                  </div>
                  <span className="font-medium">₹{category.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Budget Summary */}
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
            <h3 className="text-lg font-semibold mb-4">Budget Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between p-3 bg-white rounded-lg">
                <span className="text-muted-foreground">Categories</span>
                <span className="font-semibold">{budgets.length}</span>
              </div>
              <div className="flex justify-between p-3 bg-white rounded-lg">
                <span className="text-muted-foreground">On Track</span>
                <span className="font-semibold text-green-600">
                  {budgets.filter(b => (b.spent / b.limit) <= 0.75).length}
                </span>
              </div>
              <div className="flex justify-between p-3 bg-white rounded-lg">
                <span className="text-muted-foreground">At Risk</span>
                <span className="font-semibold text-orange-600">
                  {budgets.filter(b => (b.spent / b.limit) > 0.75 && (b.spent / b.limit) < 1).length}
                </span>
              </div>
              <div className="flex justify-between p-3 bg-white rounded-lg">
                <span className="text-muted-foreground">Exceeded</span>
                <span className="font-semibold text-red-600">
                  {budgets.filter(b => (b.spent / b.limit) >= 1).length}
                </span>
              </div>
            </div>
          </Card>

          {/* Budget Tips */}
          <Card className="p-6 bg-blue-50">
            <h3 className="text-lg font-semibold mb-4">Budget Tips</h3>
            <div className="space-y-3 text-sm">
              <div className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                <p>Track your spending regularly to stay on budget.</p>
              </div>
              <div className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                <p>Set realistic limits based on your income.</p>
              </div>
              <div className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                <p>Review and adjust budgets monthly.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Budget Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Budget</DialogTitle>
            <DialogDescription>
              Update the spending limit for {selectedBudget?.category}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-limit">Monthly Limit (₹) *</Label>
              <Input
                id="edit-limit"
                type="number"
                placeholder="e.g., 5000"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-spent">Current Spent (₹)</Label>
              <Input
                id="edit-spent"
                type="number"
                placeholder="0"
                value={spent}
                onChange={(e) => setSpent(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditBudget}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Budget</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the budget for {selectedBudget?.category}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBudget} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
