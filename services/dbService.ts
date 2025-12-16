import {BusinessDetails, SalaryConfig, StaffType, Employee} from '../types';

const API_BASE = 'http://localhost:3001/api/v1';

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
  return api.post('/businesses', details).then(data => data as BusinessDetails);
};

/**
 * Updates an existing business record with salary configuration
 */
export const updateBusinessSalaryConfig = async (
  id: string,
  config: SalaryConfig,
): Promise<void> => {
  await api
    .patch(`/businesses/${id}/salary-config`, config)
    .then(data => data as void);
};

/**
 * Gets the most recently created business
 */
export const getLatestBusinessDetails =
  async (): Promise<BusinessDetails | null> => {
    return api
      .get('/businesses/latest/one')
      .then(data => data as BusinessDetails | null);
  };

/**
 * Logs staff type selection (analytics event)
 */
export const logStaffSelection = async (type: StaffType): Promise<void> => {
  // In a real app, this would go to an analytics service
  console.log(`[Analytics] User selected staff type: ${type}`);
  await new Promise(resolve => setTimeout(resolve, 100));
};

/**
 * Creates a new employee record
 */
export const saveEmployee = async (
  employeeData: Omit<Employee, 'id' | 'createdAt'>,
): Promise<Employee> => {
  return api.post('/employees', employeeData).then(data => data as Employee);
};

/**
 * Gets all employees, optionally filtered by businessId
 */
export const getEmployees = async (
  businessId?: string,
): Promise<Employee[]> => {
  const query = businessId ? `?businessId=${businessId}` : '';
  return api.get(`/employees${query}`).then(data => data as Employee[]);
};
