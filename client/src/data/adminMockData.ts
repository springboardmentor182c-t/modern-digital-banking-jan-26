// Admin Mock Data — used as fallback when the database / API is unavailable

export const adminStats = {
  totalUsers: 1284,
  activeUsers: 942,
  linkedAccounts: 3721,
  alertsTriggered: 218,
  growthRate: {
    users: 12,
    accounts: 8,
    alerts: -4
  }
};

export const systemUsers: Array<{
  id: number;
  name: string;
  email: string;
  kycStatus: 'verified' | 'pending' | 'rejected';
  accountCount: number;
  joinedDate: string;
  status: 'active' | 'suspended' | 'inactive';
  lastActive: string;
}> = [
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com', kycStatus: 'verified', accountCount: 3, joinedDate: '2025-03-12', status: 'active', lastActive: '2026-03-01' },
    { id: 2, name: 'Bob Martinez', email: 'bob@example.com', kycStatus: 'pending', accountCount: 1, joinedDate: '2025-06-05', status: 'active', lastActive: '2026-02-28' },
    { id: 3, name: 'Carol Smith', email: 'carol@example.com', kycStatus: 'verified', accountCount: 4, joinedDate: '2025-01-20', status: 'suspended', lastActive: '2026-01-15' },
    { id: 4, name: 'David Lee', email: 'david@example.com', kycStatus: 'rejected', accountCount: 2, joinedDate: '2025-08-30', status: 'inactive', lastActive: '2025-12-10' },
    { id: 5, name: 'Eva Williams', email: 'eva@example.com', kycStatus: 'verified', accountCount: 2, joinedDate: '2025-04-17', status: 'active', lastActive: '2026-03-01' },
    { id: 6, name: 'Frank Nguyen', email: 'frank@example.com', kycStatus: 'pending', accountCount: 1, joinedDate: '2026-01-02', status: 'active', lastActive: '2026-02-27' },
    { id: 7, name: 'Grace Chen', email: 'grace@example.com', kycStatus: 'verified', accountCount: 3, joinedDate: '2025-11-11', status: 'active', lastActive: '2026-03-01' },
    { id: 8, name: 'Henry Patel', email: 'henry@example.com', kycStatus: 'verified', accountCount: 2, joinedDate: '2025-07-22', status: 'suspended', lastActive: '2026-02-01' },
  ];

export const systemAlerts: Array<{
  id: number;
  userId: number;
  userName: string;
  type: 'low_balance' | 'bill_due' | 'budget_exceeded';
  message: string;
  timestamp: string;
  status: 'read' | 'unread';
  severity: 'low' | 'medium' | 'high';
}> = [
    { id: 1, userId: 1, userName: 'Alice Johnson', type: 'low_balance', message: 'Account balance dropped below ₹500', timestamp: '2026-03-01T10:30:00Z', status: 'unread', severity: 'high' },
    { id: 2, userId: 3, userName: 'Carol Smith', type: 'bill_due', message: 'Electricity bill due in 2 days', timestamp: '2026-03-01T09:00:00Z', status: 'unread', severity: 'medium' },
    { id: 3, userId: 5, userName: 'Eva Williams', type: 'budget_exceeded', message: 'Dining budget exceeded by 15%', timestamp: '2026-02-29T18:45:00Z', status: 'read', severity: 'medium' },
    { id: 4, userId: 2, userName: 'Bob Martinez', type: 'low_balance', message: 'Savings account balance critically low', timestamp: '2026-02-29T14:20:00Z', status: 'unread', severity: 'high' },
    { id: 5, userId: 7, userName: 'Grace Chen', type: 'bill_due', message: 'Internet bill due tomorrow', timestamp: '2026-02-28T08:00:00Z', status: 'read', severity: 'low' },
    { id: 6, userId: 6, userName: 'Frank Nguyen', type: 'budget_exceeded', message: 'Shopping budget exceeded by ₹2,300', timestamp: '2026-02-27T20:10:00Z', status: 'unread', severity: 'medium' },
  ];

export const adminLogs: Array<{
  id: number;
  adminId: string;
  adminName: string;
  action: string;
  targetType: string;
  targetId: number | null;
  targetName: string;
  timestamp: string;
  details: string;
}> = [
    { id: 1, adminId: 'adm-001', adminName: 'Admin', action: 'USER_SUSPENDED', targetType: 'user', targetId: 3, targetName: 'Carol Smith', timestamp: '2026-03-01T11:00:00Z', details: 'Suspended due to policy violation' },
    { id: 2, adminId: 'adm-001', adminName: 'Admin', action: 'ALERT_RESOLVED', targetType: 'alert', targetId: 2, targetName: 'Alert #2', timestamp: '2026-03-01T10:45:00Z', details: 'Manually resolved low balance alert' },
    { id: 3, adminId: 'adm-001', adminName: 'Admin', action: 'USER_ACTIVATED', targetType: 'user', targetId: 5, targetName: 'Eva Williams', timestamp: '2026-03-01T09:30:00Z', details: 'KYC verification approved' },
    { id: 4, adminId: 'adm-001', adminName: 'Admin', action: 'SETTINGS_UPDATED', targetType: 'system', targetId: null, targetName: 'System', timestamp: '2026-02-29T16:00:00Z', details: 'Alert threshold updated to ₹500' },
    { id: 5, adminId: 'adm-001', adminName: 'Admin', action: 'USER_SUSPENDED', targetType: 'user', targetId: 8, targetName: 'Henry Patel', timestamp: '2026-02-28T14:00:00Z', details: 'Multiple failed login attempts' },
  ];

export const alertTrendData: Array<{
  month: string;
  low_balance: number;
  bill_due: number;
  budget_exceeded: number;
}> = [
    { month: 'Aug', low_balance: 18, bill_due: 24, budget_exceeded: 12 },
    { month: 'Sep', low_balance: 22, bill_due: 19, budget_exceeded: 15 },
    { month: 'Oct', low_balance: 15, bill_due: 28, budget_exceeded: 20 },
    { month: 'Nov', low_balance: 30, bill_due: 22, budget_exceeded: 18 },
    { month: 'Dec', low_balance: 25, bill_due: 35, budget_exceeded: 22 },
    { month: 'Jan', low_balance: 20, bill_due: 30, budget_exceeded: 16 },
    { month: 'Feb', low_balance: 28, bill_due: 26, budget_exceeded: 24 },
  ];

export const userGrowthData: Array<{
  month: string;
  users: number;
}> = [
    { month: 'Aug', users: 820 },
    { month: 'Sep', users: 910 },
    { month: 'Oct', users: 980 },
    { month: 'Nov', users: 1050 },
    { month: 'Dec', users: 1120 },
    { month: 'Jan', users: 1200 },
    { month: 'Feb', users: 1284 },
  ];

export const alertTypeDistribution: Array<{
  name: string;
  value: number;
  fill: string;
}> = [
    { name: 'Low Balance', value: 98, fill: '#f4a4a4' },
    { name: 'Bill Due', value: 76, fill: '#ffd4a3' },
    { name: 'Budget Exceeded', value: 44, fill: '#7eb9e3' },
  ];

export const topAlertCategories: Array<{
  category: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
}> = [
    { category: 'Low Balance Alerts', count: 98, trend: 'up' },
    { category: 'Bill Due Reminders', count: 76, trend: 'stable' },
    { category: 'Budget Exceeded', count: 44, trend: 'down' },
  ];

export const adminSystemSettings = {
  maintenance_mode: false,
  low_balance_threshold: 500,
  bill_due_reminder_days: 3,
  budget_warning_percentage: 85,
  alert_frequency_hours: 24,
  email_notifications: true,
  sms_notifications: false,
  push_notifications: true,
  admin_digest: true,
  two_factor_auth: false,
  session_timeout: 30,
  ip_whitelisting: false,
  max_login_attempts: 5,
  data_retention_days: 365,
  log_retention_days: 90,
  auto_backup: true,
  debug_mode: false,
};
