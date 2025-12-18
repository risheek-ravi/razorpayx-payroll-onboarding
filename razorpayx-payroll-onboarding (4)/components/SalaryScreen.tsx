import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { TimePicker } from './TimePicker';
import { SalaryConfig } from '../types';

interface SalaryScreenProps {
  onBack: () => void;
  onContinue: (data: SalaryConfig) => void;
  isSubmitting: boolean;
}

export const SalaryScreen: React.FC<SalaryScreenProps> = ({ onBack, onContinue, isSubmitting }) => {
  const [method, setMethod] = useState<SalaryConfig['calculationMethod'] | null>(null);
  const [shiftHours, setShiftHours] = useState({ hours: 8, minutes: 0 });
  const [showTimePicker, setShowTimePicker] = useState(false);

  const formatTime = (h: number, m: number) => {
    const hh = h.toString().padStart(2, '0');
    const mm = m.toString().padStart(2, '0');
    return `${hh}:${mm} Hrs`;
  };

  const handleContinue = () => {
    if (method) {
      onContinue({
        calculationMethod: method,
        shiftHours
      });
    }
  };

  const isFormValid = method !== null;

  return (
    <div className="w-full max-w-md bg-white sm:shadow-lg sm:rounded-xl sm:overflow-hidden h-screen sm:h-auto flex flex-col mx-auto">
      
      {/* Header */}
      <div className="px-6 pt-6 pb-2 flex items-center">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <h1 className="text-xl font-bold text-gray-900 mb-6">
          How do you calculate monthly salary
        </h1>

        <div className="space-y-4 mb-8">
          <RadioCard
            selected={method === 'calendar_month'}
            onClick={() => setMethod('calendar_month')}
            title="Calendar Month"
            description="Ex: March - 31 days, April - 30 Days etc (Per day salary = Salary/No. of days in month)"
          />
          <RadioCard
            selected={method === 'fixed_30_days'}
            onClick={() => setMethod('fixed_30_days')}
            title="Every Month 30 Days"
            description="Ex: March - 30 days, April - 30 Days etc (Per day salary = Salary/30)"
          />
          <RadioCard
            selected={method === 'exclude_weekly_offs'}
            onClick={() => setMethod('exclude_weekly_offs')}
            title="Exclude Weekly Offs"
            description="Ex: Month with 31 days and 4 weekly-offs will have 27 payable days (Per day salary = Salary/Payable Days)"
          />
        </div>

        <div className="mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-3">
            How many hours does your staff work in a shift
          </h2>
          <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between border border-gray-200">
             <div>
                <p className="text-xs text-gray-500 mb-1">Shift Hours</p>
                <p className="text-lg font-medium text-gray-900">{formatTime(shiftHours.hours, shiftHours.minutes)}</p>
             </div>
             <button 
               onClick={() => setShowTimePicker(true)}
               className="text-blue-600 font-semibold text-sm px-3 py-1 hover:bg-blue-50 rounded"
             >
               Edit
             </button>
          </div>
        </div>
      </div>

      <div className="p-6 pt-2 bg-white border-t border-gray-100">
        <button
          onClick={handleContinue}
          disabled={!isFormValid || isSubmitting}
          className={`
            w-full rounded-md py-3.5 font-semibold text-lg shadow-sm transition-all flex items-center justify-center gap-2
            ${!isFormValid 
              ? 'bg-blue-300 text-white cursor-not-allowed' 
              : isSubmitting 
                ? 'bg-blue-400 text-white cursor-wait'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98]'
            }
          `}
        >
          {isSubmitting ? 'Saving...' : 'Continue'}
          {!isSubmitting && <span className="text-xl">→</span>}
        </button>
      </div>

      {showTimePicker && (
        <TimePicker
          initialHours={shiftHours.hours}
          initialMinutes={shiftHours.minutes}
          onSave={(h, m) => {
            setShiftHours({ hours: h, minutes: m });
            setShowTimePicker(false);
          }}
          onCancel={() => setShowTimePicker(false)}
        />
      )}
    </div>
  );
};

interface RadioCardProps {
  selected: boolean;
  onClick: () => void;
  title: string;
  description: string;
}

const RadioCard: React.FC<RadioCardProps> = ({ selected, onClick, title, description }) => (
  <div 
    onClick={onClick}
    className={`
      relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
      ${selected ? 'border-blue-600 bg-blue-50/20' : 'border-gray-200 hover:border-gray-300'}
    `}
  >
    <div className="flex items-start gap-3">
      <div className={`mt-1 h-5 w-5 rounded-full border flex items-center justify-center flex-shrink-0 ${selected ? 'border-blue-600' : 'border-gray-400'}`}>
        {selected && <div className="h-2.5 w-2.5 rounded-full bg-blue-600" />}
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 text-sm mb-1">{title}</h3>
        <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
      </div>
    </div>
  </div>
);
