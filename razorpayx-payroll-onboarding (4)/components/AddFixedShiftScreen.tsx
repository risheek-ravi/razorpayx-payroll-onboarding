
import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { InputField } from './InputField';
import { Shift } from '../types';
import { updateShift } from '../services/dbService';
import { TimePicker } from './TimePicker';

interface AddFixedShiftScreenProps {
  onBack: () => void;
  onContinue: (shiftData: Omit<Shift, 'id'>) => void;
  initialData?: Shift; // For Edit Mode
}

export const AddFixedShiftScreen: React.FC<AddFixedShiftScreenProps> = ({ onBack, onContinue, initialData }) => {
  const [shiftName, setShiftName] = useState(initialData?.name || '');
  const [startTime, setStartTime] = useState(initialData?.startTime || '10:00 AM');
  const [endTime, setEndTime] = useState(initialData?.endTime || '06:00 PM');
  const [breakMinutes, setBreakMinutes] = useState<string>(initialData?.breakMinutes ? String(initialData.breakMinutes) : ''); 
  const [payableHours, setPayableHours] = useState('0 hr');
  const [isSaving, setIsSaving] = useState(false);
  
  const [pickerConfig, setPickerConfig] = useState<{ show: boolean; target: 'start' | 'end'; initialH: number; initialM: number } | null>(null);

  useEffect(() => {
    calculatePayableHours();
  }, [startTime, endTime, breakMinutes]);

  const parseTime = (timeStr: string) => {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (hours === 12 && modifier === 'AM') hours = 0;
    if (modifier === 'PM' && hours !== 12) hours += 12;
    return { hours, minutes };
  };

  const calculatePayableHours = () => {
    const start = parseTime(startTime);
    const end = parseTime(endTime);
    
    let startMins = start.hours * 60 + start.minutes;
    let endMins = end.hours * 60 + end.minutes;

    // Handle overnight shifts (e.g., 10 PM to 6 AM)
    if (endMins < startMins) {
      endMins += 24 * 60;
    }

    let diffMinutes = endMins - startMins;
    
    // Subtract break
    if (breakMinutes && !isNaN(Number(breakMinutes))) {
      diffMinutes -= Number(breakMinutes);
    }

    if (diffMinutes < 0) diffMinutes = 0;

    const h = Math.floor(diffMinutes / 60);
    const m = diffMinutes % 60;
    
    if (m > 0) {
      setPayableHours(`${h} hr ${m} min`);
    } else {
      setPayableHours(`${h} hr`);
    }
  };

  const handleTimeClick = (target: 'start' | 'end') => {
    const timeStr = target === 'start' ? startTime : endTime;
    const { hours, minutes } = parseTime(timeStr);
    setPickerConfig({ show: true, target, initialH: hours, initialM: minutes });
  };

  const handleTimeSave = (h: number, m: number) => {
    if (!pickerConfig) return;
    
    const date = new Date();
    date.setHours(h);
    date.setMinutes(m);
    const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }); // e.g., "10:00 AM"

    if (pickerConfig.target === 'start') {
      setStartTime(timeStr);
    } else {
      setEndTime(timeStr);
    }
    setPickerConfig(null);
  };

  const handleContinue = async () => {
    if (!shiftName.trim()) return;
    
    const shiftData = {
      name: shiftName,
      type: 'fixed' as const,
      startTime,
      endTime,
      breakMinutes: Number(breakMinutes) || 0
    };

    if (initialData) {
      // Update Mode
      setIsSaving(true);
      try {
        await updateShift({ ...shiftData, id: initialData.id });
        onBack(); // Go back to list after update
      } catch (e) {
        alert('Failed to update shift');
      } finally {
        setIsSaving(false);
      }
    } else {
      // Create Mode
      onContinue(shiftData);
    }
  };

  return (
    <div className="w-full max-w-md bg-white sm:shadow-lg sm:rounded-xl sm:overflow-hidden h-screen sm:h-auto flex flex-col mx-auto relative">
      <div className="px-4 py-4 flex items-center shadow-sm relative z-10 bg-white">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-gray-100 mr-2">
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">{initialData ? 'Update Fixed Shift' : 'Add Fixed Shift'}</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-white">
        
        <InputField 
          label="Shift Name"
          value={shiftName}
          onChange={(e) => setShiftName(e.target.value)}
          placeholder="e.g. General Shift"
          className="mb-6"
        />

        {/* Time Selectors */}
        <div className="space-y-4 mb-6">
          <div onClick={() => handleTimeClick('start')} className="cursor-pointer">
             <div className="bg-gray-100 rounded-t-md border-b-2 border-gray-300 px-4 py-2 relative hover:bg-gray-200 transition-colors">
               <label className="block text-xs font-medium text-gray-500 mb-1">Start Time</label>
               <div className="block w-full font-medium text-gray-900">{startTime}</div>
               <ChevronDown className="absolute right-4 top-1/2 mt-1 -translate-y-1/2 w-4 h-4 text-gray-400" />
             </div>
          </div>
          
          <div onClick={() => handleTimeClick('end')} className="cursor-pointer">
             <div className="bg-gray-100 rounded-t-md border-b-2 border-gray-300 px-4 py-2 relative hover:bg-gray-200 transition-colors">
               <label className="block text-xs font-medium text-gray-500 mb-1">End Time</label>
               <div className="block w-full font-medium text-gray-900">{endTime}</div>
               <ChevronDown className="absolute right-4 top-1/2 mt-1 -translate-y-1/2 w-4 h-4 text-gray-400" />
             </div>
          </div>
        </div>

        {/* Unpaid Break */}
        <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-2">
             <span className="font-medium text-gray-900 text-sm">Unpaid Break</span>
             <span className="text-gray-400 text-xs border border-gray-300 rounded-full w-4 h-4 flex items-center justify-center">i</span>
           </div>
           <div className="flex items-center gap-2">
             <input 
               type="number" 
               placeholder="0"
               value={breakMinutes}
               onChange={(e) => setBreakMinutes(e.target.value)}
               className="w-16 border-b border-gray-300 text-center focus:border-blue-600 outline-none font-medium text-gray-900"
             />
             <span className="text-sm text-gray-500">min</span>
             <button className="text-blue-600 font-bold text-sm bg-blue-50 px-3 py-1 rounded ml-2">
                Add
             </button>
           </div>
        </div>

        {/* Net Payable */}
        <div className="flex justify-between items-center py-2 border-t border-gray-100 pt-4">
          <span className="font-bold text-gray-900 text-sm">Net Payable Hours</span>
          <span className="font-bold text-gray-500 text-sm">{payableHours}</span>
        </div>

      </div>

      <div className="p-4 border-t border-gray-100 bg-white">
        <button
          onClick={handleContinue}
          disabled={!shiftName.trim() || isSaving}
          className={`
            w-full py-3.5 rounded-lg font-semibold text-lg transition-all shadow-sm
            ${shiftName.trim() && !isSaving
               ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98]'
               : 'bg-blue-200 text-white cursor-not-allowed'
            }
          `}
        >
          {isSaving ? 'Saving...' : (initialData ? 'Update Shift' : 'Continue')}
        </button>
      </div>

      {pickerConfig && pickerConfig.show && (
        <TimePicker 
          initialHours={pickerConfig.initialH}
          initialMinutes={pickerConfig.initialM}
          mode="time"
          onSave={handleTimeSave}
          onCancel={() => setPickerConfig(null)}
        />
      )}
    </div>
  );
};
