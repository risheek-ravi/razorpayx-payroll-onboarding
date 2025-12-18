
import React, { useState } from 'react';
import { ArrowLeft, ChevronDown, X } from 'lucide-react';
import { Employee } from '../types';

interface AddSalaryScreenProps {
  onBack: () => void;
  onPreview: (data: { wageType: NonNullable<Employee['wageType']>; salaryAmount: string }) => void;
  isSubmitting?: boolean;
}

type WageType = 'Monthly' | 'Daily';

export const AddSalaryScreen: React.FC<AddSalaryScreenProps> = ({ onBack, onPreview, isSubmitting }) => {
  const [wageType, setWageType] = useState<WageType>('Monthly');
  const [salaryAmount, setSalaryAmount] = useState<string>('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  
  // Controls validation state
  const isValid = salaryAmount.trim() !== '' && !isNaN(Number(salaryAmount)) && Number(salaryAmount) > 0;

  const handlePreviewClick = () => {
    if (isValid) {
      setShowPreviewModal(true);
    }
  };

  const handleContinue = () => {
    setShowPreviewModal(false);
    onPreview({
      wageType,
      salaryAmount
    });
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(val);
  };

  return (
    <div className="w-full max-w-md bg-white sm:shadow-lg sm:rounded-xl sm:overflow-hidden h-screen sm:h-auto flex flex-col mx-auto relative">
      
      {/* Header */}
      <div className="px-4 py-4 flex items-center shadow-sm relative z-10 bg-white">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors mr-2"
        >
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Add staff's salary</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        
        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-5">
          
          {/* Wage Type */}
          <div className="space-y-1">
            <label className="block text-xs text-gray-500">Wage Type</label>
            <div className="relative">
              <select
                value={wageType}
                onChange={(e) => setWageType(e.target.value as WageType)}
                className="block w-full rounded-lg border border-gray-300 bg-white py-3 px-3 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none text-sm font-medium"
              >
                <option value="Monthly">Monthly</option>
                <option value="Daily">Daily</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Salary Template */}
          <div className="space-y-1">
             <label className="block text-xs text-gray-500">Salary Template</label>
             <div className="relative">
                <select
                  disabled
                  className="block w-full rounded-lg border border-gray-200 bg-gray-50 py-3 px-3 text-gray-500 appearance-none text-sm font-medium cursor-not-allowed"
                >
                  <option>Default ({wageType})</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
             </div>
          </div>

          {/* Monthly Salary Input */}
          <div className="p-4 bg-white rounded-lg border border-gray-200">
             <div className="space-y-2">
                <label className="block text-xs text-gray-500">{wageType === 'Monthly' ? 'Monthly Salary' : 'Daily Salary'}</label>
                <div className="relative bg-white rounded-md border border-gray-200 shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-900 font-semibold text-sm">₹</span>
                    <input 
                      type="number"
                      value={salaryAmount}
                      onChange={(e) => setSalaryAmount(e.target.value)}
                      placeholder="0.00"
                      className="block w-full py-2.5 pl-7 pr-4 rounded-md border-none bg-white focus:ring-0 text-gray-900 font-semibold placeholder-gray-300 text-sm"
                    />
                </div>
             </div>
          </div>

        </div>

      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 bg-white">
        <button
          onClick={handlePreviewClick}
          disabled={!isValid || isSubmitting}
          className={`
            w-full py-3.5 rounded-lg font-semibold text-lg transition-all shadow-sm
            ${!isValid 
               ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
               : isSubmitting
                 ? 'bg-blue-400 text-white cursor-wait'
                 : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98]'
            }
          `}
        >
          Preview
        </button>
      </div>

      {/* Calculation Preview Modal */}
      <PreviewModal 
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        onContinue={handleContinue}
        wageType={wageType}
        amount={Number(salaryAmount)}
        isSubmitting={isSubmitting}
      />

    </div>
  );
};

// Helper Components for Preview Modal

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  wageType: WageType;
  amount: number;
  isSubmitting?: boolean;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ isOpen, onClose, onContinue, wageType, amount, isSubmitting }) => {
  if (!isOpen) return null;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const label = wageType === 'Monthly' ? 'Monthly' : 'Daily';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-white rounded-t-2xl shadow-xl overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Calculation Preview</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Table Header */}
        <div className="flex justify-between px-6 py-3 bg-gray-50/80 border-b border-gray-100">
           <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Components</span>
           <span className="text-xs font-semibold text-blue-400 uppercase tracking-wide">Amount</span>
        </div>

        {/* List Content */}
        <div className="p-6 pt-4 space-y-4">
          <div>
            <p className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">EARNINGS</p>
            <div className="flex justify-between items-center text-sm mb-3">
               <span className="text-gray-600 font-medium">{label}</span>
               <span className="text-gray-900 font-medium">{formatCurrency(amount)}</span>
            </div>
            
            <div className="h-px bg-gray-100 my-2"></div>

            <div className="flex justify-between items-center text-sm font-bold">
               <span className="text-gray-900">Total</span>
               <span className="text-gray-900">{formatCurrency(amount)}</span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 flex justify-between items-center font-bold text-sm">
             <span className="text-gray-900">CTC</span>
             <span className="text-gray-900">{formatCurrency(amount)}</span>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-4 pt-0">
          <button
            onClick={onContinue}
            disabled={isSubmitting}
            className={`
              w-full py-3.5 rounded-lg font-semibold text-lg transition-all shadow-sm
              ${isSubmitting 
                ? 'bg-blue-400 text-white cursor-wait'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98]'
              }
            `}
          >
            {isSubmitting ? 'Saving...' : 'Continue'}
          </button>
        </div>
        
      </div>
    </div>
  );
};
