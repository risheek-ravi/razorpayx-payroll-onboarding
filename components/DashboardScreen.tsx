import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, 
  MessageCircle, 
  Hand, 
  Calculator, 
  FileText, 
  UserPlus, 
  Users, 
  CalendarCheck, 
  Settings,
  Smartphone,
  ChevronRight,
  User,
  Home
} from 'lucide-react';
import { StaffTypeModal } from './StaffTypeModal';
import { logStaffSelection, getEmployees } from '../services/dbService';
import { StaffType, Employee } from '../types';

interface DashboardScreenProps {
  businessName: string;
  onAddStaff: (type: StaffType) => void;
}

type Tab = 'home' | 'staff' | 'attendance' | 'settings';

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ businessName, onAddStaff }) => {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch employees when component mounts or active tab changes to Staff
  useEffect(() => {
    loadEmployees();
  }, [activeTab]);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaffClick = () => {
    setShowStaffModal(true);
  };

  const handleStaffTypeSelected = async (type: StaffType) => {
    await logStaffSelection(type);
    setShowStaffModal(false);
    onAddStaff(type);
  };

  // Group employees by Wage Type
  const groupedEmployees = {
    Monthly: employees.filter(e => e.wageType === 'Monthly'),
    Daily: employees.filter(e => e.wageType === 'Daily'),
    Hourly: employees.filter(e => e.wageType === 'Per Hour Basis'),
  };

  return (
    <div className="w-full max-w-md bg-gray-50 h-screen sm:h-[800px] sm:shadow-xl sm:rounded-xl sm:overflow-hidden flex flex-col mx-auto relative">
      
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between shadow-sm z-10 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold text-gray-900 truncate max-w-[200px]">{businessName}</h1>
          <ChevronDown className="w-5 h-5 text-gray-500" />
        </div>
        <button className="flex items-center gap-1 text-blue-600 font-medium text-sm">
          Help
          <MessageCircle className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pb-20">
        
        {/* --- TAB: HOME --- */}
        {activeTab === 'home' && (
          <div className="p-4 space-y-4">
            {/* Quick Actions / Features Card */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Quick Actions</h2>
              <div className="space-y-4 mb-6">
                <FeatureRow 
                  icon={<Hand className="w-6 h-6 text-teal-600" />}
                  text="Mark daily attendance of your staff"
                  onClick={() => setActiveTab('attendance')}
                />
                <FeatureRow 
                  icon={<Calculator className="w-6 h-6 text-teal-600" />}
                  text="Auto salary calculation based on attendance"
                  onClick={() => {}}
                />
                <FeatureRow 
                  icon={<FileText className="w-6 h-6 text-teal-600" />}
                  text="Send salary slips via whatsapp & sms"
                  onClick={() => {}}
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
                {/* Simple Phone Graphic Representation */}
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

        {/* --- TAB: STAFF --- */}
        {activeTab === 'staff' && (
          <div className="p-4 space-y-4">
            {/* Add Staff Button */}
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
                {/* Monthly Staff Group */}
                <StaffGroup title="Monthly" list={groupedEmployees.Monthly} />
                
                {/* Daily Staff Group */}
                <StaffGroup title="Daily" list={groupedEmployees.Daily} />
                
                {/* Hourly Staff Group */}
                <StaffGroup title="Hourly" list={groupedEmployees.Hourly} />
              </>
            )}
          </div>
        )}

        {/* --- TAB: ATTENDANCE --- */}
        {activeTab === 'attendance' && (
          <div className="p-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
               <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CalendarCheck className="w-8 h-8 text-teal-600" />
               </div>
               <h3 className="text-lg font-bold text-gray-900 mb-2">Attendance</h3>
               <p className="text-gray-500 text-sm mb-6">
                 Mark attendance for your {employees.length} employees here.
               </p>
               <button 
                 className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700"
                 onClick={() => {}}
               >
                 Mark Today's Attendance
               </button>
            </div>
          </div>
        )}

        {/* --- TAB: SETTINGS --- */}
        {activeTab === 'settings' && (
          <div className="flex items-center justify-center h-64 text-gray-400">
            <div className="text-center">
              <Settings className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p>Settings coming soon</p>
            </div>
          </div>
        )}
        
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-16 flex items-center justify-around px-2 pb-safe z-20">
        <NavItem 
          icon={<Home className="w-6 h-6" />} 
          label="Home" 
          active={activeTab === 'home'} 
          onClick={() => setActiveTab('home')}
        />
        <NavItem 
          icon={<Users className="w-6 h-6" />} 
          label="Staff" 
          active={activeTab === 'staff'} 
          onClick={() => setActiveTab('staff')}
        />
        <NavItem 
          icon={<CalendarCheck className="w-6 h-6" />} 
          label="Attendance" 
          active={activeTab === 'attendance'}
          onClick={() => setActiveTab('attendance')}
        />
        <NavItem 
          icon={<Settings className="w-6 h-6" />} 
          label="Settings" 
          active={activeTab === 'settings'}
          onClick={() => setActiveTab('settings')}
        />
      </div>

      {/* Staff Type Selection Modal */}
      <StaffTypeModal 
        isOpen={showStaffModal} 
        onClose={() => setShowStaffModal(false)}
        onContinue={handleStaffTypeSelected}
      />
    </div>
  );
};

// Helper Components

const StaffGroup: React.FC<{ title: string; list: Employee[] }> = ({ title, list }) => {
  if (list.length === 0) return null;
  return (
    <div>
      <h2 className="text-sm font-medium text-gray-500 mb-2">{title} ({list.length})</h2>
      <div className="space-y-3">
        {list.map(employee => (
          <StaffCard key={employee.id} employee={employee} />
        ))}
      </div>
    </div>
  );
};

const StaffCard: React.FC<{ employee: Employee }> = ({ employee }) => (
  <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm flex items-center gap-3">
    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
      <User className="w-6 h-6 text-gray-400" />
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="text-gray-900 font-bold text-sm truncate">{employee.fullName}</h3>
      <p className="text-gray-400 text-xs truncate">Present</p>
    </div>
  </div>
);

interface FeatureRowProps {
  icon: React.ReactNode;
  text: string;
  onClick: () => void;
}

const FeatureRow: React.FC<FeatureRowProps> = ({ icon, text, onClick }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center gap-4 text-left group p-2 -mx-2 rounded-xl hover:bg-gray-50 transition-all active:scale-[0.98]"
  >
    <div className="flex-shrink-0 w-12 h-12 bg-teal-50 group-hover:bg-teal-100 rounded-full flex items-center justify-center transition-colors">
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-gray-800 font-medium text-base leading-tight">{text}</p>
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
