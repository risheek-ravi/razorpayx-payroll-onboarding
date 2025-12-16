import React from 'react';

interface CycleDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (date: number) => void;
  selectedDate: number;
}

export const CycleDateModal: React.FC<CycleDateModalProps> = ({ isOpen, onClose, onSelect, selectedDate }) => {
  if (!isOpen) return null;

  const dates = Array.from({ length: 28 }, (_, i) => i + 1);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-sm bg-white rounded-lg shadow-xl p-6 animate-in zoom-in-95 duration-200">
        <h3 className="text-lg font-bold text-gray-900 mb-6 text-center">Select Salary Cycle Start Date</h3>
        
        <div className="grid grid-cols-5 gap-3 mb-2">
          {dates.map((date) => (
            <button
              key={date}
              onClick={() => {
                onSelect(date);
                onClose();
              }}
              className={`
                h-12 rounded-lg text-lg font-medium transition-colors
                ${selectedDate === date 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-blue-50 text-blue-900 hover:bg-blue-100'
                }
              `}
            >
              {date}
            </button>
          ))}
        </div>
        <p className="text-xs text-center text-gray-400 mt-4">
           Salary cycle starts on this day every month
        </p>
      </div>
    </div>
  );
};
