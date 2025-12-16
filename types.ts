export interface SalaryConfig {
  calculationMethod: 'calendar_month' | 'fixed_30_days' | 'exclude_weekly_offs';
  shiftHours: {
    hours: number;
    minutes: number;
  };
}

export interface BusinessDetails {
  id: string;
  name: string;
  businessName: string;
  businessEmail: string;
  salaryConfig?: SalaryConfig;
  createdAt: number;
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
  wageType?: 'Monthly' | 'Daily' | 'Per Hour Basis';
  salaryAmount?: string;
  weeklyOffs?: string[];
  createdAt: number;
}

export type InputName = 'name' | 'businessName' | 'businessEmail';

export type StaffType = 'full_time' | 'contract';
