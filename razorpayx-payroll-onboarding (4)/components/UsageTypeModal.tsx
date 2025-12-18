
import React from 'react';
import { X, FileText, Banknote, Check } from 'lucide-react';
import { PayrollUsageType } from '../types';

interface UsageTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentType?: PayrollUsageType;
  onSave: (type: PayrollUsageType) => void;
}

export const UsageTypeModal: React.FC<UsageTypeModalProps> = ({ isOpen, onClose, currentType, onSave }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-sm bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300">
        
        <div className="flex items-center justify-between p-6 pb-2">
          <h2 className="text-xl font-bold text-gray-900">App Usage Mode</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <ModalOption 
            type="calculate_only"
            currentType={currentType}
            icon={<FileText className="w-6 h-6 text-teal-600" />}
            title="Calculate Salaries Only"
            desc="When you execute payroll, RazorpayX Payroll will generate salary register with staff payment details"
            onSelect={() => onSave('calculate_only')}
          />
          <ModalOption 
             type="calculate_and_pay"
             currentType={currentType}
             icon={<Banknote className="w-6 h-6 text-blue-600" />}
             title="Calculate & Pay"
             desc="When you execute payroll, RazorpayX Payroll will generate salary register and make direct payouts to staff using bank transfer or UPI"
             onSelect={() => onSave('calculate_and_pay')}
          />
        </div>
      </div>
    </div>
  );
};

const ModalOption = ({ type, currentType, icon, title, desc, onSelect }: any) => {
  const isSelected = currentType === type;
  return (
    <div 
      onClick={onSelect}
      className={`
        flex items-start justify-between p-4 rounded-xl border-2 cursor-pointer transition-all
        ${isSelected ? 'border-blue-600 bg-blue-50/30' : 'border-gray-100 hover:border-gray-200'}
      `}
    >
      <div className="flex items-start gap-4 flex-1">
         <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-white shadow-sm border border-gray-100 flex-shrink-0`}>
            {icon}
         </div>
         <div className="pt-1">
            <h3 className={`font-bold text-sm mb-1 ${isSelected ? 'text-blue-800' : 'text-gray-900'}`}>{title}</h3>
            <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
         </div>
      </div>
      {isSelected && (
         <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-3 ml-2">
            <Check className="w-4 h-4 text-white" />
         </div>
      )}
    </div>
  );
}
