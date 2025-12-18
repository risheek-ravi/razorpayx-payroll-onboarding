
import { BusinessDetails, SalaryConfig, StaffType, Employee, Shift, PayrollEntry, PayrollUsageType, LeaveRequest, LeaveStatus, PayrollAdjustment, CalculationStats, AttendanceRecord } from '../types';

// Versioning keys to force data refresh
const DB_KEY = 'razorpayx_payroll_db_v3';
const STAFF_DB_KEY = 'razorpayx_payroll_staff_db_v3';
const SHIFT_DB_KEY = 'razorpayx_payroll_shift_db_v3';
const LEAVE_DB_KEY = 'razorpayx_payroll_leave_db_v3';
const ADVANCE_DB_KEY = 'razorpayx_payroll_advance_db_v3';

interface ApprovedAdvance {
  id: string;
  employeeId: string;
  amount: number;
  date: string;
  reason: string;
  status: 'open' | 'deducted';
}

// --- CONFIGURATION CONSTANTS ---
const BUFFER_MINUTES = 15; // Grace period for Full Day
const MIN_OT_MINUTES = 60; // Minimum minutes to qualify for 1 hour OT
const OT_MULTIPLIER = 1.5; // Overtime rate (1.5x)

// --- HELPER: TIME MATH ---

const parseTime = (timeStr: string): number => {
  if (!timeStr) return 0;
  // Format: "09:00 AM" or "06:30 PM"
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);

  if (hours === 12 && modifier === 'AM') hours = 0;
  if (modifier === 'PM' && hours !== 12) hours += 12;

  return hours * 60 + minutes; // Returns total minutes from midnight
};

const formatMinutesToHours = (totalMinutes: number): string => {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

// --- HELPER: ATTENDANCE GENERATOR ---
// Generates deterministic "Real" attendance logs for the last 30 days
export const getAttendanceHistory = (employee: Employee, shift?: Shift): AttendanceRecord[] => {
  const history: AttendanceRecord[] = [];
  const today = new Date(); 
  
  // Parse Shift details
  const shiftStartMins = shift ? parseTime(shift.startTime) : 540; // Default 9 AM
  const shiftEndMins = shift ? parseTime(shift.endTime) : 1080; // Default 6 PM
  let shiftDurationMins = shiftEndMins - shiftStartMins;
  if (shiftDurationMins < 0) shiftDurationMins += 1440; // Overnight shift
  const breakMins = shift?.breakMinutes || 60;
  const effectiveShiftMins = shiftDurationMins - breakMins; // Net working minutes expected

  // Generate 30 days back
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const dayOfWeek = date.getDay(); // 0 = Sun, 6 = Sat

    // 1. Weekly Offs Check
    const isSunday = dayOfWeek === 0;
    const isSaturday = dayOfWeek === 6;
    let isWeeklyOff = false;
    
    if (employee.weeklyOffs?.includes('Sunday') && isSunday) isWeeklyOff = true;
    if (employee.weeklyOffs?.includes('Saturday') && isSaturday) isWeeklyOff = true;

    if (isWeeklyOff) {
      history.push({ date: dateStr, status: 'week_off', workingMinutes: 0, overtimeMinutes: 0 });
      continue;
    }

    // 2. Deterministic Attendance Behavior
    let seed = employee.id.charCodeAt(0) + employee.id.charCodeAt(employee.id.length - 1) + i;
    const rand = seed % 100;

    // 5% Absent, 5% Leave, 90% Present
    if (rand < 5) {
      history.push({ date: dateStr, status: 'absent', workingMinutes: 0, overtimeMinutes: 0 });
    } else if (rand < 10) {
      history.push({ date: dateStr, status: 'leave', workingMinutes: 0, overtimeMinutes: 0 });
    } else {
      // PRESENT SCENARIOS
      let varianceIn = 0;
      let varianceOut = 0;
      const scenario = seed % 10; 

      if (scenario < 4) {
         // A. Normal Day (Within Buffer)
         varianceIn = (seed % 15) - 5; 
         varianceOut = (seed % 10) - 5;
      } else if (scenario < 7) {
         // B. Undertime (Late or Early leave)
         if (seed % 2 === 0) varianceIn = 45;
         else varianceOut = -45;
      } else if (scenario < 8) {
         // C. Small Overtime (e.g. 45 mins extra)
         varianceOut = 45; 
      } else {
         // D. Big Overtime (e.g. 90 mins extra)
         varianceOut = 90;
      }

      const actualIn = shiftStartMins + varianceIn;
      const actualOut = shiftEndMins + varianceOut;

      // Calculate Worked Minutes
      let dailyWorkedMins = actualOut - actualIn - breakMins;
      if (dailyWorkedMins < 0) dailyWorkedMins = 0;

      // Calculate Overtime (Raw)
      let dailyOvertime = Math.max(0, dailyWorkedMins - effectiveShiftMins);

      const inH = Math.floor(actualIn / 60);
      const inM = actualIn % 60;
      const outH = Math.floor(actualOut / 60);
      const outM = actualOut % 60;
      
      const formatTimeStr = (h: number, m: number) => {
         const period = h >= 12 ? 'PM' : 'AM';
         const dh = h > 12 ? h - 12 : (h === 0 ? 12 : h);
         return `${dh.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`;
      }

      history.push({
        date: dateStr,
        status: 'present',
        punchIn: formatTimeStr(inH, inM),
        punchOut: formatTimeStr(outH, outM),
        workingMinutes: dailyWorkedMins,
        overtimeMinutes: dailyOvertime
      });
    }
  }

  return history;
};

// --- DATA ACCESS ---

export const saveBusinessDetails = async (details: Omit<BusinessDetails, 'id' | 'createdAt' | 'salaryConfig' | 'payrollUsageType'>): Promise<BusinessDetails> => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  const newRecord: BusinessDetails = {
    ...details,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    payrollUsageType: 'calculate_and_pay' 
  };
  try {
    const existingDataStr = localStorage.getItem(DB_KEY);
    const existingData: BusinessDetails[] = existingDataStr ? JSON.parse(existingDataStr) : [];
    existingData.push(newRecord);
    localStorage.setItem(DB_KEY, JSON.stringify(existingData));
    return newRecord;
  } catch (error) { throw new Error("Failed to save data."); }
};

export const updateBusinessSalaryConfig = async (id: string, config: SalaryConfig): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  try {
    const existingDataStr = localStorage.getItem(DB_KEY);
    const existingData: BusinessDetails[] = existingDataStr ? JSON.parse(existingDataStr) : [];
    const index = existingData.findIndex(item => item.id === id);
    if (index !== -1) {
      existingData[index] = { ...existingData[index], salaryConfig: config };
      localStorage.setItem(DB_KEY, JSON.stringify(existingData));
    }
  } catch (error) { throw new Error("Failed to update data."); }
};

export const updatePayrollUsage = async (id: string, usageType: PayrollUsageType): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 400));
  try {
    const existingDataStr = localStorage.getItem(DB_KEY);
    const existingData: BusinessDetails[] = existingDataStr ? JSON.parse(existingDataStr) : [];
    const index = existingData.findIndex(item => item.id === id);
    if (index !== -1) {
      existingData[index] = { ...existingData[index], payrollUsageType: usageType };
      localStorage.setItem(DB_KEY, JSON.stringify(existingData));
    }
  } catch (error) { throw new Error("Failed to update usage preference."); }
};

export const getLatestBusinessDetails = (): BusinessDetails | null => {
  const existingDataStr = localStorage.getItem(DB_KEY);
  if (!existingDataStr) return null;
  const data: BusinessDetails[] = JSON.parse(existingDataStr);
  return data.length > 0 ? data[data.length - 1] : null;
};

export const logStaffSelection = async (type: StaffType): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
};

export const saveEmployee = async (employeeData: Omit<Employee, 'id' | 'createdAt'>): Promise<Employee> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const newEmployee: Employee = {
    ...employeeData,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };
  try {
    const existingDataStr = localStorage.getItem(STAFF_DB_KEY);
    const existingData: Employee[] = existingDataStr ? JSON.parse(existingDataStr) : [];
    existingData.push(newEmployee);
    localStorage.setItem(STAFF_DB_KEY, JSON.stringify(existingData));
    return newEmployee;
  } catch (error) { throw new Error("Failed to save employee."); }
};

export const updateEmployee = async (employee: Employee): Promise<Employee> => {
  await new Promise((resolve) => setTimeout(resolve, 600));
  try {
    const existingDataStr = localStorage.getItem(STAFF_DB_KEY);
    let existingData: Employee[] = existingDataStr ? JSON.parse(existingDataStr) : [];
    const index = existingData.findIndex(e => e.id === employee.id);
    if (index !== -1) {
      existingData[index] = employee;
      localStorage.setItem(STAFF_DB_KEY, JSON.stringify(existingData));
      return employee;
    } else { throw new Error("Employee not found"); }
  } catch (error) { throw new Error("Failed to update employee."); }
};

export const getEmployees = async (): Promise<Employee[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const existingDataStr = localStorage.getItem(STAFF_DB_KEY);
  return existingDataStr ? JSON.parse(existingDataStr) : [];
};

export const getShifts = async (): Promise<(Shift & { staffCount: number })[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const existingShiftsStr = localStorage.getItem(SHIFT_DB_KEY);
  const shifts: Shift[] = existingShiftsStr ? JSON.parse(existingShiftsStr) : [];
  const existingStaffStr = localStorage.getItem(STAFF_DB_KEY);
  const staff: Employee[] = existingStaffStr ? JSON.parse(existingStaffStr) : [];
  return shifts.map(shift => ({
    ...shift,
    staffCount: staff.filter(e => e.shiftId === shift.id).length
  }));
};

export const saveShift = async (shift: Omit<Shift, 'id'>): Promise<Shift> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const newShift: Shift = { ...shift, id: crypto.randomUUID() };
  const existingDataStr = localStorage.getItem(SHIFT_DB_KEY);
  const existingData: Shift[] = existingDataStr ? JSON.parse(existingDataStr) : [];
  existingData.push(newShift);
  localStorage.setItem(SHIFT_DB_KEY, JSON.stringify(existingData));
  return newShift;
};

export const updateShift = async (shift: Shift): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const existingDataStr = localStorage.getItem(SHIFT_DB_KEY);
  let existingData: Shift[] = existingDataStr ? JSON.parse(existingDataStr) : [];
  existingData = existingData.map(s => s.id === shift.id ? shift : s);
  localStorage.setItem(SHIFT_DB_KEY, JSON.stringify(existingData));
};

export const assignShiftToEmployees = async (shiftId: string, employeeIds: string[]): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 600));
  const existingDataStr = localStorage.getItem(STAFF_DB_KEY);
  let allEmployees: Employee[] = existingDataStr ? JSON.parse(existingDataStr) : [];
  allEmployees = allEmployees.map(emp => {
    if (employeeIds.includes(emp.id)) { return { ...emp, shiftId: shiftId }; }
    return emp;
  });
  localStorage.setItem(STAFF_DB_KEY, JSON.stringify(allEmployees));
};

export const updateShiftAssignment = async (shiftId: string, employeeIds: string[]): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 600));
  const existingDataStr = localStorage.getItem(STAFF_DB_KEY);
  let allEmployees: Employee[] = existingDataStr ? JSON.parse(existingDataStr) : [];
  allEmployees = allEmployees.map(emp => {
    if (employeeIds.includes(emp.id)) { return { ...emp, shiftId: shiftId }; }
    if (emp.shiftId === shiftId && !employeeIds.includes(emp.id)) { return { ...emp, shiftId: undefined }; }
    return emp;
  });
  localStorage.setItem(STAFF_DB_KEY, JSON.stringify(allEmployees));
};

// --- ADVANCE MANAGEMENT ---
export const saveApprovedAdvance = async (employeeId: string, amount: number, reason: string) => {
   const existingDataStr = localStorage.getItem(ADVANCE_DB_KEY);
   const existingData: ApprovedAdvance[] = existingDataStr ? JSON.parse(existingDataStr) : [];
   const newAdvance: ApprovedAdvance = {
      id: crypto.randomUUID(),
      employeeId,
      amount,
      reason,
      date: new Date().toLocaleDateString(),
      status: 'open'
   };
   existingData.push(newAdvance);
   localStorage.setItem(ADVANCE_DB_KEY, JSON.stringify(existingData));
   return newAdvance;
};

// --- LEAVE MANAGEMENT ---
export const getLeaveRequests = async (employeeId: string): Promise<LeaveRequest[]> => {
  await new Promise((resolve) => setTimeout(resolve, 400));
  const existingDataStr = localStorage.getItem(LEAVE_DB_KEY);
  const allLeaves: LeaveRequest[] = existingDataStr ? JSON.parse(existingDataStr) : [];
  return allLeaves.filter(l => l.employeeId === employeeId).sort((a, b) => b.appliedOn - a.appliedOn);
};

export const updateLeaveStatus = async (leaveId: string, status: LeaveStatus): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 400));
  const existingDataStr = localStorage.getItem(LEAVE_DB_KEY);
  let allLeaves: LeaveRequest[] = existingDataStr ? JSON.parse(existingDataStr) : [];
  const index = allLeaves.findIndex(l => l.id === leaveId);
  if (index !== -1) {
    allLeaves[index].status = status;
    localStorage.setItem(LEAVE_DB_KEY, JSON.stringify(allLeaves));
  }
};

/**
 * CORE PAYROLL CALCULATION LOGIC
 * - Separates Regular vs OT
 * - Daily Wage = 1 Day (Today)
 * - Monthly Wage = 30 Days (History)
 * - OT Rate = 1.5x
 */
export const generatePayrollDraft = async (): Promise<PayrollEntry[]> => {
  const employees = await getEmployees();
  const shifts = await getShifts();
  
  const existingAdvanceStr = localStorage.getItem(ADVANCE_DB_KEY);
  const advances: ApprovedAdvance[] = existingAdvanceStr ? JSON.parse(existingAdvanceStr) : [];
  
  // Daily logic: We assume "Today" for daily calculation context
  const standardDaysInMonth = 30; 

  return employees.map((emp) => {
    // 1. Get Shift Configuration
    const shift = shifts.find(s => s.id === emp.shiftId);
    let shiftDurationHours = 9; 
    let shiftDurationMins = 540;
    
    if (shift) {
       const start = parseTime(shift.startTime);
       const end = parseTime(shift.endTime);
       let duration = end - start;
       if (duration < 0) duration += 1440;
       duration -= (shift.breakMinutes || 0); 
       
       shiftDurationMins = duration;
       shiftDurationHours = Math.round((duration / 60) * 100) / 100;
    }

    // 2. Fetch Attendance History
    const fullHistory = getAttendanceHistory(emp, shift);

    // 3. Determine records to process
    // If Daily/Hourly wage: only process TODAY (Index 0).
    // If Monthly wage: process FULL history.
    const isDaily = emp.wageType === 'Daily' || emp.wageType === 'Hourly';
    const recordsToProcess = isDaily ? [fullHistory[0]] : fullHistory;

    // 4. Aggregate Stats
    let presentDays = 0; // For Monthly
    let totalRegularMinutes = 0; // For Daily: Minutes paid at 1x
    let totalOtHours = 0;        // For Daily/Monthly: Hours paid at 1.5x

    recordsToProcess.forEach(record => {
       if (record.status === 'present') {
          // Monthly Logic: Buffer counting
          if (record.workingMinutes >= (shiftDurationMins - BUFFER_MINUTES)) {
             presentDays += 1;
          } else if (record.workingMinutes >= (shiftDurationMins / 2)) {
             presentDays += 0.5;
          }

          // Daily Logic: Strict Minute Counting + Separate OT
          let dailyOtHours = 0;
          if (record.overtimeMinutes >= MIN_OT_MINUTES) {
             dailyOtHours = Math.floor(record.overtimeMinutes / 60);
          }
          
          // Regular minutes excludes completed OT hours to avoid double pay
          const otMinutesConsumed = dailyOtHours * 60;
          const regularMinutes = Math.max(0, record.workingMinutes - otMinutesConsumed);
          
          totalRegularMinutes += regularMinutes;
          totalOtHours += dailyOtHours;
       }
    });

    // 5. Calculate Hourly Rates & Base Pay
    const rawSalary = Number(emp.salaryAmount) || 0;
    let hourlyRate = 0;
    let basePay = 0;
    let overtimePay = 0;
    
    // Stats for UI
    const stats: CalculationStats = {
      totalDays: isDaily ? 1 : standardDaysInMonth,
      shiftHours: shiftDurationHours,
      overtimeHours: totalOtHours,
      totalHoursWorked: Math.round(((totalRegularMinutes + (totalOtHours * 60)) / 60) * 10) / 10,
    };

    if (emp.wageType === 'Monthly') {
       hourlyRate = rawSalary / standardDaysInMonth / shiftDurationHours;
       const perDayPay = rawSalary / standardDaysInMonth;
       basePay = Math.round(perDayPay * presentDays);
       
       stats.workingDays = presentDays;
       stats.payPerDay = Math.round(perDayPay);
       stats.hourlyRate = Math.round(hourlyRate);

    } else if (emp.wageType === 'Daily') {
       hourlyRate = rawSalary / shiftDurationHours;
       
       // Base Pay = Regular Minutes * Hourly Rate
       basePay = Math.round((totalRegularMinutes / 60) * hourlyRate);

       stats.presentShifts = recordsToProcess.filter(r => r.status === 'present').length;
       stats.totalShifts = recordsToProcess.length; 
       stats.payPerDay = rawSalary;
       stats.hourlyRate = Math.round(hourlyRate);
       stats.regularHours = Math.round((totalRegularMinutes / 60) * 10) / 10;
    } else {
       basePay = rawSalary;
    }

    // 6. Calculate Overtime (1.5x Rate for completed hours)
    overtimePay = Math.round(totalOtHours * hourlyRate * OT_MULTIPLIER);
    stats.overtimeAmount = overtimePay;

    // 7. Adjustments
    const adjustments: PayrollAdjustment[] = [];

    if (overtimePay > 0) {
        adjustments.push({
            id: 'auto-overtime',
            type: 'addition',
            label: `Overtime (${stats.overtimeHours} hrs)`,
            amount: overtimePay
        });
    }

    const empAdvances = advances.filter(a => a.employeeId === emp.id && a.status === 'open');
    const totalAdvanceDeduction = empAdvances.reduce((sum, a) => sum + a.amount, 0);
    stats.pendingAdvance = totalAdvanceDeduction;

    if (totalAdvanceDeduction > 0) {
       adjustments.push({
          id: 'auto-advance-deduction',
          type: 'deduction',
          label: 'Less Advance',
          amount: totalAdvanceDeduction
       });
    }

    const totalAdditions = adjustments.filter(a => a.type === 'addition').reduce((s, a) => s + a.amount, 0);
    const totalDeductions = adjustments.filter(a => a.type === 'deduction').reduce((s, a) => s + a.amount, 0);
    const netPay = Math.max(0, basePay + totalAdditions - totalDeductions);

    // Payment Mode Check
    const hasUPI = !!emp.paymentDetails?.upiId;
    const hasBank = !!emp.paymentDetails?.accountNumber;
    const isCash = emp.paymentDetails?.paymentMode === 'Cash';

    let paymentMode: 'UPI' | 'Bank' | 'Cash' = 'Cash';
    if (isCash) paymentMode = 'Cash';
    else if (hasUPI) paymentMode = 'UPI';
    else if (hasBank) paymentMode = 'Bank';

    return {
      employeeId: emp.id,
      employeeName: emp.fullName,
      wageType: emp.wageType || 'Monthly',
      baseAmount: basePay,
      adjustments: adjustments,
      netPay: netPay,
      paymentMode: paymentMode,
      status: (hasUPI || hasBank || isCash) ? 'ready' : 'missing_details',
      calculationStats: stats
    };
  });
};

export const seedDatabase = (): boolean => {
  if (localStorage.getItem(DB_KEY)) {
    return false; // Already seeded
  }
  // ... (Keeping seed logic same)
  // 1. Business
  const businessId = crypto.randomUUID();
  const business: BusinessDetails = {
    id: businessId,
    name: 'Amit Sharma',
    businessName: 'TechFlow Solutions',
    businessEmail: 'amit.sharma@techflow.com',
    createdAt: Date.now(),
    payrollUsageType: 'calculate_and_pay',
    salaryConfig: {
      calculationMethod: 'calendar_month', // Requirement 1
      shiftHours: { hours: 9, minutes: 0 }
    }
  };
  localStorage.setItem(DB_KEY, JSON.stringify([business]));

  // 2. Shifts
  const shift1Id = crypto.randomUUID();
  const shift2Id = crypto.randomUUID();
  
  const shifts: Shift[] = [
    { id: shift1Id, name: 'General Shift', type: 'fixed', startTime: '09:00 AM', endTime: '06:00 PM', breakMinutes: 60 },
    { id: shift2Id, name: 'Morning Ops', type: 'fixed', startTime: '06:00 AM', endTime: '02:00 PM', breakMinutes: 30 },
  ];
  localStorage.setItem(SHIFT_DB_KEY, JSON.stringify(shifts));

  // 3. Employees
  const emp1Id = crypto.randomUUID();
  const employees: Employee[] = [
    {
      id: emp1Id,
      businessId,
      type: 'contract',
      fullName: 'Aarav Sharma',
      companyId: 'TF001',
      phoneNumber: '9876543210',
      dob: '1990-05-15',
      gender: 'Male',
      salaryCycleDate: 1,
      salaryAccess: 'Allow till previous cycle',
      wageType: 'Monthly',
      salaryAmount: '50000',
      shiftId: shift1Id,
      weeklyOffs: ['Sunday', 'Saturday'],
      createdAt: Date.now(),
      paymentDetails: { upiId: 'aarav@upi', paymentMode: 'UPI' }
    },
    {
      id: crypto.randomUUID(),
      businessId,
      type: 'contract',
      fullName: 'Priya Patel',
      companyId: 'TF002',
      phoneNumber: '9876543211',
      dob: '1992-08-20',
      gender: 'Female',
      salaryCycleDate: 1,
      salaryAccess: 'Allow till previous cycle',
      wageType: 'Monthly',
      salaryAmount: '45000',
      shiftId: shift1Id,
      weeklyOffs: ['Sunday'],
      createdAt: Date.now(),
      paymentDetails: { accountNumber: '1234567890', ifsc: 'HDFC0001234', accountHolderName: 'Priya Patel', paymentMode: 'NEFT' }
    },
    {
      id: crypto.randomUUID(),
      businessId,
      type: 'contract',
      fullName: 'Rohan Gupta',
      companyId: 'TF003',
      phoneNumber: '9876543212',
      dob: '1995-02-10',
      gender: 'Male',
      salaryCycleDate: 1,
      salaryAccess: 'Disable access',
      wageType: 'Daily',
      salaryAmount: '800',
      shiftId: shift2Id,
      weeklyOffs: ['Sunday'],
      createdAt: Date.now(),
      paymentDetails: { paymentMode: 'Cash' }
    },
    {
      id: crypto.randomUUID(),
      businessId,
      type: 'full_time',
      fullName: 'Ananya Reddy',
      companyId: 'TF004',
      phoneNumber: '9876543213',
      dob: '1994-11-25',
      gender: 'Female',
      salaryCycleDate: 1,
      salaryAccess: 'Allow till previous cycle',
      wageType: 'Monthly',
      salaryAmount: '60000',
      shiftId: shift1Id,
      weeklyOffs: ['Sunday', 'Saturday'],
      createdAt: Date.now(),
      paymentDetails: { upiId: 'ananya@upi', paymentMode: 'UPI' }
    },
    {
      id: crypto.randomUUID(),
      businessId,
      type: 'contract',
      fullName: 'Vikram Singh',
      companyId: 'TF005',
      phoneNumber: '9876543214',
      dob: '1988-07-08',
      gender: 'Male',
      salaryCycleDate: 1,
      salaryAccess: 'Disable access',
      wageType: 'Daily',
      salaryAmount: '950',
      shiftId: shift2Id,
      weeklyOffs: ['Sunday'],
      createdAt: Date.now(),
      paymentDetails: { paymentMode: 'Cash' }
    },
    {
      id: crypto.randomUUID(),
      businessId,
      type: 'contract',
      fullName: 'Suresh (Helper)',
      companyId: 'TF011',
      phoneNumber: '9876543221',
      dob: '1998-02-15',
      gender: 'Male',
      salaryCycleDate: 1,
      salaryAccess: 'Disable access',
      wageType: 'Monthly',
      salaryAmount: '12000',
      shiftId: shift1Id,
      weeklyOffs: ['Sunday'],
      createdAt: Date.now(),
      paymentDetails: { paymentMode: 'Cash' }
    }
  ];
  localStorage.setItem(STAFF_DB_KEY, JSON.stringify(employees));

  const leaves: LeaveRequest[] = [
    {
       id: crypto.randomUUID(),
       employeeId: emp1Id,
       startDate: '20 Dec 2025',
       endDate: '22 Dec 2025',
       reason: 'Family Function',
       type: 'Casual',
       status: 'pending',
       appliedOn: Date.now()
    }
  ];
  localStorage.setItem(LEAVE_DB_KEY, JSON.stringify(leaves));

  return true;
};
