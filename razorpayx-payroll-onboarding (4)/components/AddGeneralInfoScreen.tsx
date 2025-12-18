import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ChevronDown, Check } from 'lucide-react';

interface AddGeneralInfoScreenProps {
  onBack: () => void;
  onSave: (weeklyOffs: string[]) => void;
  isSubmitting: boolean;
}

// Order: Sat through Friday as requested
const DAYS = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const AddGeneralInfoScreen: React.FC<AddGeneralInfoScreenProps> = ({ onBack, onSave, isSubmitting }) => {
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
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
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const getDisplayText = () => {
    if (selectedDays.length === 0) return 'Select Days';
    if (selectedDays.length === 7) return 'All Days';
    return selectedDays.join(', ');
  };

  return (
    <div className="w-full max-w-md bg-white sm:shadow-lg sm:rounded-xl sm:overflow-hidden h-screen sm:h-auto flex flex-col mx-auto relative">
      {/* Header */}
      <div className="px-4 py-4 flex items-center shadow-sm relative z-10 bg-white border-b border-gray-100">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors mr-2"
        >
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Add General Info</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50" onClick={() => setIsOpen(false)}>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 min-h-[200px]" onClick={(e) => e.stopPropagation()}>
          <label className="block text-xs text-gray-500 mb-2 ml-1">Weekly Off</label>
          
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`
                w-full text-left bg-white border rounded-lg px-4 py-3 flex items-center justify-between transition-all outline-none
                ${isOpen ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-300'}
              `}
            >
              <span className={`text-sm font-medium truncate pr-6 ${selectedDays.length ? 'text-gray-900' : 'text-gray-400'}`}>
                {getDisplayText()}
              </span>
              <ChevronDown className={`w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

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
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 bg-white">
        <button
          onClick={() => onSave(selectedDays)}
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
  );
};
