import type Reactotron from 'reactotron-react-native';

// Extend console to include Reactotron
declare global {
  interface Console {
    tron?: typeof Reactotron;
  }
}

export interface SalaryConfig {
  calculationMethod: 'calendar_month' | 'fixed_30_days' | 'exclude_weekly_offs';
  shiftHours: {
    hours: number;
    minutes: number;
  };
}

export type PayrollUsageType = 'calculate_only' | 'calculate_and_pay';

export interface BusinessDetails {
  id: string;
  name: string;
  businessName: string;
  businessEmail: string;
  salaryConfig?: SalaryConfig;
  payrollUsageType?: PayrollUsageType;
  createdAt: number;
}

export interface PaymentDetails {
  upiId?: string;
  accountHolderName?: string;
  ifsc?: string;
  accountNumber?: string;
  paymentMode?: 'NEFT' | 'IMPS';
}

export interface ProfessionalDetails {
  designation?: string;
  department?: string;
  dateOfJoining?: string;
  pfNumber?: string;
}

export interface Employee {
  id: string;
  businessId: string;
  type: StaffType;
  fullName: string;
  companyId: string;
  phoneNumber: string;
  dob: string;
  gender: string;
  salaryCycleDate: number;
  salaryAccess: string;
  wageType?: 'Monthly' | 'Daily' | 'Hourly';
  salaryAmount?: string;
  weeklyOffs?: string[];
  shiftId?: string;
  createdAt: number;
  paymentDetails?: PaymentDetails;
  professionalDetails?: ProfessionalDetails;
}

export type ShiftType = 'fixed' | 'open' | 'rotational';

export interface Shift {
  id: string;
  name: string;
  type: ShiftType;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  createdAt?: number;
}

export interface ShiftWithStaffCount extends Shift {
  staffCount: number;
}

export interface PayrollAdjustment {
  id: string;
  type: 'addition' | 'deduction';
  label: string;
  amount: number;
}

export interface PayrollEntry {
  employeeId: string;
  employeeName: string;
  wageType: 'Monthly' | 'Daily' | 'Hourly';
  baseAmount: number;
  adjustments: PayrollAdjustment[];
  netPay: number;
  paymentMode: 'UPI' | 'Bank' | 'Cash';
  status: 'pending' | 'ready' | 'missing_details';
}

export type PaymentType = 'one-time' | 'advance' | 'salary';
export type PaymentStatus = 'pending' | 'completed' | 'failed';

export interface Payment {
  id: string;
  type: PaymentType;
  amount: number;
  paymentMode: 'Cash' | 'UPI' | 'Bank Transfer';
  phoneNumber?: string;
  narration?: string;
  status: PaymentStatus;
  date: string;
  employeeId: string;
  businessId: string;
  createdAt: number;
  updatedAt: number;
}

export type InputName = 'name' | 'businessName' | 'businessEmail';

export type StaffType = 'full_time' | 'contract';

// Navigation types
export type RootStackParamList = {
  BusinessDetails: undefined;
  SalaryCalculation: undefined;
  UsageSelection: {
    adminName: string;
    businessId: string;
  };
  Dashboard: {
    businessName: string;
    businessId: string;
  };
  AddStaff: {
    staffType: StaffType;
    businessId: string;
  };
  AddSalary: {
    staffData: Partial<Employee>;
  };
  AddGeneralInfo: {
    staffData: Partial<Employee>;
  };
  ShiftList: undefined;
  AddFixedShift: {
    editingShift?: Shift;
  };
  AssignShift: {
    shiftData: Omit<Shift, 'id'> | Shift;
    existingShiftId?: string;
  };
  StaffProfile: {
    employee: Employee;
  };
  FinalizePayroll: undefined;
  LoadWallet: undefined;
};
