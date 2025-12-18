
import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ChevronDown, CheckCircle, Calendar, Check, Upload, FileText } from 'lucide-react';
import { Employee } from '../types';
import { updateEmployee } from '../services/dbService';
import { InsightsView } from './EmployeeDetailView';
import { InputField } from './InputField';
import { CycleDateModal } from './CycleDateModal';

interface StaffProfileScreenProps {
  employee: Employee;
  onBack: () => void;
}

type Tab = 'Basic' | 'Professional' | 'Attendance' | 'Payment';

export const StaffProfileScreen: React.FC<StaffProfileScreenProps> = ({ employee, onBack }) => {
  const [activeTab, setActiveTab] = useState<Tab>('Basic');
  const [currentEmployee, setCurrentEmployee] = useState(employee);

  const handleUpdateEmployee = async (updatedData: Partial<Employee>) => {
    const updated = { ...currentEmployee, ...updatedData };
    try {
      await updateEmployee(updated);
      setCurrentEmployee(updated);
      alert('Updated Successfully');
    } catch (e) {
      alert('Failed to update');
    }
  };

  return (
    <div className="w-full max-w-md bg-white sm:shadow-lg sm:rounded-xl sm:overflow-hidden h-screen sm:h-auto flex flex-col mx-auto relative">
      
      {/* Header */}
      <div className="px-4 py-4 flex items-center border-b border-gray-100 shadow-sm bg-white sticky top-0 z-20">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-gray-100 mr-2 transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </button>
        <div>
           <h1 className="text-lg font-bold text-gray-900">Staff Profile</h1>
           <p className="text-xs text-gray-500">{currentEmployee.fullName} | {currentEmployee.type === 'full_time' ? 'Full Time' : 'Contract'}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-gray-200 bg-white z-10 no-scrollbar">
        {(['Basic', 'Professional', 'Attendance', 'Payment'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              px-6 py-3 text-sm font-semibold whitespace-nowrap transition-colors border-b-2
              ${activeTab === tab 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }
            `}
          >
            {tab} Details
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50 pb-20">
        
        {activeTab === 'Basic' && (
          <BasicDetailsTab 
            employee={currentEmployee} 
            onSave={handleUpdateEmployee} 
          />
        )}

        {activeTab === 'Professional' && (
           <ProfessionalTab 
             data={currentEmployee.professionalDetails || {}} 
             onSave={(data) => handleUpdateEmployee({ professionalDetails: data })}
           />
        )}

        {activeTab === 'Attendance' && (
           // Reuse InsightsView but hide its internal header to avoid double headers
           <div className="h-full">
             <InsightsView 
                employee={currentEmployee} 
                onBack={() => {}} // No back needed as it's embedded
                hideHeader
              />
           </div>
        )}

        {activeTab === 'Payment' && (
           <PaymentTab 
              data={currentEmployee.paymentDetails || {}} 
              onSave={(data) => handleUpdateEmployee({ paymentDetails: data })}
           />
        )}

      </div>
    </div>
  );
};

// --- Sub-components for Tabs ---

const BasicDetailsTab: React.FC<{ employee: Employee; onSave: (d: Partial<Employee>) => void }> = ({ employee, onSave }) => {
  const [formData, setFormData] = useState({
    fullName: employee.fullName,
    companyId: employee.companyId,
    phoneNumber: employee.phoneNumber,
    dob: employee.dob,
    gender: employee.gender,
    wageType: employee.wageType || 'Monthly',
    salaryAmount: employee.salaryAmount || '',
    weeklyOffs: employee.weeklyOffs || []
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <div className="p-4 space-y-4">
       <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
          <InputField 
             label="Full Name"
             value={formData.fullName}
             onChange={(e) => handleChange('fullName', e.target.value)}
          />
          <InputField 
             label="Company ID"
             value={formData.companyId}
             onChange={(e) => handleChange('companyId', e.target.value)}
          />
          <InputField 
             label="Phone Number"
             value={formData.phoneNumber}
             onChange={(e) => handleChange('phoneNumber', e.target.value)}
          />
          
          <div className="group relative w-full rounded-t-md bg-gray-100 px-4 py-2 border-b-2 border-gray-300 focus-within:border-blue-600 focus-within:bg-blue-50/30 transition-colors">
              <label className="block text-xs font-medium text-gray-500 mb-1">Date of Birth</label>
              <input 
                type="date"
                value={formData.dob}
                onChange={(e) => handleChange('dob', e.target.value)}
                className="block w-full border-none bg-transparent p-0 text-gray-900 focus:ring-0 sm:text-sm font-medium outline-none"
              />
          </div>

          <div className="relative w-full rounded-t-md bg-gray-100 px-4 py-2 border-b-2 border-gray-300 transition-colors">
              <label className="block text-xs font-medium text-gray-500 mb-1">Gender</label>
              <select 
                value={formData.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                className="block w-full border-none bg-transparent p-0 text-gray-900 focus:ring-0 sm:text-sm font-medium outline-none appearance-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
           </div>

           <div className="h-px bg-gray-100 my-2"></div>

           <div className="relative w-full rounded-t-md bg-gray-100 px-4 py-2 border-b-2 border-gray-300 transition-colors">
              <label className="block text-xs font-medium text-gray-500 mb-1">Wage Type</label>
              <select 
                value={formData.wageType}
                onChange={(e) => handleChange('wageType', e.target.value)}
                className="block w-full border-none bg-transparent p-0 text-gray-900 focus:ring-0 sm:text-sm font-medium outline-none appearance-none"
              >
                <option value="Monthly">Monthly</option>
                <option value="Daily">Daily</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
           </div>

           <InputField 
             label="Salary Amount"
             value={formData.salaryAmount}
             type="number"
             onChange={(e) => handleChange('salaryAmount', e.target.value)}
          />

          {/* Weekly Offs Selector */}
          <WeeklyOffSelect 
            selectedDays={formData.weeklyOffs}
            onChange={(days) => handleChange('weeklyOffs', days)}
          />

          <button 
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold mt-4 shadow-sm hover:bg-blue-700 active:scale-[0.98]"
          >
            Save Changes
          </button>
       </div>
    </div>
  );
};

const DAYS = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const WeeklyOffSelect: React.FC<{ selectedDays: string[]; onChange: (days: string[]) => void }> = ({ selectedDays, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDay = (day: string) => {
    const newDays = selectedDays.includes(day) 
       ? selectedDays.filter(d => d !== day) 
       : [...selectedDays, day];
    onChange(newDays);
  };

  const getDisplayText = () => {
    if (selectedDays.length === 0) return 'Select Days';
    if (selectedDays.length === 7) return 'All Days';
    return selectedDays.join(', ');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="group relative w-full rounded-t-md bg-gray-100 px-4 py-2 border-b-2 border-gray-300 hover:bg-gray-200 cursor-pointer transition-colors"
      >
          <label className="block text-xs font-medium text-gray-500 mb-1">Weekly Offs</label>
          <p className="text-sm font-semibold text-gray-900 truncate pr-6">{getDisplayText()}</p>
          <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-20 max-h-60 overflow-y-auto">
          {DAYS.map(day => (
            <div 
              key={day}
              onClick={() => toggleDay(day)}
              className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0"
            >
              <div className={`
                w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors flex-shrink-0
                ${selectedDays.includes(day) ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'}
              `}>
                {selectedDays.includes(day) && <Check className="w-3.5 h-3.5 text-white" />}
              </div>
              <span className="text-sm text-gray-700 font-medium">{day}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ProfessionalTab: React.FC<{ data: any; onSave: (d: any) => void }> = ({ data, onSave }) => {
  const [formData, setFormData] = useState({
    designation: data.designation || '',
    department: data.department || '',
    uanPf: data.uanPf || '',
    esicIp: data.esicIp || '',
    aadharNumber: data.aadharNumber || '',
    panNumber: data.panNumber || ''
  });

  return (
    <div className="p-4 space-y-4">
       <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <InputField 
             label="Designation"
             value={formData.designation}
             onChange={(e) => setFormData(p => ({...p, designation: e.target.value}))}
             placeholder="e.g. Senior Developer"
             className="mb-4"
          />
          <InputField 
             label="Department"
             value={formData.department}
             onChange={(e) => setFormData(p => ({...p, department: e.target.value}))}
             placeholder="e.g. Engineering"
             className="mb-4"
          />
          <InputField 
             label="UAN (PF)"
             value={formData.uanPf}
             onChange={(e) => setFormData(p => ({...p, uanPf: e.target.value}))}
             placeholder="12 Digit UAN"
             className="mb-4"
          />
          <InputField 
             label="ESIC IP"
             value={formData.esicIp}
             onChange={(e) => setFormData(p => ({...p, esicIp: e.target.value}))}
             placeholder="10 Digit ESIC IP"
             className="mb-4"
          />

          {/* Aadhar with Upload */}
          <div className="mb-4">
             <div className="flex items-end gap-2">
               <div className="flex-1">
                 <InputField 
                   label="Aadhar Number"
                   value={formData.aadharNumber}
                   onChange={(e) => setFormData(p => ({...p, aadharNumber: e.target.value}))}
                   placeholder="12 Digit Aadhar"
                   className="mb-0"
                 />
               </div>
               <button className="h-[54px] w-[54px] flex items-center justify-center bg-gray-100 border-b-2 border-gray-300 rounded-t-md hover:bg-gray-200 transition-colors">
                  <Upload className="w-5 h-5 text-gray-600" />
               </button>
             </div>
             <p className="text-xs text-gray-400 mt-1 ml-1">Upload Aadhar Card (Max 2MB)</p>
          </div>

          {/* PAN with Upload */}
          <div className="mb-6">
             <div className="flex items-end gap-2">
               <div className="flex-1">
                 <InputField 
                   label="PAN Number"
                   value={formData.panNumber}
                   onChange={(e) => setFormData(p => ({...p, panNumber: e.target.value.toUpperCase()}))}
                   placeholder="10 Digit PAN"
                   className="mb-0"
                 />
               </div>
               <button className="h-[54px] w-[54px] flex items-center justify-center bg-gray-100 border-b-2 border-gray-300 rounded-t-md hover:bg-gray-200 transition-colors">
                  <Upload className="w-5 h-5 text-gray-600" />
               </button>
             </div>
             <p className="text-xs text-gray-400 mt-1 ml-1">Upload PAN Card (Max 2MB)</p>
          </div>

          <button 
            onClick={() => onSave(formData)}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold mt-2"
          >
            Save Professional Details
          </button>
       </div>
    </div>
  );
};

const PaymentTab: React.FC<{ data: any; onSave: (d: any) => void }> = ({ data, onSave }) => {
  const [formData, setFormData] = useState({
    upiId: data.upiId || '',
    accountHolderName: data.accountHolderName || '',
    accountNumber: data.accountNumber || '',
    ifsc: data.ifsc || '',
    paymentMode: data.paymentMode || 'NEFT'
  });

  return (
    <div className="p-4 space-y-4">
       
       <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {/* Payment Mode First */}
          <div className="mb-6">
            <label className="block text-xs font-medium text-gray-500 mb-1">Preferred Payment Mode</label>
            <div className="relative">
              <select
                 value={formData.paymentMode}
                 onChange={(e) => setFormData(p => ({...p, paymentMode: e.target.value}))}
                 className="block w-full appearance-none rounded-t-md bg-blue-50/50 px-4 py-3 border-b-2 border-blue-500 text-blue-900 font-bold outline-none text-sm transition-colors"
              >
                 <option value="NEFT">Bank Transfer (NEFT)</option>
                 <option value="IMPS">Bank Transfer (IMPS)</option>
                 <option value="UPI">UPI</option>
                 <option value="Cash">Cash</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 pointer-events-none" />
            </div>
          </div>

          <div className="h-px bg-gray-100 my-4"></div>

          {/* UPI Section */}
          <h3 className="text-sm font-bold text-gray-900 mb-3">UPI Details</h3>
          <InputField 
             label="UPI ID"
             value={formData.upiId}
             onChange={(e) => setFormData(p => ({...p, upiId: e.target.value}))}
             placeholder="e.g. user@okhdfcbank"
             className="mb-6"
          />

          <div className="h-px bg-gray-100 my-4"></div>

          {/* Bank Details Section */}
          <h3 className="text-sm font-bold text-gray-900 mb-3">Bank Account Details</h3>
          
          <InputField 
             label="Account Holder Name"
             value={formData.accountHolderName}
             onChange={(e) => setFormData(p => ({...p, accountHolderName: e.target.value}))}
             placeholder="e.g. John Doe"
             className="mb-4"
          />
          
          <InputField 
             label="Account Number"
             value={formData.accountNumber}
             onChange={(e) => setFormData(p => ({...p, accountNumber: e.target.value}))}
             type="number"
             placeholder="0000000000"
             className="mb-4"
          />

          <InputField 
             label="IFSC Code"
             value={formData.ifsc}
             onChange={(e) => setFormData(p => ({...p, ifsc: e.target.value.toUpperCase()}))}
             placeholder="e.g. HDFC0001234"
             className="mb-2"
          />
       </div>

       <button 
          onClick={() => onSave(formData)}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold shadow-sm hover:bg-blue-700 active:scale-95 transition-all"
       >
          Save Payment Details
       </button>
    </div>
  );
};
