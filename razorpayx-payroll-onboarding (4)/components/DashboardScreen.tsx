
import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronDown, 
  UserPlus, 
  Users, 
  CalendarCheck, 
  Settings,
  Smartphone,
  ChevronRight,
  User,
  Home,
  Banknote,
  Wallet,
  PlayCircle,
  Menu,
  MessageSquare,
  LogOut,
  Phone,
  RefreshCw,
  Clock,
  CheckSquare,
  X,
  ArrowLeft,
  History
} from 'lucide-react';
import { StaffTypeModal } from './StaffTypeModal';
import { AttendanceTab } from './AttendanceTab';
import { StaffProfileScreen } from './StaffProfileScreen';
import { UsageTypeModal } from './UsageTypeModal';
import { FinalizePayrollScreen } from './FinalizePayrollScreen';
import { logStaffSelection, getEmployees, getLatestBusinessDetails, getShifts, updatePayrollUsage, saveApprovedAdvance } from '../services/dbService';
import { StaffType, Employee, BusinessDetails, Shift, PayrollUsageType } from '../types';
import { EmployeeActionType } from './EmployeeDetailView';

interface DashboardScreenProps {
  businessName: string;
  onAddStaff: (type: StaffType) => void;
  onNavigateToShifts: () => void;
  onExecutePayroll: () => void;
  onLoadWallet: () => void;
}

// View state can be one of the bottom tabs OR a side menu item view
type View = 'home' | 'attendance' | 'payments' | 'approvals' | 'staff' | 'settings';

interface ApprovalRequest {
  id: string;
  employeeId: string;
  name: string;
  type: 'Attendance Regularization' | 'Leave Request' | 'Advance Salary';
  date: string;
  meta?: any; // For extra details like amount
  status?: 'Pending' | 'Approved' | 'Rejected'; // Added status
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ businessName, onAddStaff, onNavigateToShifts, onExecutePayroll, onLoadWallet }) => {
  const [activeView, setActiveView] = useState<View>('home');
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [reviewRequest, setReviewRequest] = useState<ApprovalRequest | null>(null);
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<(Shift & { staffCount: number })[]>([]);
  const [businessDetails, setBusinessDetails] = useState<BusinessDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedStaffProfile, setSelectedStaffProfile] = useState<Employee | null>(null);
  const [walletBalance, setWalletBalance] = useState(0);

  // States to pass data to sub-screens
  const [attendanceInitialEmployeeId, setAttendanceInitialEmployeeId] = useState<string | undefined>(undefined);
  const [attendanceInitialViewMode, setAttendanceInitialViewMode] = useState<'activity' | 'insights' | 'leaves' | undefined>(undefined);
  const [paymentInitialRequest, setPaymentInitialRequest] = useState<any | undefined>(undefined);

  // Approvals & History
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [approvalHistory, setApprovalHistory] = useState<ApprovalRequest[]>([]);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [empData, shiftData, bizData] = await Promise.all([
         getEmployees(),
         getShifts(),
         Promise.resolve(getLatestBusinessDetails())
      ]);
      setEmployees(empData);
      setShifts(shiftData);
      setBusinessDetails(bizData);
      // Mock wallet balance fetch
      setWalletBalance(2500);

      // Generate Mock Approvals if employees exist and list is empty (init only)
      if (empData.length > 0 && approvals.length === 0 && approvalHistory.length === 0) {
        setApprovals([
          { 
             id: '1', 
             employeeId: empData[0].id, 
             name: empData[0].fullName, 
             type: 'Leave Request', 
             date: 'Today, 10:30 AM',
             status: 'Pending'
          },
          { 
             id: '2', 
             employeeId: empData[0].id, 
             name: empData[0].fullName, 
             type: 'Advance Salary', 
             date: 'Today, 11:00 AM',
             meta: { amount: 5000, reason: 'Medical Emergency' },
             status: 'Pending'
          }
        ]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeView]);

  // Close notifications on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddStaffClick = () => {
    setShowStaffModal(true);
  };

  const handleStaffTypeSelected = async (type: StaffType) => {
    await logStaffSelection(type);
    setShowStaffModal(false);
    onAddStaff(type);
  };

  const handleUsageUpdate = async (type: PayrollUsageType) => {
    if (businessDetails?.id) {
       await updatePayrollUsage(businessDetails.id, type);
       setBusinessDetails(prev => prev ? ({ ...prev, payrollUsageType: type }) : null);
       setShowUsageModal(false);
    }
  };

  const handleNotificationClick = (request: ApprovalRequest) => {
     setShowNotifications(false); 
     
     if (request.type === 'Attendance Regularization' || request.type === 'Leave Request') {
        // For leaves/attendance, route to existing flow but could open review modal first
        setReviewRequest(request);
     } else if (request.type === 'Advance Salary') {
        setReviewRequest(request);
     }
  };

  const handleApprovalAction = async (approved: boolean, comment: string) => {
      if (!reviewRequest) return;
      
      const status = approved ? 'Approved' : 'Rejected';

      if (approved && reviewRequest.type === 'Advance Salary') {
         // Requirement 3: Deduct from salary automatically (Save as Approved Advance)
         await saveApprovedAdvance(reviewRequest.employeeId, reviewRequest.meta?.amount || 0, reviewRequest.meta?.reason || 'Approved Advance');
      } else if (approved && reviewRequest.type === 'Leave Request') {
          // In real app, call updateLeaveStatus.
          // For demo, we just move it to history.
      }
      
      // Move from Pending to History
      setApprovals(prev => prev.filter(a => a.id !== reviewRequest.id));
      setApprovalHistory(prev => [{ ...reviewRequest, status }, ...prev]);
      
      setReviewRequest(null);
  };

  // Logic to handle actions coming from Attendance Tab's More Details
  const handleEmployeeAction = (action: EmployeeActionType, employeeId: string) => {
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) return;

    if (action === 'view_profile') {
       setSelectedStaffProfile(emp);
    } else if (action === 'manage_shift') {
       onNavigateToShifts();
    } else if (action === 'create_advance') {
       setPaymentInitialRequest({
          type: 'Advance',
          employeeId: emp.id,
          // If there's a pending request in approvals, we could map it here, otherwise default empty
          amount: undefined, 
          reason: undefined
       });
       setActiveView('payments');
    }
  };

  // Group employees by Wage Type
  const groupedEmployees = {
    Monthly: employees.filter(e => e.wageType === 'Monthly'),
    Daily: employees.filter(e => e.wageType === 'Daily'),
    Hourly: employees.filter(e => e.wageType === 'Hourly'),
  };

  const getCalculationMethodLabel = () => {
     const method = businessDetails?.salaryConfig?.calculationMethod;
     if (method === 'calendar_month') return 'Calendar Month';
     if (method === 'fixed_30_days') return 'Fixed 30 Days';
     if (method === 'exclude_weekly_offs') return 'Exclude Weekly Offs';
     return 'Not Configured';
  };

  // Side Menu Navigation Handler
  const handleSideMenuClick = (action: string) => {
    setIsSideMenuOpen(false);
    switch(action) {
      case 'staff':
        setActiveView('staff');
        break;
      case 'shifts':
        onNavigateToShifts();
        break;
      case 'configuration':
        setActiveView('settings');
        break;
      case 'logout':
        alert('Logged out');
        break;
      default:
        break;
    }
  };

  // If a staff profile is selected, render it covering the dashboard
  if (selectedStaffProfile) {
    return (
      <StaffProfileScreen 
        employee={selectedStaffProfile} 
        onBack={() => {
           setSelectedStaffProfile(null);
           // Re-fetch to ensure updates are shown
           getEmployees().then(setEmployees);
        }} 
      />
    );
  }

  // If view is payments, we render the full screen FinalizePayroll component
  if (activeView === 'payments') {
     return (
       <div className="w-full max-w-md bg-white h-screen sm:h-[800px] sm:shadow-xl sm:rounded-xl sm:overflow-hidden flex flex-col mx-auto relative">
          <div className="flex-1 flex flex-col overflow-hidden mb-16">
            <FinalizePayrollScreen 
              onBack={() => {
                setPaymentInitialRequest(undefined);
                setActiveView('home');
              }} 
              initialPaymentRequest={paymentInitialRequest}
            />
          </div>
          
          <BottomNav activeView={activeView} setActiveView={setActiveView} />
       </div>
     );
  }

  return (
    <div className="w-full max-w-md bg-gray-50 h-screen sm:h-[800px] sm:shadow-xl sm:rounded-xl sm:overflow-hidden flex flex-col mx-auto relative">
      
      {/* Top Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between shadow-sm z-20 border-b border-gray-100 sticky top-0">
        <div className="flex items-center gap-3">
          {activeView !== 'home' ? (
              <button 
                onClick={() => setActiveView('home')}
                className="p-1 -ml-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
          ) : (
             <button 
                onClick={() => setIsSideMenuOpen(true)}
                className="p-1 -ml-1 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
             >
                <Menu className="w-6 h-6 text-gray-700" />
             </button>
          )}
          
          <div className="flex flex-col">
            {activeView === 'settings' ? (
               <h1 className="text-lg font-bold text-gray-900 leading-tight">Configuration</h1>
            ) : activeView === 'staff' ? (
               <h1 className="text-lg font-bold text-gray-900 leading-tight">Employee List</h1>
            ) : activeView === 'attendance' ? (
               <h1 className="text-lg font-bold text-gray-900 leading-tight">Attendance</h1>
            ) : activeView === 'approvals' ? (
               <h1 className="text-lg font-bold text-gray-900 leading-tight">Approvals</h1>
            ) : (
               <div className="flex items-center gap-1">
                 <h1 className="text-lg font-bold text-gray-900 truncate max-w-[180px] leading-tight">
                   {businessDetails?.businessName || businessName}
                 </h1>
                 <ChevronDown className="w-4 h-4 text-gray-500" />
               </div>
            )}
          </div>
        </div>

        {/* Notification Icon & Dropdown */}
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
             <MessageSquare className="w-6 h-6 text-gray-600" />
             <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1 min-w-[16px] h-4 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
               {approvals.length + 1}
             </span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-top-2 duration-200 z-50">
               <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Notifications</h3>
               </div>
               <div className="max-h-[300px] overflow-y-auto">
                  <div className="p-3 border-b border-gray-50 hover:bg-blue-50 transition-colors cursor-pointer" onClick={onExecutePayroll}>
                     <div className="flex gap-2">
                        <CalendarCheck className="w-4 h-4 text-blue-500 mt-0.5" />
                        <div>
                           <p className="text-sm font-semibold text-gray-800">Your salary day is coming up!</p>
                           <p className="text-xs text-gray-500 mt-0.5">Payroll date is fast approaching. Load wallet and check staff details.</p>
                        </div>
                     </div>
                  </div>
                  
                  {approvals.map(req => (
                     <div key={req.id} onClick={() => handleNotificationClick(req)} className="p-3 border-b border-gray-50 hover:bg-blue-50 transition-colors cursor-pointer">
                        <div className="flex gap-2">
                           <CheckSquare className="w-4 h-4 text-orange-500 mt-0.5" />
                           <div>
                              <p className="text-sm font-semibold text-gray-800">Review Request: {req.type}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{req.name} • {req.date}</p>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pb-20 no-scrollbar bg-gray-50">
        
        {/* --- VIEW: HOME --- */}
        {activeView === 'home' && (
          <div className="p-4 space-y-4">
            {/* Quick Actions / Features Card */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Quick Actions</h2>
              <div className="space-y-4 mb-6">
                
                {/* Load Wallet */}
                <div 
                  onClick={onLoadWallet}
                  className="w-full flex items-center gap-4 text-left group p-2 -mx-2 rounded-xl hover:bg-gray-50 transition-all active:scale-[0.98] cursor-pointer"
                >
                    <div className="flex-shrink-0 w-12 h-12 bg-teal-50 group-hover:bg-teal-100 rounded-full flex items-center justify-center transition-colors">
                      <Wallet className="w-6 h-6 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 font-medium text-base leading-tight">Load Wallet</p>
                      <p className="text-sm font-bold text-gray-900 mt-0.5">₹ {walletBalance.toLocaleString('en-IN')}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors" />
                </div>

                <FeatureRow 
                  icon={<PlayCircle className="w-6 h-6 text-blue-600" />}
                  text="Finalize & Execute Payroll"
                  onClick={onExecutePayroll}
                />
              </div>

              <button 
                onClick={handleAddStaffClick}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <UserPlus className="w-5 h-5" />
                Add Staff
              </button>
            </div>

            {/* Premium Card */}
            <div className="bg-blue-50/50 rounded-xl shadow-sm border border-blue-100 overflow-hidden relative">
              <div className="absolute top-4 left-0 bg-amber-400 text-black text-xs font-bold px-3 py-1 rounded-r-full shadow-sm z-10">
                RazorpayX Payroll Premium
              </div>
              <div className="p-5 pt-12 flex items-center justify-between">
                <div className="flex-1 pr-4">
                  <h3 className="text-lg font-bold text-gray-900 leading-tight">
                    Ask staff to mark selfie attendance
                  </h3>
                </div>
                <div className="w-16 h-24 bg-teal-700 rounded-lg border-4 border-gray-800 flex items-center justify-center shadow-lg transform rotate-6">
                  <Smartphone className="text-white w-8 h-8" />
                </div>
              </div>
              <button className="w-full bg-black text-white py-3.5 text-sm font-semibold tracking-wide hover:bg-gray-900 transition-colors">
                Unlock RazorpayX Payroll Premium
              </button>
            </div>
          </div>
        )}

        {/* --- VIEW: STAFF --- */}
        {activeView === 'staff' && (
          <div className="p-4 space-y-4">
            <button 
              onClick={handleAddStaffClick}
              className="w-full bg-blue-600 text-white py-3.5 rounded-lg font-semibold text-base hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <UserPlus className="w-5 h-5" />
              Add Staff
            </button>

            {loading ? (
              <div className="text-center py-10 text-gray-400">Loading staff...</div>
            ) : employees.length === 0 ? (
              <div className="text-center py-10">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No staff added yet.</p>
              </div>
            ) : (
              <>
                <StaffGroup 
                  title="Monthly" 
                  list={groupedEmployees.Monthly} 
                  onSelect={setSelectedStaffProfile} 
                />
                <StaffGroup 
                  title="Daily" 
                  list={groupedEmployees.Daily} 
                  onSelect={setSelectedStaffProfile} 
                />
                <StaffGroup 
                  title="Hourly" 
                  list={groupedEmployees.Hourly} 
                  onSelect={setSelectedStaffProfile} 
                />
              </>
            )}
          </div>
        )}

        {/* --- VIEW: ATTENDANCE --- */}
        {activeView === 'attendance' && (
          <AttendanceTab 
            employees={employees} 
            shifts={shifts} 
            initialEmployeeId={attendanceInitialEmployeeId}
            initialViewMode={attendanceInitialViewMode}
            onEmployeeAction={handleEmployeeAction}
          />
        )}

        {/* --- VIEW: APPROVALS --- */}
        {activeView === 'approvals' && (
          <div className="p-4 space-y-6">
             {/* Pending Section */}
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                   <h3 className="font-bold text-gray-800">Pending Requests</h3>
                   <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">{approvals.length}</span>
                </div>
                <div className="divide-y divide-gray-100">
                   {approvals.map(req => (
                     <ApprovalItem 
                        key={req.id}
                        request={req}
                        onReview={() => handleNotificationClick(req)}
                     />
                   ))}
                   {approvals.length === 0 && (
                      <div className="p-6 text-center text-gray-400 text-sm">No pending requests</div>
                   )}
                </div>
             </div>

             {/* History Section */}
             {approvalHistory.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                   <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                      <h3 className="font-bold text-gray-800 flex items-center gap-2">
                         <History className="w-4 h-4 text-gray-500" />
                         Request History
                      </h3>
                   </div>
                   <div className="divide-y divide-gray-100">
                      {approvalHistory.map(req => (
                        <div key={req.id} className="p-4 flex justify-between items-center">
                           <div>
                              <h4 className="font-bold text-gray-900 text-sm">{req.name}</h4>
                              <p className="text-xs text-gray-500">{req.type}</p>
                           </div>
                           <div className="text-right">
                              <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase ${
                                 req.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                                 {req.status}
                              </span>
                              <p className="text-[10px] text-gray-400 mt-1">{req.date}</p>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
             )}
          </div>
        )}

        {/* --- VIEW: SETTINGS (Configuration) --- */}
        {activeView === 'settings' && (
          <div className="bg-white min-h-full">
             <div className="px-6 py-4 bg-blue-50/50 border-b border-gray-100">
                <p className="text-sm text-gray-600">Manage your company profile and app configurations here.</p>
             </div>
             
             <div className="px-6 pb-6">
                <SettingItem 
                   label="App Usage Mode"
                   value={businessDetails?.payrollUsageType === 'calculate_only' ? 'Calculate Salaries Only' : 'Calculate & Pay Salaries'}
                   onClick={() => setShowUsageModal(true)}
                />

                <SettingItem 
                   label="Business Name"
                   value={businessDetails?.businessName || businessName}
                />
                
                <SettingItem 
                   label="Month Calculation"
                   value={getCalculationMethodLabel()}
                />

                <SettingItem 
                   label="Daily Work Entry"
                   value="No Staff Have Access"
                />

                <SettingItem 
                   label="Shift Settings"
                   value={`${shifts.length} Shifts Configured`}
                   onClick={onNavigateToShifts}
                />

                <SettingItem 
                   label="Track In & Out Time"
                   value="Disabled"
                   isNew
                />
             </div>
          </div>
        )}
        
      </div>

      <BottomNav activeView={activeView} setActiveView={(v) => {
         // Clear temporary states when manually navigating
         setAttendanceInitialEmployeeId(undefined);
         setAttendanceInitialViewMode(undefined);
         setPaymentInitialRequest(undefined);
         setActiveView(v);
      }} />

      {/* Side Menu Drawer */}
      <SideMenu 
        isOpen={isSideMenuOpen} 
        onClose={() => setIsSideMenuOpen(false)}
        adminName={businessDetails?.name || 'Admin'}
        businessName={businessDetails?.businessName || businessName}
        onNavigate={handleSideMenuClick}
      />

      {/* Staff Type Selection Modal */}
      <StaffTypeModal 
        isOpen={showStaffModal} 
        onClose={() => setShowStaffModal(false)}
        onContinue={handleStaffTypeSelected}
      />

      {/* Usage Type Selection Modal */}
      <UsageTypeModal 
         isOpen={showUsageModal}
         onClose={() => setShowUsageModal(false)}
         currentType={businessDetails?.payrollUsageType}
         onSave={handleUsageUpdate}
      />
      
      {/* Review Approval Modal */}
      {reviewRequest && (
         <ReviewApprovalModal 
            isOpen={true}
            onClose={() => setReviewRequest(null)}
            request={reviewRequest}
            employees={employees}
            shifts={shifts}
            onAction={handleApprovalAction}
         />
      )}
    </div>
  );
};

// --- Sub-components ---

const BottomNav = ({ activeView, setActiveView }: any) => (
  <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-16 flex items-center justify-around px-2 pb-safe z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
    <NavItem 
      icon={<Home className="w-6 h-6" />} 
      label="Home" 
      active={activeView === 'home'} 
      onClick={() => setActiveView('home')}
    />
    <NavItem 
      icon={<CalendarCheck className="w-6 h-6" />} 
      label="Attendance" 
      active={activeView === 'attendance'}
      onClick={() => setActiveView('attendance')}
    />
    <NavItem 
      icon={<Banknote className="w-6 h-6" />} 
      label="Payments" 
      active={activeView === 'payments'}
      onClick={() => setActiveView('payments')}
    />
    <NavItem 
      icon={<CheckSquare className="w-6 h-6" />} 
      label="Approvals" 
      active={activeView === 'approvals'}
      onClick={() => setActiveView('approvals')}
    />
  </div>
);

// Review Modal with Comments
const ReviewApprovalModal = ({ isOpen, onClose, request, employees, shifts, onAction }: any) => {
   const [comment, setComment] = useState('');
   const emp = employees.find((e: Employee) => e.id === request.employeeId);
   const shift = shifts.find((s: Shift) => s.id === emp?.shiftId);

   if (!isOpen) return null;

   return (
      <div className="fixed inset-0 z-[60] flex items-end justify-center">
         <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
         <div className="relative w-full max-w-md bg-white rounded-t-2xl shadow-xl flex flex-col animate-in slide-in-from-bottom duration-300">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
               <h3 className="font-bold text-gray-900">Review {request.type}</h3>
               <button onClick={onClose} className="p-2 bg-gray-100 rounded-full"><X className="w-4 h-4" /></button>
            </div>
            
            <div className="p-6 space-y-4">
               {/* Context Info */}
               <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                     <div>
                        <p className="text-xs text-gray-500 font-bold uppercase">Employee</p>
                        <p className="font-bold text-gray-900">{emp?.fullName || request.name}</p>
                     </div>
                     {shift && (
                        <div className="text-right">
                           <p className="text-xs text-gray-500 font-bold uppercase">Shift</p>
                           <p className="font-medium text-gray-900 text-sm">{shift.name}</p>
                           <p className="text-xs text-gray-500">{shift.startTime} - {shift.endTime}</p>
                        </div>
                     )}
                  </div>
                  {request.meta?.amount && (
                     <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-xs text-gray-500 font-bold uppercase">Request Amount</p>
                        <p className="text-xl font-bold text-gray-900">₹ {request.meta.amount}</p>
                        {request.meta.reason && <p className="text-xs text-gray-500 mt-1">Reason: {request.meta.reason}</p>}
                     </div>
                  )}
               </div>

               {/* Comment Box */}
               <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Admin Comment</label>
                  <textarea 
                     value={comment}
                     onChange={(e) => setComment(e.target.value)}
                     className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-blue-500 outline-none"
                     placeholder="Add a note (optional)"
                     rows={3}
                  />
               </div>
            </div>

            <div className="p-4 border-t border-gray-100 flex gap-3 pb-safe">
               <button 
                  onClick={() => onAction(false, comment)}
                  className="flex-1 py-3 bg-red-50 text-red-600 font-bold rounded-xl"
               >
                  Reject
               </button>
               <button 
                  onClick={() => onAction(true, comment)}
                  className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl"
               >
                  Approve
               </button>
            </div>
         </div>
      </div>
   );
};

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  adminName: string;
  businessName: string;
  onNavigate: (action: string) => void;
}

const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose, adminName, businessName, onNavigate }) => {
  return (
    <div className={`fixed inset-0 z-50 transition-visibility duration-300 ${isOpen ? 'visible' : 'invisible'}`}>
      
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`absolute top-0 bottom-0 left-0 w-[80%] max-w-xs bg-white shadow-2xl transform transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Header Card */}
        <div className="bg-gradient-to-br from-blue-50 to-white p-6 border-b border-gray-100 pt-12">
          <div className="flex items-center gap-4 mb-4">
             <div className="w-14 h-14 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xl font-bold shadow-md">
                {adminName.substring(0, 2).toUpperCase()}
             </div>
             <div>
                <h2 className="text-lg font-bold text-gray-900 leading-tight">{adminName}</h2>
                <p className="text-xs text-gray-500 font-medium">ID: 9530</p>
             </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between shadow-sm">
             <span className="text-sm font-semibold text-gray-800 truncate pr-2">{businessName}</span>
             <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto py-4">
           <MenuItem icon={<Users />} label="Staff" onClick={() => onNavigate('staff')} />
           <MenuItem icon={<Clock />} label="Shifts" onClick={() => onNavigate('shifts')} />
           <MenuItem icon={<Settings />} label="Settings" onClick={() => onNavigate('configuration')} />
           <div className="h-px bg-gray-100 my-2 mx-4" />
           <MenuItem icon={<Phone />} label="Need Support?" onClick={() => {}} />
           <MenuItem icon={<RefreshCw />} label="Check Update" onClick={() => {}} />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100">
           <button 
             onClick={() => onNavigate('logout')}
             className="flex items-center gap-3 text-red-600 font-semibold px-4 py-2 hover:bg-red-50 rounded-lg w-full transition-colors"
           >
              <LogOut className="w-5 h-5" />
              Logout
           </button>
           <p className="text-right text-[10px] text-gray-400 mt-2">V 3.0.0</p>
        </div>

      </div>
    </div>
  );
};

const MenuItem: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void }> = ({ icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors text-gray-700 active:bg-gray-100"
  >
    <div className="text-gray-500 w-5 h-5 flex justify-center">{icon}</div>
    <span className="font-medium text-sm">{label}</span>
  </button>
);

const ApprovalItem: React.FC<{ request: ApprovalRequest; onReview: () => void }> = ({ request, onReview }) => (
  <div className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors cursor-pointer" onClick={onReview}>
     <div>
        <h4 className="font-bold text-gray-900 text-sm">{request.name}</h4>
        <p className="text-xs text-gray-500">{request.type}</p>
     </div>
     <div className="text-right">
        <p className="text-[10px] text-gray-400 mb-1">{request.date}</p>
        <button 
          className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100"
        >
          Review
        </button>
     </div>
  </div>
);

const SettingItem: React.FC<{ 
  label: string; 
  value: string; 
  isNew?: boolean; 
  onClick?: () => void;
}> = ({ label, value, isNew, onClick }) => (
  <div 
     onClick={onClick}
     className={`py-4 border-b border-gray-100 flex items-center justify-between ${onClick ? 'cursor-pointer hover:bg-gray-50 -mx-6 px-6 transition-colors' : ''}`}
  >
     <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
           <span className="text-xs text-gray-500">{label}</span>
           {isNew && (
              <span className="bg-red-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">NEW FEATURE</span>
           )}
        </div>
        <p className="text-base font-semibold text-gray-900">{value}</p>
     </div>
     <ChevronRight className="w-5 h-5 text-gray-300" />
  </div>
);

const StaffGroup: React.FC<{ title: string; list: Employee[]; onSelect: (e: Employee) => void }> = ({ title, list, onSelect }) => {
  if (list.length === 0) return null;
  return (
    <div>
      <h2 className="text-sm font-medium text-gray-500 mb-2">{title} ({list.length})</h2>
      <div className="space-y-3">
        {list.map(employee => (
          <StaffCard 
             key={employee.id} 
             employee={employee} 
             onClick={() => onSelect(employee)}
          />
        ))}
      </div>
    </div>
  );
};

const StaffCard: React.FC<{ employee: Employee; onClick?: () => void }> = ({ employee, onClick }) => (
  <div 
    onClick={onClick}
    className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm flex items-center gap-3 active:bg-gray-50 cursor-pointer"
  >
    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
      <User className="w-6 h-6 text-gray-400" />
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="text-gray-900 font-bold text-sm truncate">{employee.fullName}</h3>
      <p className="text-gray-400 text-xs truncate">Present</p>
    </div>
    <ChevronRight className="w-5 h-5 text-gray-300" />
  </div>
);

interface FeatureRowProps {
  icon: React.ReactNode;
  text: string;
  onClick: () => void;
  isNew?: boolean;
}

const FeatureRow: React.FC<FeatureRowProps> = ({ icon, text, onClick, isNew }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center gap-4 text-left group p-2 -mx-2 rounded-xl hover:bg-gray-50 transition-all active:scale-[0.98]"
  >
    <div className="flex-shrink-0 w-12 h-12 bg-teal-50 group-hover:bg-teal-100 rounded-full flex items-center justify-center transition-colors">
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-gray-800 font-medium text-base leading-tight">
        {text} 
        {isNew && <span className="ml-2 bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded align-middle">NEW</span>}
      </p>
    </div>
    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors" />
  </button>
);

const NavItem: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean;
  onClick: () => void; 
}> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${active ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
  >
    {icon}
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);
