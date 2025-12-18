
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Info, 
  User, 
  Briefcase, 
  Banknote, 
  LogIn, 
  LogOut, 
  Plus,
  ChevronLeft,
  Clock,
  X
} from 'lucide-react';
import { Employee, LeaveRequest, LeaveStatus, Shift } from '../types';
import { getLeaveRequests, updateLeaveStatus, getAttendanceHistory } from '../services/dbService';

export type EmployeeActionType = 'view_profile' | 'manage_shift' | 'create_advance';

interface EmployeeDetailViewProps {
  employee: Employee;
  shift?: Shift;
  onBack: () => void;
  initialMode?: 'activity' | 'insights' | 'leaves';
  onAction?: (action: EmployeeActionType, employeeId: string) => void;
}

type ViewMode = 'activity' | 'insights' | 'leaves';

export const EmployeeDetailView: React.FC<EmployeeDetailViewProps> = ({ employee, shift, onBack, initialMode, onAction }) => {
  const [mode, setMode] = useState<ViewMode>(initialMode || 'activity');

  useEffect(() => {
    if (initialMode) setMode(initialMode);
  }, [initialMode]);

  if (mode === 'insights') {
    return (
      <InsightsView 
        employee={employee} 
        onBack={() => setMode('activity')} 
        onManageLeave={() => setMode('leaves')}
        onAction={onAction}
      />
    );
  }

  if (mode === 'leaves') {
    return <ManageLeaveView employee={employee} onBack={() => setMode('insights')} />;
  }

  return (
     <ActivityView 
        employee={employee} 
        shift={shift} 
        onBack={onBack} 
        onOpenInsights={() => setMode('insights')} 
     />
  );
};

// --- ACTIVITY VIEW ---

const ActivityView: React.FC<{ employee: Employee; shift?: Shift; onBack: () => void; onOpenInsights: () => void }> = ({ employee, shift, onBack, onOpenInsights }) => {
  // Use DB Service to generate REAL timeline activity
  const history = useMemo(() => getAttendanceHistory(employee, shift), [employee, shift]);
  const todayRecord = history[0]; 
  const yesterdayRecord = history[1];

  const todayDateStr = todayRecord ? todayRecord.date : "Today";
  const yesterdayDateStr = yesterdayRecord ? yesterdayRecord.date : "Yesterday";

  const getHoursMins = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return { h, m };
  }

  const { h: workedH, m: workedM } = getHoursMins(todayRecord?.workingMinutes || 0);

  return (
    <div className="bg-white min-h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-4 flex items-center border-b border-gray-100 shadow-sm bg-white sticky top-0 z-10">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-gray-100 mr-2">
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </button>
        <div>
           <h1 className="text-lg font-bold text-gray-900">Regularization</h1>
           <p className="text-xs text-gray-500">{employee.fullName} | ID: {employee.companyId || '001'}</p>
        </div>
        <div className="ml-auto flex items-center gap-1 text-gray-600 text-sm font-medium border border-gray-200 rounded-md px-2 py-1">
           <CalendarIcon className="w-4 h-4 text-blue-500" />
           {todayDateStr}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 pb-20">
         
         {/* Status Banner */}
         {todayRecord?.status === 'present' ? (
             <div className="bg-blue-50 px-4 py-3 flex items-center gap-2">
                <span className="text-sm font-medium text-gray-800">
                    <span className="text-blue-600 font-bold">Present</span> marked for {todayDateStr}
                </span>
             </div>
         ) : (
             <div className="bg-red-50 px-4 py-3 flex items-center gap-2">
                <span className="text-sm font-medium text-gray-800">
                    Marked <span className="text-red-500 font-bold uppercase">{todayRecord?.status?.replace('_', ' ')}</span> for {todayDateStr}
                </span>
             </div>
         )}

         {/* Dark Card */}
         <div className="p-4">
            <div className="bg-[#0B1120] rounded-2xl p-6 text-white shadow-xl">
               <h3 className="text-gray-400 text-center text-sm font-medium mb-4">Working Hours</h3>
               
               {/* Digital Clock Style Display */}
               <div className="flex justify-center items-center gap-3 mb-2">
                  <div className="flex flex-col items-center">
                     <div className="bg-[#1E293B] rounded-lg w-16 h-16 flex items-center justify-center text-3xl font-bold tracking-wider shadow-inner">
                        {workedH.toString().padStart(2, '0')}
                     </div>
                     <span className="text-xs text-gray-500 mt-2">Hour</span>
                  </div>
                  <span className="text-2xl font-bold -mt-6">:</span>
                  <div className="flex flex-col items-center">
                     <div className="bg-[#1E293B] rounded-lg w-16 h-16 flex items-center justify-center text-3xl font-bold tracking-wider shadow-inner">
                        {workedM.toString().padStart(2, '0')}
                     </div>
                     <span className="text-xs text-gray-500 mt-2">Min</span>
                  </div>
               </div>

               {/* Break Time */}
               <div className="flex justify-center mb-6">
                  <div className="bg-amber-50/10 text-amber-200 px-4 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 border border-amber-500/30">
                     <div className="w-3.5 h-3.5 rounded-full border border-amber-200 flex items-center justify-center text-[8px]">L</div>
                     Break: {shift?.breakMinutes || 0} min
                  </div>
               </div>

               {/* Attendance & More Button */}
               <button 
                  onClick={onOpenInsights}
                  className="w-full flex items-center justify-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors pt-4 border-t border-gray-800"
               >
                  <CalendarIcon className="w-4 h-4" />
                  Attendance & More
                  <ChevronRight className="w-4 h-4" />
               </button>
            </div>
         </div>

         {/* Activity Timeline */}
         <div className="px-4">
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-base font-medium text-gray-600">Your Activity</h3>
               <button className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm active:scale-95 transition-transform">
                  Add Punch
               </button>
            </div>

            {/* Timeline Items */}
            <div className="space-y-6">
               
               {/* Day 2 (Today) */}
               {todayRecord && todayRecord.status === 'present' ? (
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-4">{todayDateStr} (Today)</h4>
                    <div className="relative pl-4 space-y-6 border-l-2 border-dashed border-gray-200 ml-2">
                        {todayRecord.punchIn && (
                            <TimelineItem 
                            icon={<LogIn className="w-4 h-4 text-green-600" />}
                            bg="bg-green-50"
                            label="Punch In"
                            time={todayRecord.punchIn}
                            />
                        )}
                        {todayRecord.punchOut && (
                            <TimelineItem 
                            icon={<LogOut className="w-4 h-4 text-red-500" />}
                            bg="bg-red-50"
                            label="Punch Out"
                            time={todayRecord.punchOut}
                            />
                        )}
                    </div>
                  </div>
               ) : (
                  <div>
                     <h4 className="text-sm font-medium text-gray-400 mb-4">{todayDateStr} (Today)</h4>
                     <p className="text-sm text-gray-500 pl-4 italic">No punch activity recorded.</p>
                  </div>
               )}

               {/* Day 1 (Yesterday) */}
               {yesterdayRecord && yesterdayRecord.status === 'present' && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-4">{yesterdayDateStr}</h4>
                    <div className="relative pl-4 space-y-6 border-l-2 border-dashed border-gray-200 ml-2">
                        {yesterdayRecord.punchIn && (
                            <TimelineItem 
                            icon={<LogIn className="w-4 h-4 text-green-600" />}
                            bg="bg-green-50"
                            label="Punch In"
                            time={yesterdayRecord.punchIn}
                            />
                        )}
                        {yesterdayRecord.punchOut && (
                            <TimelineItem 
                            icon={<LogOut className="w-4 h-4 text-red-500" />}
                            bg="bg-red-50"
                            label="Punch Out"
                            time={yesterdayRecord.punchOut}
                            />
                        )}
                    </div>
                  </div>
               )}

            </div>
         </div>
      </div>
      
      {/* Floating Action Button for Adding Punch */}
      <div className="fixed bottom-6 right-6">
          <button className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-all active:scale-90">
             <Plus className="w-8 h-8" />
          </button>
      </div>
    </div>
  );
};

const TimelineItem = ({ icon, bg, label, time }: any) => (
  <div className="flex items-center justify-between relative">
     {/* Dot on line */}
     <div className={`absolute -left-[25px] w-4 h-4 rounded-full border-2 border-white shadow-sm flex items-center justify-center ${bg}`}>
        <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
     </div>
     
     <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
           {icon}
        </div>
        <div className="flex items-center gap-1">
           <span className="text-sm font-medium text-gray-700">{label}</span>
           <Info className="w-3 h-3 text-gray-300" />
        </div>
     </div>
     <span className="text-sm font-medium text-gray-500">{time}</span>
  </div>
);

// --- INSIGHTS VIEW ---

interface InsightsViewProps {
   employee: Employee;
   onBack: () => void;
   onManageLeave?: () => void;
   hideHeader?: boolean;
   onAction?: (action: EmployeeActionType, employeeId: string) => void;
}

export const InsightsView: React.FC<InsightsViewProps> = ({ employee, onBack, onManageLeave, hideHeader, onAction }) => {
   
   // Generate Month Days
   const days = Array.from({ length: 31 }, (_, i) => i + 1);

   // Status generator based on employee ID hash for deterministic variety
   const getStatus = (day: number) => {
      // 1. Future (After Dec 18th)
      if (day > 18) {
         if (day === 25) return 'holiday'; // Christmas
         if ([7, 14, 21, 28].includes(day)) return 'week_off'; // Sundays
         return 'future';
      }

      // 2. Fixed Holidays & Weekends for Past
      if (day === 25) return 'holiday'; // Christmas (covered by future logic usually, but safe keep)
      if ([7, 14, 21, 28].includes(day)) return 'week_off';

      // 3. Deterministic Randomness based on Employee ID and Day
      // This ensures different employees have different leave patterns
      let hash = day;
      for (let i = 0; i < employee.id.length; i++) {
         hash += employee.id.charCodeAt(i);
      }
      
      const rand = hash % 20; // Modulo 20 to create probabilities

      if (rand === 0) return 'absent';    // ~5% chance
      if (rand === 1) return 'on_leave';  // ~5% chance
      
      return 'present'; // ~90% chance
   };

   const statusColors: Record<string, string> = {
      present: 'bg-green-600 text-white',
      week_off: 'bg-gray-200 text-gray-500',
      holiday: 'bg-cyan-100 text-cyan-800 border-2 border-blue-400',
      absent: 'bg-red-500 text-white',
      on_leave: 'bg-purple-300 text-purple-900',
      future: 'bg-white text-gray-300 border border-gray-100'
   };

   return (
      <div className="bg-white min-h-full flex flex-col">
         {/* Header */}
         {!hideHeader && (
            <div className="px-4 py-4 flex items-center bg-white sticky top-0 z-10">
               <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-gray-100 mr-2">
                  <ArrowLeft className="w-6 h-6 text-gray-800" />
               </button>
               <h1 className="text-lg font-bold text-gray-900">Insights</h1>
            </div>
         )}

         <div className="flex-1 overflow-y-auto pb-20">
            
            {/* Calendar Section */}
            <div className="px-4 mb-6 pt-4">
               <div className="flex items-center justify-between mb-4 px-2">
                  <button className="p-1 rounded-full hover:bg-gray-100 text-blue-500 border border-blue-100"><ChevronLeft className="w-5 h-5" /></button>
                  <h2 className="text-lg font-bold text-gray-900">December 2025</h2>
                  <button className="p-1 rounded-full hover:bg-gray-100 text-blue-500 border border-blue-100"><ChevronRight className="w-5 h-5" /></button>
               </div>

               {/* Calendar Grid */}
               <div className="grid grid-cols-7 gap-2 mb-6">
                  {days.map(day => {
                     const status = getStatus(day);
                     return (
                        <div 
                           key={day} 
                           className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium shadow-sm transition-transform hover:scale-105 ${statusColors[status]}`}
                        >
                           {day}
                        </div>
                     );
                  })}
               </div>

               {/* Legend - Removed Half Day */}
               <div className="grid grid-cols-3 gap-y-3 gap-x-2 px-2">
                  <LegendItem color="bg-purple-300" label="On Leave" />
                  <LegendItem color="bg-green-600" label="Present" />
                  <LegendItem color="bg-red-500" label="Absent" />
                  <LegendItem color="bg-gray-200" label="Week Off" />
                  <LegendItem color="bg-cyan-100" label="Holiday" />
               </div>
            </div>
            
            <div className="h-2 bg-gray-50 border-t border-b border-gray-100 mb-6"></div>

            {/* More Details Grid */}
            <div className="px-4">
               <h3 className="text-base font-semibold text-gray-600 mb-6">More Details</h3>
               
               <div className="grid grid-cols-4 gap-4">
                  <DetailIcon 
                     icon={<User className="w-6 h-6" />} 
                     label="Basic Details" 
                     onClick={() => onAction && onAction('view_profile', employee.id)}
                  />
                  <DetailIcon 
                     icon={<Briefcase className="w-6 h-6" />} 
                     label="Manage Leave" 
                     onClick={onManageLeave}
                  />
                  <DetailIcon 
                     icon={<LogIn className="w-6 h-6" />} 
                     label="Manage Shift" 
                     onClick={() => onAction && onAction('manage_shift', employee.id)}
                  />
                  <DetailIcon 
                     icon={<Banknote className="w-6 h-6" />} 
                     label="Advance" 
                     onClick={() => onAction && onAction('create_advance', employee.id)}
                  />
               </div>
            </div>

         </div>
      </div>
   );
};

// --- MANAGE LEAVE VIEW ---

const ManageLeaveView: React.FC<{ employee: Employee; onBack: () => void }> = ({ employee, onBack }) => {
   const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
   const [loading, setLoading] = useState(true);
   const [activeActionId, setActiveActionId] = useState<string | null>(null);
   const [comment, setComment] = useState('');

   useEffect(() => {
      loadLeaves();
   }, []);

   const loadLeaves = async () => {
      setLoading(true);
      const data = await getLeaveRequests(employee.id);
      setLeaves(data);
      setLoading(false);
   };

   const handleStatusUpdate = async (leaveId: string, status: LeaveStatus) => {
      await updateLeaveStatus(leaveId, status);
      setActiveActionId(null);
      setComment('');
      await loadLeaves(); // Reload
   };

   const pendingLeaves = leaves.filter(l => l.status === 'pending');
   const historyLeaves = leaves.filter(l => l.status !== 'pending');

   return (
      <div className="bg-white min-h-full flex flex-col relative">
         {/* Header */}
         <div className="px-4 py-4 flex items-center bg-white sticky top-0 z-10 border-b border-gray-100">
            <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-gray-100 mr-2">
               <ArrowLeft className="w-6 h-6 text-gray-800" />
            </button>
            <h1 className="text-lg font-bold text-gray-900">Manage Leave</h1>
         </div>

         <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {loading ? (
               <div className="text-center py-10 text-gray-400">Loading requests...</div>
            ) : (
               <div className="space-y-6">
                  
                  {/* Pending Section */}
                  <div>
                     <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Pending Approvals
                     </h2>
                     {pendingLeaves.length === 0 ? (
                        <div className="bg-white p-4 rounded-xl border border-gray-200 text-center text-gray-400 text-sm">
                           No pending requests
                        </div>
                     ) : (
                        <div className="space-y-3">
                           {pendingLeaves.map(leave => (
                              <div key={leave.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                 <div className="flex justify-between items-start mb-2">
                                    <div>
                                       <span className="inline-block bg-purple-100 text-purple-700 text-xs font-bold px-2 py-0.5 rounded mb-1">{leave.type}</span>
                                       <h3 className="font-bold text-gray-900 text-sm">{leave.startDate} - {leave.endDate}</h3>
                                       <p className="text-xs text-gray-500 mt-1">{leave.reason}</p>
                                    </div>
                                 </div>
                                 <div className="flex gap-3 mt-3 pt-3 border-t border-gray-50">
                                    <button 
                                       onClick={() => setActiveActionId(leave.id)}
                                       className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-blue-50 text-blue-600 font-semibold text-sm hover:bg-blue-100"
                                    >
                                       Review Request
                                    </button>
                                 </div>
                              </div>
                           ))}
                        </div>
                     )}
                  </div>

                  {/* History Section */}
                  <div>
                     <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">History</h2>
                     {historyLeaves.length === 0 ? (
                        <div className="text-center py-4 text-gray-400 text-sm">No leave history</div>
                     ) : (
                        <div className="space-y-3">
                           {historyLeaves.map(leave => (
                              <div key={leave.id} className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center">
                                 <div>
                                    <div className="flex items-center gap-2 mb-1">
                                       <span className="font-bold text-gray-900 text-sm">{leave.type}</span>
                                       <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded capitalize ${leave.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                          {leave.status}
                                       </span>
                                    </div>
                                    <p className="text-xs text-gray-500">{leave.startDate} - {leave.endDate}</p>
                                 </div>
                              </div>
                           ))}
                        </div>
                     )}
                  </div>
               </div>
            )}
         </div>

         {/* Review Action Modal */}
         {activeActionId && (
            <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm animate-in fade-in">
               <div className="w-full bg-white rounded-t-2xl p-4 shadow-xl animate-in slide-in-from-bottom duration-300">
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="font-bold text-gray-900">Review Leave</h3>
                     <button onClick={() => setActiveActionId(null)} className="p-1 bg-gray-100 rounded-full"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="mb-4">
                     <label className="block text-xs font-medium text-gray-500 mb-1.5">Admin Comment</label>
                     <textarea 
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-blue-500 outline-none"
                        placeholder="Add a note (optional)"
                        rows={3}
                     />
                  </div>
                  <div className="flex gap-3">
                     <button 
                        onClick={() => handleStatusUpdate(activeActionId, 'rejected')}
                        className="flex-1 py-3 bg-red-50 text-red-600 font-bold rounded-xl"
                     >
                        Reject
                     </button>
                     <button 
                        onClick={() => handleStatusUpdate(activeActionId, 'approved')}
                        className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl"
                     >
                        Approve
                     </button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

const LegendItem = ({ color, label }: any) => (
   <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${color}`}></div>
      <span className="text-xs text-gray-600 font-medium">{label}</span>
   </div>
);

const DetailIcon = ({ icon, label, onClick }: any) => (
   <button 
      onClick={onClick}
      className="flex flex-col items-center text-center gap-2 group"
   >
      <div className="w-14 h-14 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 bg-white shadow-sm group-active:bg-gray-50 group-active:scale-95 transition-all">
         {icon}
      </div>
      <span className="text-[10px] font-medium text-gray-500 leading-tight h-8 group-hover:text-blue-600">{label}</span>
   </button>
);
