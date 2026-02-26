/**
 * API Service Layer for SmartBank
 * Handles all backend API calls with authentication
 */

const API_BASE = ''; // Uses Vite proxy (see vite.config.ts)

/**
 * Get the JWT token from localStorage
 */
function getAuthToken(): string | null {
  return localStorage.getItem('access_token');
}

/**
 * Get the user ID from localStorage
 */
function getUserId(): string | null {
  return localStorage.getItem('user_id');
}

/**
 * Make authenticated API request
 */
async function authenticatedFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getAuthToken();
  const userId = getUserId();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  
  // Also send user_id as X-User-Id header for fallback authentication
  if (userId) {
    (headers as Record<string, string>)['X-User-Id'] = userId;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  return response;
}

/**
 * Account types
 */
export interface Account {
  id: number;
  bank_name: string;
  account_name: string;
  account_number: string;
  account_type: string;
  currency: string;
  balance: number;
  status: string;
}

export interface CreateAccountData {
  bankName: string;
  accountType: string;
  accountNumber: string;
  currency: string;
  initialBalance: number;
}

export interface UpdateAccountData {
  bank_name?: string;
  account_type?: string;
  currency?: string;
  balance?: number;
  status?: string;
}

/**
 * Get all accounts for the logged-in user
 */
export async function getAccounts(): Promise<Account[]> {
  try {
    const response = await authenticatedFetch('/api/accounts');
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to fetch accounts' }));
      throw new Error(error.detail || 'Failed to fetch accounts');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching accounts:', error);
    throw error;
  }
}

/**
 * Get a single account by ID
 */
export async function getAccount(accountId: number): Promise<Account> {
  try {
    const response = await authenticatedFetch(`/api/accounts/${accountId}`);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to fetch account' }));
      throw new Error(error.detail || 'Failed to fetch account');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching account:', error);
    throw error;
  }
}

/**
 * Create a new account
 */
export async function createAccount(accountData: CreateAccountData): Promise<Account> {
  try {
    // Transform camelCase fields to snake_case for backend
    const payload = {
      bank_name: accountData.bankName,
      account_type: accountData.accountType,
      account_number: accountData.accountNumber,
      currency: accountData.currency,
      initial_balance: Number(accountData.initialBalance),
    };
    
    const response = await authenticatedFetch('/api/accounts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to create account' }));
      throw new Error(error.detail || 'Failed to create account');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating account:', error);
    throw error;
  }
}

/**
 * Update an existing account
 */
export async function updateAccount(
  accountId: number,
  accountData: UpdateAccountData
): Promise<Account> {
  try {
    const response = await authenticatedFetch(`/api/accounts/${accountId}`, {
      method: 'PUT',
      body: JSON.stringify(accountData),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to update account' }));
      throw new Error(error.detail || 'Failed to update account');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating account:', error);
    throw error;
  }
}

/**
 * Delete (soft delete) an account
 */
export async function deleteAccount(accountId: number): Promise<void> {
  try {
    const response = await authenticatedFetch(`/api/accounts/${accountId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to delete account' }));
      throw new Error(error.detail || 'Failed to delete account');
    }
  } catch (error) {
    console.error('Error deleting account:', error);
    throw error;
  }
}

/**
 * Transfer money from one account to another (internal or external)
 */
export interface TransferData {
  from_account_id: number;
  to_bank_name?: string;
  to_account_number?: string;
  to_account_id?: number;
  amount: number;
  description?: string;
}

export interface TransferResponse {
  message: string;
  transaction_id?: number;
}

export async function transferMoney(transferData: TransferData): Promise<TransferResponse> {
  try {
    const response = await authenticatedFetch('/api/accounts/transfer', {
      method: 'POST',
      body: JSON.stringify(transferData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to transfer money' }));
      throw new Error(error.detail || 'Failed to transfer money');
    }

    return await response.json();
  } catch (error) {
    console.error('Error transferring money:', error);
    throw error;
  }
}

/**
 * Request payment from another user
 */
export interface PaymentRequestData {
  from_account_id: number;
  amount: number;
  description?: string;
}

export interface PaymentRequestResponse {
  message: string;
  request_id?: number;
}

export async function requestPayment(paymentData: PaymentRequestData): Promise<PaymentRequestResponse> {
  try {
    const response = await authenticatedFetch('/api/accounts/request-payment', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to request payment' }));
      throw new Error(error.detail || 'Failed to request payment');
    }

    return await response.json();
  } catch (error) {
    console.error('Error requesting payment:', error);
    throw error;
  }
}

/**
 * Download account statement in CSV or PDF format
 */
export async function downloadStatement(
  accountId: number,
  format: 'csv' | 'pdf' = 'csv',
  startDate?: string,
  endDate?: string
): Promise<Blob> {
  try {
    const params = new URLSearchParams();
    params.append('format', format);
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    const token = getAuthToken();
    const userId = getUserId();
    const headers: HeadersInit = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Also send user_id as X-User-Id header for fallback authentication
    if (userId) {
      headers['X-User-Id'] = userId;
    }

    const response = await fetch(`/api/accounts/${accountId}/statement?${params.toString()}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorDetail = 'Failed to download statement';
      try {
        const errObj = JSON.parse(errorText);
        errorDetail = errObj.detail || errorText;
      } catch (e) {
        errorDetail = errorText;
      }
      throw new Error(errorDetail);
    }

    return await response.blob();
  } catch (error) {
    console.error('Error downloading statement:', error);
    throw error;
  }
}

export default {
  getAccounts,
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount,
  transferMoney,
  requestPayment,
  downloadStatement,
};
