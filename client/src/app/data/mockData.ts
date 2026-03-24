export const accounts = [
  {
    id: 1,
    type: 'Savings',
    accountNumber: '****4892',
    balance: 24750.50,
    currency: 'INR',
    icon: 'piggy-bank' as const,
    color: 'bg-primary' as const
  },
  {
    id: 2,
    type: 'Checking',
    accountNumber: '****7123',
    balance: 8420.25,
    currency: 'INR',
    icon: 'wallet' as const,
    color: 'bg-success' as const
  },
  {
    id: 3,
    type: 'Credit Card',
    accountNumber: '****9845',
    balance: -2150.00,
    currency: 'INR',
    icon: 'credit-card' as const,
    color: 'bg-secondary' as const
  },
  {
    id: 4,
    type: 'Investment',
    accountNumber: '****2401',
    balance: 45620.75,
    currency: 'INR',
    icon: 'trending-up' as const,
    color: 'bg-warning' as const
  }
];

export const transactions = [
  {
    id: 1,
    merchant: 'Starbucks Coffee',
    category: 'Food & Dining',
    date: '2026-01-16',
    amount: -5.75,
    type: 'debit' as const,
    status: 'completed' as const
  },
  {
    id: 2,
    merchant: 'Salary Deposit',
    category: 'Income',
    date: '2026-01-15',
    amount: 5200.00,
    type: 'credit' as const,
    status: 'completed' as const
  },
  {
    id: 3,
    merchant: 'Amazon Purchase',
    category: 'Shopping',
    date: '2026-01-15',
    amount: -89.99,
    type: 'debit' as const,
    status: 'completed' as const
  },
  {
    id: 4,
    merchant: 'Netflix Subscription',
    category: 'Entertainment',
    date: '2026-01-14',
    amount: -15.99,
    type: 'debit' as const,
    status: 'completed' as const
  },
  {
    id: 5,
    merchant: 'Shell Gas Station',
    category: 'Transportation',
    date: '2026-01-14',
    amount: -45.20,
    type: 'debit' as const,
    status: 'completed' as const
  },
  {
    id: 6,
    merchant: 'Target',
    category: 'Shopping',
    date: '2026-01-13',
    amount: -127.45,
    type: 'debit' as const,
    status: 'completed' as const
  },
  {
    id: 7,
    merchant: 'Electric Company',
    category: 'Bills & Utilities',
    date: '2026-01-12',
    amount: -85.00,
    type: 'debit' as const,
    status: 'completed' as const
  },
  {
    id: 8,
    merchant: 'Whole Foods',
    category: 'Groceries',
    date: '2026-01-12',
    amount: -156.32,
    type: 'debit' as const,
    status: 'completed' as const
  }
];

export const budgets = [
  {
    id: 1,
    category: 'Groceries',
    spent: 456.32,
    limit: 600,
    icon: 'shopping-basket' as const,
    color: 'bg-success' as const
  },
  {
    id: 2,
    category: 'Dining Out',
    spent: 285.50,
    limit: 300,
    icon: 'utensils' as const,
    color: 'bg-warning' as const
  },
  {
    id: 3,
    category: 'Transportation',
    spent: 145.20,
    limit: 200,
    icon: 'car' as const,
    color: 'bg-primary' as const
  },
  {
    id: 4,
    category: 'Entertainment',
    spent: 89.99,
    limit: 150,
    icon: 'film' as const,
    color: 'bg-secondary' as const
  },
  {
    id: 5,
    category: 'Shopping',
    spent: 320.44,
    limit: 400,
    icon: 'shopping-bag' as const,
    color: 'bg-destructive' as const
  }
];

export const bills = [
  {
    id: 1,
    name: 'Electric Bill',
    category: 'Utilities',
    dueDate: '2026-01-20',
    amount: 85.00,
    status: 'upcoming' as const,
    autoPay: true,
    icon: 'zap' as const
  },
  {
    id: 2,
    name: 'Internet Service',
    category: 'Internet & Phone',
    dueDate: '2026-01-18',
    amount: 79.99,
    status: 'upcoming' as const,
    autoPay: true,
    icon: 'wifi' as const
  },
  {
    id: 3,
    name: 'Phone Bill',
    category: 'Internet & Phone',
    dueDate: '2026-01-25',
    amount: 65.00,
    status: 'upcoming' as const,
    autoPay: false,
    icon: 'smartphone' as const
  },
  {
    id: 4,
    name: 'Rent Payment',
    category: 'Rent/Mortgage',
    dueDate: '2026-02-01',
    amount: 1500.00,
    status: 'upcoming' as const,
    autoPay: true,
    icon: 'home' as const
  },
  {
    id: 5,
    name: 'Credit Card Payment',
    category: 'Credit Card',
    dueDate: '2026-01-15',
    amount: 450.00,
    status: 'paid' as const,
    autoPay: false,
    icon: 'credit-card' as const
  }
];

export const rewards = {
  totalPoints: 12450,
  programName: 'SmartBank Rewards',
  tier: 'Gold',
  pointsToNextTier: 2550,
  recentEarnings: [
    { date: '2026-01-15', points: 520, description: 'Salary Deposit Bonus' },
    { date: '2026-01-10', points: 180, description: 'Shopping Rewards' },
    { date: '2026-01-05', points: 250, description: 'Monthly Bonus' }
  ]
};

export const alerts = [
  {
    id: 1,
    type: 'warning' as const,
    message: 'Dining Out budget almost reached (95%)',
    date: '2026-01-16',
    icon: 'alert-triangle' as const
  },
  {
    id: 2,
    type: 'info' as const,
    message: 'Your electric bill is due in 4 days',
    date: '2026-01-16',
    icon: 'info' as const
  },
  {
    id: 3,
    type: 'success' as const,
    message: 'Salary deposit received',
    date: '2026-01-15',
    icon: 'check-circle' as const
  }
];

export const spendingByCategory = [
  { name: 'Groceries', value: 456, fill: '#a8e6cf' },
  { name: 'Dining', value: 285, fill: '#ffd4a3' },
  { name: 'Shopping', value: 320, fill: '#f4a4a4' },
  { name: 'Transport', value: 145, fill: '#7eb9e3' },
  { name: 'Entertainment', value: 90, fill: '#e6d9f2' },
  { name: 'Bills', value: 680, fill: '#daf5e7' }
];

export const cashFlowData = [
  { month: 'Jul', income: 5200, expenses: 3850 },
  { month: 'Aug', income: 5200, expenses: 4100 },
  { month: 'Sep', income: 5200, expenses: 3650 },
  { month: 'Oct', income: 5200, expenses: 4200 },
  { month: 'Nov', income: 5400, expenses: 3900 },
  { month: 'Dec', income: 5800, expenses: 4500 },
  { month: 'Jan', income: 5200, expenses: 1976 }
];