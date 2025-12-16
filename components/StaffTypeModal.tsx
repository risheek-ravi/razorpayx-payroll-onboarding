import React, { useState } from 'react';
import { X, Briefcase, FileClock } from 'lucide-react';
import { StaffType } from '../types';

interface StaffTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: (type: StaffType) => void;
}

export const StaffTypeModal: React.FC<StaffTypeModalProps> = ({ isOpen, onClose, onContinue }) => {
  const [selected, setSelected] = useState<StaffType | null>(null);

  if (!isOpen) return null;

  const handleContinue = () => {
    if (selected) {
      onContinue(selected);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-sm bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-2">
          <h2 className="text-xl font-bold text-gray-900">Select Staff Type</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <SelectionCard 
              isSelected={selected === 'full_time'}
              onClick={() => setSelected('full_time')}
              title="Full Time Employee"
              icon={<Briefcase className="w-10 h-10 text-orange-500" />}
              bgColor="bg-orange-50"
            />
            <SelectionCard 
              isSelected={selected === 'contract'}
              onClick={() => setSelected('contract')}
              title="Contract Employee"
              icon={<FileClock className="w-10 h-10 text-teal-600" />}
              bgColor="bg-teal-50"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0">
          <button
            onClick={handleContinue}
            disabled={!selected}
            className={`
              w-full py-3.5 rounded-lg font-semibold text-lg transition-all duration-200
              ${selected 
                ? 'bg-blue-600 text-white shadow-lg hover:bg-blue-700 active:scale-[0.98]' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

interface SelectionCardProps {
  isSelected: boolean;
  onClick: () => void;
  title: string;
  icon: React.ReactNode;
  bgColor: string;
}

const SelectionCard: React.FC<SelectionCardProps> = ({ isSelected, onClick, title, icon, bgColor }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center text-center gap-4 transition-all duration-200
        ${isSelected 
          ? 'border-blue-600 bg-blue-50/10 shadow-md transform scale-[1.02]' 
          : 'border-gray-100 bg-white hover:border-gray-200 shadow-sm'
        }
      `}
    >
      <div className={`w-24 h-24 rounded-full ${bgColor} flex items-center justify-center mb-1`}>
        {icon}
      </div>
      <p className={`text-sm font-medium ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
        {title}
      </p>
    </div>
  );
};