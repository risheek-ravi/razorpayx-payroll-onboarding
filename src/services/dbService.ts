import {Platform} from 'react-native';
import {BusinessDetails, SalaryConfig, StaffType, Employee} from '../types';

// For Android emulator, use 10.0.2.2 to access host machine's localhost
// For iOS simulator, localhost works fine
// For physical devices, use your computer's local IP address (e.g., 192.168.x.x)
const getApiBase = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3001/api/v1';
  }
  return 'http://localhost:3001/api/v1';
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
