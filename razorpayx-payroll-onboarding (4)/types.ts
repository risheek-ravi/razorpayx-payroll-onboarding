
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
  paymentMode?: 'NEFT' | 'IMPS' | 'Cash' | 'UPI';
}

export interface ProfessionalDetails {
  designation?: string;
  department?: string;
  dateOfJoining?: string;
  uanPf?: string;
  esicIp?: string;
  aadharNumber?: string;
  panNumber?: string;
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
  shiftId?: string; // Link to a shift
  createdAt: number;
  paymentDetails?: PaymentDetails;
  professionalDetails?: ProfessionalDetails;
}

export interface Shift {
  id: string;
  name: string;
  type: 'fixed' | 'open' | 'rotational';
  startTime: string; // Format "HH:mm AM/PM"
  endTime: string;   // Format "HH:mm AM/PM"
  breakMinutes: number;
}

export interface AttendanceRecord {
  date: string;
  status: 'present' | 'absent' | 'leave' | 'holiday' | 'week_off';
  punchIn?: string;
  punchOut?: string;
  workingMinutes: number;
  overtimeMinutes: number;
}

export interface PayrollAdjustment {
  id: string;
  type: 'addition' | 'deduction';
  label: string;
  amount: number;
}

export interface CalculationStats {
  workingDays?: number;
  totalDays?: number;
  presentShifts?: number;
  totalShifts?: number;
  overtimeHours?: number;
  overtimeAmount?: number;
  pendingAdvance?: number;
  penalties?: number;
  penaltyReason?: string;
  // Daily Worker Stats
  shiftHours?: number;
  payPerDay?: number;
  totalHoursWorked?: number;
  regularHours?: number; // New field for split calculation
  hourlyRate?: number;
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
  calculationStats?: CalculationStats;
}

export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  reason: string;
  type: 'Sick' | 'Casual' | 'Earned';
  status: LeaveStatus;
  appliedOn: number;
}

export type InputName = 'name' | 'businessName' | 'businessEmail';

export type StaffType = 'full_time' | 'contract';
