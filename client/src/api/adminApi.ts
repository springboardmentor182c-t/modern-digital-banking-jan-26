// Admin API Service Layer
// Connects frontend to backend API

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface ApiResponse<T> {
  data: T;
  error?: string;
}

// API configuration with auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('admin_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Generic fetch wrapper with error handling
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('admin_token');
        window.location.href = '/admin-login';
      }
      const error = await response.json().catch(() => ({ detail: 'Request failed' }));
      return { data: null as T, error: error.detail || 'Request failed' };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    console.error('API Error:', error);
    return { data: null as T, error: 'Network error' };
  }
}

// Authentication APIs
export const authApi = {
  login: async (email: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    try {
      const response = await fetch(`${API_BASE_URL}/admin/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          return { data: null, error: 'Invalid email or password' };
        }
        const error = await response.json().catch(() => ({ detail: 'Login failed' }));
        return { data: null, error: error.detail || 'Login failed' };
      }

      const data = await response.json();
      if (data.access_token) {
        localStorage.setItem('admin_token', data.access_token);
      }
      return { data };
    } catch (error) {
      console.error('Login error:', error);
      return { data: null, error: 'Cannot connect to server. Please ensure the backend is running at ' + API_BASE_URL };
    }
  },

  logout: () => {
    localStorage.removeItem('admin_token');
    return { data: { message: 'Logged out successfully' } };
  },

  getCurrentUser: async () => {
    return apiFetch<{ id: number; email: string; name: string }>('/admin/auth/me');
  },
};

// Dashboard APIs
export const dashboardApi = {
  getStats: async () => {
    return apiFetch<{
      stats: {
        total_users: number;
        active_users: number;
        linked_accounts: number;
        alerts_triggered: number;
        growth_rate: {
          users: number;
          accounts: number;
          alerts: number;
        };
      };
      user_growth: Array<{ month: string; users: number }>;
      alert_trends: Array<{
        month: string;
        low_balance: number;
        bill_due: number;
        budget_exceeded: number;
      }>;
      alert_distribution: Array<{ name: string; value: number; fill: string }>;
      top_categories: Array<{ category: string; count: number; trend: string }>;
      recent_alerts: Array<{
        id: number;
        user_name: string;
        type: string;
        message: string;
        severity: string;
        status: string;
        timestamp: string;
      }>;
    }>('/admin/dashboard/stats');
  },

  getHealth: async () => {
    return apiFetch<{
      status: string;
      api_response_time: number | null;
      database_health: number | null;
    }>('/admin/dashboard/health');
  },
};

// User APIs
export const usersApi = {
  getUsers: async (page = 1, pageSize = 50, statusFilter?: string) => {
    let endpoint = `/admin/users/?page=${page}&page_size=${pageSize}`;
    if (statusFilter && statusFilter !== 'all') {
      endpoint += `&status_filter=${statusFilter}`;
    }
    return apiFetch<{
      users: Array<{
        id: number;
        name: string;
        email: string;
        status: string;
        kyc_status: string;
        account_count: number;
        joined_date: string;
        last_active: string;
      }>;
      total: number;
      page: number;
      page_size: number;
    }>(endpoint);
  },

  getUserStats: async () => {
    return apiFetch<{
      total: number;
      active: number;
      suspended: number;
      inactive: number;
      verified_kyc: number;
      pending_kyc: number;
    }>('/admin/users/stats');
  },

  updateUserStatus: async (userId: number, status: string) => {
    return apiFetch<{ message: string; user_id: number; status: string }>(
      `/admin/users/${userId}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }
    );
  },
};

// Alert APIs
export const alertsApi = {
  getAlerts: async (typeFilter?: string, severityFilter?: string, statusFilter?: string) => {
    let endpoint = '/admin/alerts/';
    const params = new URLSearchParams();
    if (typeFilter && typeFilter !== 'all') params.append('type_filter', typeFilter);
    if (severityFilter && severityFilter !== 'all') params.append('severity_filter', severityFilter);
    if (statusFilter && statusFilter !== 'all') params.append('status_filter', statusFilter);
    
    const queryString = params.toString();
    if (queryString) endpoint += `?${queryString}`;
    
    return apiFetch<{
      alerts: Array<{
        id: number;
        user_id: number | null;
        user_name: string;
        type: string;
        message: string;
        severity: string;
        status: string;
        timestamp: string;
      }>;
      total: number;
      type_counts: {
        low_balance: number;
        bill_due: number;
        budget_exceeded: number;
      };
    }>(endpoint);
  },

  markAsRead: async (alertId: number) => {
    return apiFetch<{ message: string; alert_id: number }>(
      `/admin/alerts/${alertId}/read`,
      { method: 'PATCH' }
    );
  },

  updateAlertStatus: async (alertId: number, status: string) => {
    return apiFetch<{ message: string; alert_id: number; status: string }>(
      `/admin/alerts/${alertId}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }
    );
  },
};

// Log APIs
export const logsApi = {
  getLogs: async (actionFilter?: string) => {
    let endpoint = '/admin/logs/';
    if (actionFilter && actionFilter !== 'all') {
      endpoint += `?action_filter=${actionFilter}`;
    }
    return apiFetch<{
      logs: Array<{
        id: number;
        admin_id: string | null;
        admin_name: string | null;
        action: string;
        target_type: string | null;
        target_id: number | null;
        target_name: string | null;
        details: string | null;
        timestamp: string | null;
      }>;
      total: number;
    }>(endpoint);
  },

  getLogStats: async () => {
    return apiFetch<{
      total: number;
      today: number;
      this_week: number;
      this_month: number;
    }>('/admin/logs/stats');
  },
};

// Settings APIs
export const settingsApi = {
  getSettings: async () => {
    return apiFetch<{
      id: number;
      maintenance_mode: boolean;
      low_balance_threshold: number;
      bill_due_reminder_days: number;
      budget_warning_percentage: number;
      alert_frequency_hours: number;
      email_notifications: boolean;
      sms_notifications: boolean;
      push_notifications: boolean;
      admin_digest: boolean;
      two_factor_auth: boolean;
      session_timeout: number;
      ip_whitelisting: boolean;
      max_login_attempts: number;
      data_retention_days: number;
      log_retention_days: number;
      auto_backup: boolean;
      debug_mode: boolean;
    }>('/admin/settings/');
  },

  updateSettings: async (settings: Record<string, unknown>) => {
    return apiFetch<{ message: string }>('/admin/settings/', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },
};

