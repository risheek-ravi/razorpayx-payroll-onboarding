
import React from 'react';
import { FileText, Banknote, CheckCircle2 } from 'lucide-react';
import { PayrollUsageType } from '../types';

interface UsageSelectionScreenProps {
  adminName: string;
  onSelect: (type: PayrollUsageType) => void;
  isSubmitting: boolean;
}

export const UsageSelectionScreen: React.FC<UsageSelectionScreenProps> = ({ adminName, onSelect, isSubmitting }) => {
  return (
    <div className="w-full max-w-md bg-white sm:shadow-lg sm:rounded-xl sm:overflow-hidden h-screen sm:h-auto flex flex-col mx-auto animate-in fade-in duration-300">
      
      {/* Header Area */}
      <div className="px-8 pt-12 pb-6">
        <h1 className="text-2xl font-bold text-gray-900 leading-tight">
          Hi <span className="text-blue-600">{adminName || 'Admin'}</span>,<br/> 
          how do you want to use our app?
        </h1>
      </div>

      {/* Options */}
      <div className="flex-1 px-6 space-y-4">
        
        <UsageOption 
          icon={<FileText className="w-8 h-8 text-teal-600" />}
          title="Calculate Salaries Only"
          description="Finalise payroll and receive salary register over email"
          onClick={() => onSelect('calculate_only')}
          color="bg-teal-50"
          borderColor="border-teal-100"
          disabled={isSubmitting}
        />

        <UsageOption 
          icon={<Banknote className="w-8 h-8 text-blue-600" />}
          title="Calculate and Pay Salaries"
          description="One-click salary payouts through bank transfers or UPI"
          onClick={() => onSelect('calculate_and_pay')}
          color="bg-blue-50"
          borderColor="border-blue-100"
          recommended
          disabled={isSubmitting}
        />

      </div>

      {/* Footer / Branding */}
      <div className="p-6 text-center text-xs text-gray-400">
        Secure & Automated Payroll by RazorpayX
      </div>

    </div>
  );
};

interface UsageOptionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  color: string;
  borderColor: string;
  recommended?: boolean;
  disabled?: boolean;
}

const UsageOption: React.FC<UsageOptionProps> = ({ icon, title, description, onClick, color, borderColor, recommended, disabled }) => {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full text-left relative p-5 rounded-xl border-2 transition-all duration-200 group
        ${disabled ? 'opacity-70 cursor-wait' : 'hover:shadow-md active:scale-[0.99]'}
        ${borderColor} bg-white
      `}
    >
      {recommended && (
        <div className="absolute -top-3 right-4 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
          RECOMMENDED
        </div>
      )}

      <div className="flex items-start gap-4">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ${color}`}>
          {icon}
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-blue-700 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </button>
  );
};
