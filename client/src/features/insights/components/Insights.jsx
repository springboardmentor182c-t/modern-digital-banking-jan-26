import React from 'react';
import { useTransactions } from '../../transactions';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function Insights() {
  const { transactions } = useTransactions();

  // Process data for Category Pie Chart
  const categoryData = transactions.reduce((acc, txn) => {
    if (txn.txn_type === 'debit') {
      const existing = acc.find(item => item.name === txn.category);
      if (existing) {
        existing.value += parseFloat(txn.amount);
      } else {
        acc.push({ name: txn.category || 'Uncategorized', value: parseFloat(txn.amount) });
      }
    }
    return acc;
  }, []);

  // Process data for Monthly Spending Bar Chart
  const monthlyData = transactions.reduce((acc, txn) => {
    if (txn.txn_type === 'debit') {
      const date = new Date(txn.txn_date);
      const month = date.toLocaleString('default', { month: 'short' });
      const existing = acc.find(item => item.name === month);
      if (existing) {
        existing.amount += parseFloat(txn.amount);
      } else {
        acc.push({ name: month, amount: parseFloat(txn.amount) });
      }
    }
    return acc;
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-1 text-foreground">Financial Intelligence</h2>
        <p className="text-muted-foreground">Deep dive into your spending patterns and capital allocation</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-card border border-border/50 shadow-xl rounded-3xl p-8 backdrop-blur-sm">
          <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
            <span className="w-2 h-6 bg-primary rounded-full" />
            Expenses by Category
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="bg-card border border-border/50 shadow-xl rounded-3xl p-8 backdrop-blur-sm">
          <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
            <span className="w-2 h-6 bg-success rounded-full" />
            Monthly Spending Trend
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="amount" fill="#82ca9d" name="Spending" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
