
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, ChevronDown } from 'lucide-react';
import { InputField } from './InputField';
import { StaffType, Employee } from '../types';
import { CycleDateModal } from './CycleDateModal';

interface AddStaffScreenProps {
  staffType: StaffType;
  businessId: string | null;
  onBack: () => void;
  onNext: (data: Partial<Employee>) => void;
}

export const AddStaffScreen: React.FC<AddStaffScreenProps> = ({ staffType, businessId, onBack, onNext }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    companyId: '',
    phoneNumber: '',
    dob: '',
    gender: 'Male',
  });

  const isFormValid = 
    formData.fullName.trim() !== '' &&
    formData.companyId.trim() !== '' &&
    formData.phoneNumber.trim().length >= 10 && 
    formData.dob.trim() !== '' &&
    formData.gender.trim() !== '';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!isFormValid || !businessId) return;
    
    // Pass collected data to next step
    onNext({
      businessId,
      type: staffType,
      ...formData,
      salaryCycleDate: 1, // Defaulting hidden fields
      salaryAccess: 'Disable access' // Defaulting hidden fields
    });
  };

  const title = staffType === 'full_time' ? 'Add Full Time Staff' : 'Add Contractual Staff';

  return (
    <div className="w-full max-w-md bg-white sm:shadow-lg sm:rounded-xl sm:overflow-hidden h-screen sm:h-auto flex flex-col mx-auto">
      
      {/* Header */}
      <div className="px-4 py-4 flex items-center border-b border-gray-100 shadow-sm relative z-10">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors mr-2"
        >
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">{title}</h1>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-6 pb-24">
        
        {/* Staff Full Name */}
        <InputField 
          label="Staff Full Name"
          name="fullName"
          value={formData.fullName}
          onChange={handleInputChange}
          placeholder="e.g. Rahul Kumar"
          className="mb-5"
        />

        {/* Company ID */}
        <InputField 
          label="Staff Company ID"
          name="companyId"
          value={formData.companyId}
          onChange={handleInputChange}
          placeholder="e.g. 0012"
          className="mb-5"
        />
        <p className="text-xs text-gray-400 -mt-4 mb-5 ml-1">Last Added Staff Id: 001</p>

        {/* Phone Number */}
        <InputField 
          label="Phone Number"
          name="phoneNumber"
          type="tel"
          value={formData.phoneNumber}
          onChange={handleInputChange}
          placeholder="+91 0000000000"
          className="mb-5"
        />

        {/* DOB */}
        <div className="mb-5">
           <div className="group relative w-full rounded-t-md bg-gray-100 px-4 py-2 border-b-2 border-gray-300 focus-within:border-blue-600 focus-within:bg-blue-50/30 transition-colors">
              <label className="block text-xs font-medium text-gray-500 mb-1">Date of Birth</label>
              <input 
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleInputChange}
                className="block w-full border-none bg-transparent p-0 text-gray-900 focus:ring-0 sm:text-sm font-medium outline-none"
              />
           </div>
        </div>

        {/* Gender */}
        <div className="mb-8">
           <div className="relative w-full rounded-t-md bg-gray-100 px-4 py-2 border-b-2 border-gray-300 transition-colors">
              <label className="block text-xs font-medium text-gray-500 mb-1">Gender</label>
              <select 
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="block w-full border-none bg-transparent p-0 text-gray-900 focus:ring-0 sm:text-sm font-medium outline-none appearance-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
           </div>
        </div>

        <p className="text-center text-xs text-gray-400">
           By continuing you agree to <a href="#" className="text-blue-600 font-medium">Terms & Conditions</a>
        </p>

      </div>

      {/* Footer Button */}
      <div className="p-4 border-t border-gray-100 bg-white">
        <button
          onClick={handleSubmit}
          disabled={!isFormValid}
          className={`
            w-full py-3.5 rounded-lg font-semibold text-lg transition-all shadow-sm
            ${!isFormValid 
               ? 'bg-blue-200 text-white cursor-not-allowed' 
               : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98]'
            }
          `}
        >
          Onboard Staff
        </button>
      </div>

    </div>
  );
};
