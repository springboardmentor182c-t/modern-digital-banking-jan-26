export const adminStats = {
  totalUsers: 1247,
  activeUsers: 892,
  linkedAccounts: 3856,
  alertsTriggered: 156,
  growthRate: {
    users: 12.5,
    accounts: 8.3,
    alerts: -15.2
  }
};

export const systemUsers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    kycStatus: 'verified' as const,
    accountCount: 4,
    joinedDate: '2025-11-15',
    status: 'active' as const,
    lastActive: '2026-01-18'
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    kycStatus: 'verified' as const,
    accountCount: 3,
    joinedDate: '2025-12-03',
    status: 'active' as const,
    lastActive: '2026-01-17'
  },
  {
    id: 3,
    name: 'Michael Chen',
    email: 'michael.chen@example.com',
    kycStatus: 'verified' as const,
    accountCount: 2,
    joinedDate: '2025-10-22',
    status: 'active' as const,
    lastActive: '2026-01-18'
  },
  {
    id: 4,
    name: 'Emily Davis',
    email: 'emily.d@example.com',
    kycStatus: 'pending' as const,
    accountCount: 1,
    joinedDate: '2026-01-10',
    status: 'active' as const,
    lastActive: '2026-01-16'
  },
  {
    id: 5,
    name: 'David Wilson',
    email: 'david.w@example.com',
    kycStatus: 'verified' as const,
    accountCount: 5,
    joinedDate: '2025-09-18',
    status: 'suspended' as const,
    lastActive: '2026-01-05'
  },
  {
    id: 6,
    name: 'Lisa Anderson',
    email: 'lisa.a@example.com',
    kycStatus: 'verified' as const,
    accountCount: 3,
    joinedDate: '2025-11-28',
    status: 'active' as const,
    lastActive: '2026-01-18'
  },
  {
    id: 7,
    name: 'Robert Martinez',
    email: 'robert.m@example.com',
    kycStatus: 'pending' as const,
    accountCount: 2,
    joinedDate: '2026-01-12',
    status: 'active' as const,
    lastActive: '2026-01-17'
  },
  {
    id: 8,
    name: 'Jennifer Taylor',
    email: 'jennifer.t@example.com',
    kycStatus: 'verified' as const,
    accountCount: 4,
    joinedDate: '2025-10-05',
    status: 'active' as const,
    lastActive: '2026-01-18'
  }
];

export const systemAlerts = [
  {
    id: 1,
    userId: 1,
    userName: 'John Doe',
    type: 'low_balance' as const,
    message: 'Savings Account balance below ₹1000',
    timestamp: '2026-01-18 14:23:00',
    status: 'unread' as const,
    severity: 'medium' as const
  },
  {
    id: 2,
    userId: 2,
    userName: 'Sarah Johnson',
    type: 'bill_due' as const,
    message: 'Electric Bill due in 2 days',
    timestamp: '2026-01-18 10:15:00',
    status: 'unread' as const,
    severity: 'low' as const
  },
  {
    id: 3,
    userId: 3,
    userName: 'Michael Chen',
    type: 'budget_exceeded' as const,
    message: 'Dining Out budget 95% utilized',
    timestamp: '2026-01-18 09:30:00',
    status: 'read' as const,
    severity: 'high' as const
  },
  {
    id: 4,
    userId: 4,
    userName: 'Emily Davis',
    type: 'low_balance' as const,
    message: 'Checking Account balance below ₹500',
    timestamp: '2026-01-17 18:45:00',
    status: 'unread' as const,
    severity: 'high' as const
  },
  {
    id: 5,
    userId: 6,
    userName: 'Lisa Anderson',
    type: 'bill_due' as const,
    message: 'Credit Card payment due tomorrow',
    timestamp: '2026-01-17 15:20:00',
    status: 'read' as const,
    severity: 'medium' as const
  },
  {
    id: 6,
    userId: 8,
    userName: 'Jennifer Taylor',
    type: 'budget_exceeded' as const,
    message: 'Shopping budget exceeded by 15%',
    timestamp: '2026-01-17 12:00:00',
    status: 'unread' as const,
    severity: 'high' as const
  },
  {
    id: 7,
    userId: 1,
    userName: 'John Doe',
    type: 'bill_due' as const,
    message: 'Internet Service bill due in 3 days',
    timestamp: '2026-01-16 16:30:00',
    status: 'read' as const,
    severity: 'low' as const
  },
  {
    id: 8,
    userId: 7,
    userName: 'Robert Martinez',
    type: 'low_balance' as const,
    message: 'Investment Account needs review',
    timestamp: '2026-01-16 11:10:00',
    status: 'read' as const,
    severity: 'medium' as const
  }
];

export const adminLogs = [
  {
    id: 1,
    adminId: 'ADM001',
    adminName: 'Admin User',
    action: 'User Suspended',
    targetType: 'User',
    targetId: 5,
    targetName: 'David Wilson',
    timestamp: '2026-01-18 13:45:00',
    details: 'Suspicious activity detected'
  },
  {
    id: 2,
    adminId: 'ADM001',
    adminName: 'Admin User',
    action: 'Alert Dismissed',
    targetType: 'Alert',
    targetId: 3,
    targetName: 'Budget Alert #3',
    timestamp: '2026-01-18 12:20:00',
    details: 'False positive'
  },
  {
    id: 3,
    adminId: 'ADM001',
    adminName: 'Admin User',
    action: 'User Activated',
    targetType: 'User',
    targetId: 2,
    targetName: 'Sarah Johnson',
    timestamp: '2026-01-18 09:15:00',
    details: 'KYC verification completed'
  },
  {
    id: 4,
    adminId: 'ADM001',
    adminName: 'Admin User',
    action: 'System Settings Updated',
    targetType: 'Settings',
    targetId: null,
    targetName: 'Alert Thresholds',
    timestamp: '2026-01-17 16:30:00',
    details: 'Updated low balance threshold to ₹1000'
  },
  {
    id: 5,
    adminId: 'ADM001',
    adminName: 'Admin User',
    action: 'Report Generated',
    targetType: 'Report',
    targetId: 124,
    targetName: 'Monthly Analytics Report',
    timestamp: '2026-01-17 10:00:00',
    details: 'December 2025 report'
  }
];

export const alertTrendData = [
  { month: 'Jul', low_balance: 12, bill_due: 28, budget_exceeded: 8 },
  { month: 'Aug', low_balance: 15, bill_due: 32, budget_exceeded: 10 },
  { month: 'Sep', low_balance: 10, bill_due: 25, budget_exceeded: 6 },
  { month: 'Oct', low_balance: 18, bill_due: 30, budget_exceeded: 12 },
  { month: 'Nov', low_balance: 14, bill_due: 27, budget_exceeded: 9 },
  { month: 'Dec', low_balance: 20, bill_due: 35, budget_exceeded: 15 },
  { month: 'Jan', low_balance: 16, bill_due: 29, budget_exceeded: 11 }
];

export const userGrowthData = [
  { month: 'Jul', users: 856 },
  { month: 'Aug', users: 912 },
  { month: 'Sep', users: 978 },
  { month: 'Oct', users: 1045 },
  { month: 'Nov', users: 1134 },
  { month: 'Dec', users: 1198 },
  { month: 'Jan', users: 1247 }
];

export const alertTypeDistribution = [
  { name: 'Low Balance', value: 45, fill: '#f4a4a4' },
  { name: 'Bill Due', value: 62, fill: '#ffd4a3' },
  { name: 'Budget Exceeded', value: 49, fill: '#7eb9e3' }
];

export const topAlertCategories = [
  { category: 'Low Balance Alerts', count: 45, trend: 'up' },
  { category: 'Upcoming Bills', count: 62, trend: 'stable' },
  { category: 'Budget Warnings', count: 49, trend: 'down' }
];
