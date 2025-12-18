import React, { useState } from 'react';
import { X } from 'lucide-react';

interface ShiftTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: (type: 'fixed' | 'open' | 'rotational') => void;
}

export const ShiftTypeModal: React.FC<ShiftTypeModalProps> = ({ isOpen, onClose, onContinue }) => {
  const [selected, setSelected] = useState<'fixed' | 'open' | 'rotational'>('fixed');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300">
        
        <div className="flex items-center justify-between p-5 pb-2">
          <h2 className="text-xl font-bold text-gray-900">Select Shift Type</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <RadioOption 
            id="fixed"
            title="Fixed Shift"
            desc="Add and assign single shift to your staff who have fixed work timing"
            selected={selected === 'fixed'}
            onSelect={() => setSelected('fixed')}
          />
          <RadioOption 
            id="open"
            title="Open Shift"
            desc="Add and assign staff to open shifts, no predefined shift timings"
            selected={selected === 'open'}
            onSelect={() => setSelected('open')}
          />
          <RadioOption 
            id="rotational"
            title="Rotational Shift"
            desc="Add and assign shifts to your staff who have multiple shifts"
            selected={selected === 'rotational'}
            onSelect={() => setSelected('rotational')}
          />
        </div>

        <div className="p-5 pt-0">
          <button
            onClick={() => onContinue(selected)}
            className="w-full bg-gray-200 text-gray-900 font-semibold py-3.5 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

const RadioOption = ({ id, title, desc, selected, onSelect }: any) => (
  <div 
    onClick={onSelect}
    className={`
      flex gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all
      ${selected ? 'border-blue-600 bg-white' : 'border-gray-100 hover:border-gray-200'}
    `}
  >
    <div className={`mt-1 h-5 w-5 rounded-full border flex items-center justify-center flex-shrink-0 ${selected ? 'border-blue-600' : 'border-gray-400'}`}>
        {selected && <div className="h-2.5 w-2.5 rounded-full bg-blue-600" />}
    </div>
    <div>
      <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{desc}</p>
    </div>
  </div>
);
