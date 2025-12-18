
import React, { useMemo, useState, useEffect } from 'react';
import { Calendar, ChevronDown, Info, User } from 'lucide-react';
import { Employee, Shift } from '../types';
import { EmployeeDetailView, EmployeeActionType } from './EmployeeDetailView';
import { getAttendanceHistory } from '../services/dbService';

interface AttendanceTabProps {
  employees: Employee[];
  shifts: (Shift & { staffCount: number })[];
  initialEmployeeId?: string;
  initialViewMode?: 'activity' | 'insights' | 'leaves';
  onEmployeeAction?: (action: EmployeeActionType, employeeId: string) => void;
}

type AttendanceStatus = 'checked_in' | 'not_in' | 'time_off';

interface EmployeeAttendance extends Employee {
  status: AttendanceStatus;
  checkInTime?: string;
  workingHours?: string;
  breakHours?: string;
}

export const AttendanceTab: React.FC<AttendanceTabProps> = ({ employees, shifts, initialEmployeeId, initialViewMode, onEmployeeAction }) => {
  const [selectedShiftId, setSelectedShiftId] = useState<string>('all');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [currentViewMode, setCurrentViewMode] = useState<'activity' | 'insights' | 'leaves' | undefined>(undefined);
  
  // Mock current date as requested
  const todayDateStr = "18 Dec"; 

  // Effect to handle navigation from external notifications (e.g. Dashboard approvals)
  useEffect(() => {
    if (initialEmployeeId) {
      const emp = employees.find(e => e.id === initialEmployeeId);
      if (emp) {
        setSelectedEmployee(emp);
        setCurrentViewMode(initialViewMode);
      }
    }
  }, [initialEmployeeId, initialViewMode, employees]);

  const handleEmployeeClick = (emp: Employee) => {
    setSelectedEmployee(emp);
    setCurrentViewMode(undefined);
  };

  const handleBack = () => {
    setSelectedEmployee(null);
    setCurrentViewMode(undefined);
  };

  // Generate real attendance data from the helper
  const attendanceData: EmployeeAttendance[] = useMemo(() => {
    return employees.map((emp) => {
      // Find shift
      const shift = shifts.find(s => s.id === emp.shiftId);
      // Get history
      const history = getAttendanceHistory(emp, shift);
      // Find today's record (which is the last one in the history array usually, or find by date string matching today logic)
      // Since getAttendanceHistory generates today at index 0 (based on the loop), let's find the one matching "18 Dec" 
      // Note: The loop in dbService starts at 0 (today) and goes back. So history[0] is today.
      const todayRecord = history[0]; 

      let status: AttendanceStatus = 'not_in';
      let workingHours = '';
      let breakHours = '';

      if (todayRecord.status === 'present') {
        status = 'checked_in';
        const h = Math.floor(todayRecord.workingMinutes / 60);
        const m = todayRecord.workingMinutes % 60;
        workingHours = `${h}h ${m}m`;
        
        // Just mocking break hours for display since we don't store punch out for break specifically
        breakHours = shift?.breakMinutes ? `${Math.floor(shift.breakMinutes/60)}h ${shift.breakMinutes%60}m` : '0h';
      } else if (todayRecord.status === 'leave' || todayRecord.status === 'week_off' || todayRecord.status === 'holiday') {
        status = 'time_off';
      } else {
        status = 'not_in';
      }

      return {
        ...emp,
        status,
        workingHours,
        breakHours
      };
    });
  }, [employees, shifts]);

  // Filter based on shift
  const filteredData = useMemo(() => {
    if (selectedShiftId === 'all') return attendanceData;
    return attendanceData.filter(e => e.shiftId === selectedShiftId);
  }, [attendanceData, selectedShiftId]);

  // Calculate Stats
  const stats = useMemo(() => {
    return {
      total: filteredData.length,
      checkedIn: filteredData.filter(e => e.status === 'checked_in').length,
      notIn: filteredData.filter(e => e.status === 'not_in').length,
      timeOff: filteredData.filter(e => e.status === 'time_off').length,
    };
  }, [filteredData]);

  // Chart Angles
  const total = stats.total || 1; // Avoid divide by zero
  const checkedInDeg = (stats.checkedIn / total) * 360;
  const notInDeg = (stats.notIn / total) * 360;
  // TimeOff fills the rest

  const selectedShift = useMemo(() => {
    if (!selectedEmployee) return undefined;
    return shifts.find(s => s.id === selectedEmployee.shiftId);
  }, [selectedEmployee, shifts]);

  // If employee selected, show detail view
  if (selectedEmployee) {
    return (
      <EmployeeDetailView 
        employee={selectedEmployee} 
        shift={selectedShift}
        onBack={handleBack} 
        initialMode={currentViewMode}
        onAction={onEmployeeAction}
      />
    );
  }

  return (
    <div className="bg-gray-50 min-h-full pb-20">
      
      {/* Filters Header */}
      <div className="bg-white px-4 py-4 flex gap-3 border-b border-gray-100">
        <div className="flex-1 border border-gray-200 rounded-lg px-3 py-2 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2 text-gray-700">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-semibold">Today</span>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>

        <div className="w-1/2 relative">
          <select 
            className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 bg-white focus:outline-none focus:border-blue-500"
            value={selectedShiftId}
            onChange={(e) => setSelectedShiftId(e.target.value)}
          >
            <option value="all">All Shifts</option>
            {shifts.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Insights Section */}
      <div className="p-4 bg-white mb-2">
        {/* <h2 className="text-lg font-bold text-gray-800 mb-4">Today's Insights</h2> */}
        
        <div className="flex items-start gap-6">
          
          {/* Chart */}
          <div className="flex-1 flex flex-col items-center">
            <div 
              className="relative w-40 h-40 rounded-full flex items-center justify-center transition-all duration-500"
              style={{
                background: `conic-gradient(
                  #3B82F6 0deg ${checkedInDeg}deg, 
                  #F87171 ${checkedInDeg}deg ${checkedInDeg + notInDeg}deg,
                  #A855F7 ${checkedInDeg + notInDeg}deg 360deg
                )`
              }}
            >
              {/* Inner Hole */}
              <div className="absolute inset-5 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                <span className="text-3xl font-bold text-gray-900">{stats.total}</span>
                <span className="text-xs text-gray-500 font-medium">Total</span>
              </div>
            </div>
            
            <div className="mt-4 flex items-center gap-1 text-gray-500 text-sm font-medium">
              Info <Info className="w-4 h-4" />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="w-32 flex flex-col gap-3">
            <StatCard 
              count={stats.checkedIn} 
              label="Checked In" 
              color="bg-blue-500" 
              borderColor="border-blue-200"
            />
            <StatCard 
              count={stats.notIn} 
              label="Not in Yet" 
              color="bg-red-400" 
              borderColor="border-red-200"
            />
            <StatCard 
              count={stats.timeOff} 
              label="Time Off" 
              color="bg-purple-500" 
              borderColor="border-purple-200"
            />
          </div>
        </div>
      </div>

      {/* Employee List Section */}
      <div className="bg-white border-t border-gray-100">
        <div className="px-4 py-4 pb-2">
          <h3 className="text-base font-bold text-gray-800">Checked In Employees</h3>
        </div>
        
        {/* Table Header */}
        <div className="px-4 py-2 bg-slate-50 flex items-center text-xs font-semibold text-gray-500">
          <div className="flex-1">Employee</div>
          <div className="w-24 text-right">Working Hours</div>
          <div className="w-24 text-right">Break Hours</div>
        </div>

        {/* List */}
        <div>
          {filteredData.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">No employees found.</div>
          ) : (
            filteredData.map((emp) => (
              <div key={emp.id} className="px-4 py-4 border-b border-gray-50 flex items-start hover:bg-gray-50 transition-colors">
                
                {/* Employee Info */}
                <div className="flex-1 pr-2">
                   <button 
                     onClick={() => handleEmployeeClick(emp)}
                     className="text-sm font-bold text-gray-900 underline decoration-gray-300 underline-offset-2 mb-1 block text-left hover:text-blue-600 hover:decoration-blue-300"
                   >
                     {emp.fullName}
                   </button>
                   <div className="text-xs text-gray-500">
                     ID: {emp.companyId || 'N/A'} | <span className="capitalize">{emp.type === 'full_time' ? 'Employees - p' : 'Contract'}</span>
                   </div>
                </div>

                {/* Working Hours */}
                <div className="w-24 text-right">
                  <span className={`text-sm font-medium ${emp.workingHours ? 'text-gray-900' : 'text-gray-300'}`}>
                    {emp.workingHours || '--'}
                  </span>
                </div>

                {/* Break Hours */}
                <div className="w-24 text-right">
                  <span className={`text-sm font-medium ${emp.breakHours ? 'text-gray-900' : 'text-gray-300'}`}>
                    {emp.breakHours || '--'}
                  </span>
                </div>

              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

const StatCard: React.FC<{ count: number; label: string; color: string; borderColor: string }> = ({ count, label, color, borderColor }) => (
  <div className={`border ${borderColor} rounded-lg p-3 flex flex-col justify-center bg-white shadow-sm`}>
    <div className="flex items-center gap-2 mb-1">
      <span className="text-xl font-bold text-gray-900">{count}</span>
      <div className={`w-2 h-2 rounded-sm ${color}`}></div>
    </div>
    <span className="text-xs font-medium text-gray-500">{label}</span>
  </div>
);
