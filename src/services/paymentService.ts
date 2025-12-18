import {Platform} from 'react-native';
import {Payment, PaymentType, PaymentStatus} from '../types';

// API Base URL Configuration
const getApiBase = () => {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3001/api/v1';
    }
    return 'http://localhost:3001/api/v1';
  }
  return 'https://laudable-sparkle-production-8104.up.railway.app/api/v1';
};

const API_BASE = getApiBase();

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

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  },
};

// ==================== PAYMENT OPERATIONS ====================

/**
 * Creates a new payment record
 */
export const savePayment = async (
  paymentData: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<Payment> => {
  return api.post<Payment>('/payments', paymentData);
};

/**
 * Gets all payments, optionally filtered by businessId, employeeId, type, or status
 */
export const getPayments = async (filters?: {
  businessId?: string;
  employeeId?: string;
  type?: PaymentType;
  status?: PaymentStatus;
}): Promise<Payment[]> => {
  const params = new URLSearchParams();
  if (filters?.businessId) params.append('businessId', filters.businessId);
  if (filters?.employeeId) params.append('employeeId', filters.employeeId);
  if (filters?.type) params.append('type', filters.type);
  if (filters?.status) params.append('status', filters.status);

  const query = params.toString() ? `?${params.toString()}` : '';
  return api.get<Payment[]>(`/payments${query}`);
};

/**
 * Gets a single payment by ID
 */
export const getPaymentById = async (id: string): Promise<Payment> => {
  return api.get<Payment>(`/payments/${id}`);
};

/**
 * Updates an existing payment
 */
export const updatePayment = async (
  id: string,
  updates: Partial<
    Pick<
      Payment,
      'amount' | 'paymentMode' | 'phoneNumber' | 'narration' | 'status' | 'date'
    >
  >,
): Promise<Payment> => {
  return api.patch<Payment>(`/payments/${id}`, updates);
};

/**
 * Deletes a payment
 */
export const deletePayment = async (id: string): Promise<void> => {
  await api.delete<{message: string}>(`/payments/${id}`);
};

/**
 * Gets payment summary for an employee
 */
export const getEmployeePaymentSummary = async (
  employeeId: string,
): Promise<{
  totalPayments: number;
  totalAmount: number;
  byType: {
    'one-time': {count: number; amount: number};
    advance: {count: number; amount: number};
    salary: {count: number; amount: number};
  };
  byStatus: {
    pending: number;
    completed: number;
    failed: number;
  };
}> => {
  return api.get(`/payments/employee/${employeeId}/summary`);
};

