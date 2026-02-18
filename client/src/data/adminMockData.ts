// Admin Mock Data - Empty State Placeholders
// Real API integration will be added later

export const adminStats = {
  totalUsers: 0,
  activeUsers: 0,
  linkedAccounts: 0,
  alertsTriggered: 0,
  growthRate: {
    users: 0,
    accounts: 0,
    alerts: 0
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
}> = [];

export const systemAlerts: Array<{
  id: number;
  userId: number;
  userName: string;
  type: 'low_balance' | 'bill_due' | 'budget_exceeded';
  message: string;
  timestamp: string;
  status: 'read' | 'unread';
  severity: 'low' | 'medium' | 'high';
}> = [];

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
}> = [];

export const alertTrendData: Array<{
  month: string;
  low_balance: number;
  bill_due: number;
  budget_exceeded: number;
}> = [];

export const userGrowthData: Array<{
  month: string;
  users: number;
}> = [];

export const alertTypeDistribution: Array<{
  name: string;
  value: number;
  fill: string;
}> = [];

export const topAlertCategories: Array<{
  category: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
}> = [];

