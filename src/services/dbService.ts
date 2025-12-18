import {Platform} from 'react-native';
import {
  BusinessDetails,
  SalaryConfig,
  StaffType,
  Employee,
  Shift,
  ShiftWithStaffCount,
  PayrollUsageType,
} from '../types';

// API Base URL Configuration
// Development: Use localhost (iOS) or 10.0.2.2 (Android emulator)
// Production: Use Railway deployment URL
const getApiBase = () => {
  if (__DEV__) {
    // Development mode - local backend
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3001/api/v1';
    }
    return 'http://localhost:3001/api/v1';
  }

  // Production mode - Railway deployment
  return 'https://laudable-sparkle-production-8104.up.railway.app/api/v1';
};

const API_BASE = getApiBase();
if (__DEV__) {
  // Debug log to verify which base URL is used on device
  console.log(`API_BASE resolved to: ${API_BASE}`);
}

// Generic API helper
const api = {
  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {'Content-Type': 'application/json'},
      ...options,
    });

    const json = await res.json();

    if (!res.ok) {
      throw new Error(json.error || `API Error: ${res.statusText}`);
    }

    return json.data;
  },

  get<T>(endpoint: string) {
    return this.request<T>(endpoint);
  },

  post<T>(endpoint: string, data: unknown) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  patch<T>(endpoint: string, data: unknown) {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};

/**
 * Creates a new business record
 */
export const saveBusinessDetails = async (
  details: Omit<BusinessDetails, 'id' | 'createdAt' | 'salaryConfig'>,
): Promise<BusinessDetails> => {
  return api.post<BusinessDetails>('/businesses', details);
};

/**
 * Updates an existing business record with salary configuration
 */
export const updateBusinessSalaryConfig = async (
  id: string,
  config: SalaryConfig,
): Promise<void> => {
  await api.patch(`/businesses/${id}/salary-config`, config);
};

/**
 * Gets the most recently created business
 */
export const getLatestBusinessDetails =
  async (): Promise<BusinessDetails | null> => {
    return api.get<BusinessDetails | null>('/businesses/latest/one');
  };

/**
 * Logs staff type selection (analytics event)
 */
export const logStaffSelection = async (type: StaffType): Promise<void> => {
  // In a real app, this would go to an analytics service
  console.log(`[Analytics] User selected staff type: ${type}`);
};

/**
 * Creates a new employee record
 */
export const saveEmployee = async (
  employeeData: Omit<Employee, 'id' | 'createdAt'>,
): Promise<Employee> => {
  return api.post<Employee>('/employees', employeeData);
};

/**
 * Gets all employees, optionally filtered by businessId
 */
export const getEmployees = async (
  businessId?: string,
): Promise<Employee[]> => {
  const query = businessId ? `?businessId=${businessId}` : '';
  return api.get<Employee[]>(`/employees${query}`);
};

/**
 * Updates an existing employee record
 */
export const updateEmployee = async (employee: Employee): Promise<Employee> => {
  return api.patch<Employee>(`/employees/${employee.id}`, employee);
};

/**
 * Updates the payroll usage type preference for a business
 */
export const updatePayrollUsage = async (
  id: string,
  usageType: PayrollUsageType,
): Promise<void> => {
  await api.patch(`/businesses/${id}/usage-type`, {
    payrollUsageType: usageType,
  });
};

// ==================== SHIFT OPERATIONS ====================

/**
 * Gets all shifts with staff count
 */
export const getShifts = async (): Promise<ShiftWithStaffCount[]> => {
  return api.get<ShiftWithStaffCount[]>('/shifts');
};

/**
 * Creates a new shift record
 */
export const saveShift = async (
  shiftData: Omit<Shift, 'id' | 'createdAt'>,
): Promise<Shift> => {
  return api.post<Shift>('/shifts', shiftData);
};

/**
 * Updates an existing shift
 */
export const updateShift = async (shiftData: Shift): Promise<Shift> => {
  return api.patch<Shift>(`/shifts/${shiftData.id}`, shiftData);
};

/**
 * Assigns a shift to multiple employees
 */
export const assignShiftToEmployees = async (
  shiftId: string,
  employeeIds: string[],
): Promise<void> => {
  await api.post(`/shifts/${shiftId}/assign`, {employeeIds});
};

/**
 * Updates shift assignment (replaces all assignments)
 */
export const updateShiftAssignment = async (
  shiftId: string,
  employeeIds: string[],
): Promise<void> => {
  await api.patch(`/shifts/${shiftId}/assign`, {employeeIds});
};

// ==================== RAZORPAY PAYOUT OPERATIONS ====================

interface RazorpayPayoutRequest {
  account_number: string;
  amount: number;
  currency: string;
  mode: 'UPI' | 'NEFT' | 'RTGS' | 'IMPS';
  purpose: string;
  fund_account: {
    account_type: 'bank_account' | 'vpa' | 'mobile';
    bank_account?: {
      name: string;
      ifsc: string;
      account_number: string;
    };
    vpa?: {
      address: string;
    };
    mobile?: {
      number: string;
      account_holder_name: string;
    };
    contact: {
      name: string;
      email?: string;
      contact: string;
      type: 'self' | 'employee' | 'vendor' | 'customer';
      reference_id?: string;
      notes?: Record<string, string>;
    };
  };
  queue_if_low_balance?: boolean;
  reference_id?: string;
  narration?: string;
  notes?: Record<string, string>;
}

interface RazorpayPayoutResponse {
  id: string;
  entity: string;
  fund_account_id: string;
  amount: number;
  currency: string;
  notes: Record<string, string>;
  fees: number;
  tax: number;
  status: string;
  purpose: string;
  utr: string | null;
  mode: string;
  reference_id: string;
  narration: string;
  batch_id: string | null;
  failure_reason: string | null;
  created_at: number;
}

/**
 * Base64 encoding for React Native
 * btoa is not available in React Native, so we use a polyfill
 */
const base64Encode = (str: string): string => {
  // Use Buffer if available (Node.js environment)
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'utf-8').toString('base64');
  }

  // Fallback for React Native
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let result = '';
  let i = 0;

  while (i < str.length) {
    const a = str.charCodeAt(i++);
    const b = i < str.length ? str.charCodeAt(i++) : Number.NaN;
    const c = i < str.length ? str.charCodeAt(i++) : Number.NaN;

    // eslint-disable-next-line no-bitwise
    const bitmap = (a << 16) | (b << 8) | c;

    // eslint-disable-next-line no-bitwise
    result += chars.charAt((bitmap >> 18) & 63);
    // eslint-disable-next-line no-bitwise
    result += chars.charAt((bitmap >> 12) & 63);
    // eslint-disable-next-line no-bitwise
    result += isNaN(b) ? '=' : chars.charAt((bitmap >> 6) & 63);
    // eslint-disable-next-line no-bitwise
    result += isNaN(c) ? '=' : chars.charAt(bitmap & 63);
  }

  return result;
};

/**
 * Creates a Razorpay payout
 * @param apiKey - Razorpay API Key (e.g., rzp_live_Rsfw3YyUA3HgRo)
 * @param apiSecret - Razorpay API Secret
 * @param payoutData - Payout request data
 * @returns Payout response from Razorpay
 */
export const createRazorpayPayout = async (
  apiKey: string,
  apiSecret: string,
  payoutData: RazorpayPayoutRequest,
): Promise<RazorpayPayoutResponse> => {
  const credentials = `${apiKey}:${apiSecret}`;
  const encodedCredentials = base64Encode(credentials);

  // Generate a unique idempotency key
  const idempotencyKey = `${Date.now()}-${Math.random()
    .toString(36)
    .substring(7)}`;

  const response = await fetch('https://api.razorpay.com/v1/payouts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${encodedCredentials}`,
      'X-Payout-Idempotency': idempotencyKey,
    },
    body: JSON.stringify(payoutData),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(
      json.error?.description || `Razorpay API Error: ${response.statusText}`,
    );
  }

  return json;
};

/**
 * Helper function to create a UPI payout
 */
export const createUPIPayout = async (
  apiKey: string,
  apiSecret: string,
  params: {
    accountNumber: string;
    amount: number;
    upiId: string;
    accountHolderName: string;
    contactName: string;
    contactEmail?: string;
    contactPhone: string;
    referenceId?: string;
    narration?: string;
    notes?: Record<string, string>;
  },
): Promise<RazorpayPayoutResponse> => {
  const payoutData: RazorpayPayoutRequest = {
    account_number: params.accountNumber,
    amount: params.amount * 100, // Convert to paise
    currency: 'INR',
    mode: 'UPI',
    purpose: 'salary',
    fund_account: {
      account_type: 'vpa',
      vpa: {
        address: params.upiId,
      },
      contact: {
        name: params.contactName,
        email: params.contactEmail,
        contact: params.contactPhone,
        type: 'employee',
        reference_id: params.referenceId,
        notes: params.notes,
      },
    },
    queue_if_low_balance: true,
    reference_id: params.referenceId,
    narration: params.narration || 'Salary Payment',
    notes: params.notes,
  };

  return createRazorpayPayout(apiKey, apiSecret, payoutData);
};

/**
 * Helper function to create a Bank Transfer payout
 */
export const createBankPayout = async (
  apiKey: string,
  apiSecret: string,
  params: {
    accountNumber: string;
    amount: number;
    beneficiaryName: string;
    beneficiaryAccountNumber: string;
    ifscCode: string;
    contactName: string;
    contactEmail?: string;
    contactPhone: string;
    mode?: 'NEFT' | 'RTGS' | 'IMPS';
    referenceId?: string;
    narration?: string;
    notes?: Record<string, string>;
  },
): Promise<RazorpayPayoutResponse> => {
  const payoutData: RazorpayPayoutRequest = {
    account_number: params.accountNumber,
    amount: params.amount * 100, // Convert to paise
    currency: 'INR',
    mode: params.mode || 'IMPS',
    purpose: 'salary',
    fund_account: {
      account_type: 'bank_account',
      bank_account: {
        name: params.beneficiaryName,
        ifsc: params.ifscCode,
        account_number: params.beneficiaryAccountNumber,
      },
      contact: {
        name: params.contactName,
        email: params.contactEmail,
        contact: params.contactPhone,
        type: 'employee',
        reference_id: params.referenceId,
        notes: params.notes,
      },
    },
    queue_if_low_balance: true,
    reference_id: params.referenceId,
    narration: params.narration || 'Salary Payment',
    notes: params.notes,
  };

  return createRazorpayPayout(apiKey, apiSecret, payoutData);
};
