
import React, { useEffect, useRef, useState } from 'react';

interface TimePickerProps {
  initialHours: number;
  initialMinutes: number;
  mode?: 'duration' | 'time'; // 'duration' = 0-23 hrs, 'time' = 1-12 AM/PM
  onSave: (hours: number, minutes: number) => void;
  onCancel: () => void;
}

const HOURS_DURATION = Array.from({ length: 24 }, (_, i) => i);
const HOURS_TIME = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const PERIODS = ['AM', 'PM'];
const ITEM_HEIGHT = 48;

export const TimePicker: React.FC<TimePickerProps> = ({ initialHours, initialMinutes, mode = 'duration', onSave, onCancel }) => {
  // Logic for Time Mode initialization
  let initH = initialHours;
  let initPeriod = 'AM';
  
  if (mode === 'time') {
    if (initH >= 12) {
      initPeriod = 'PM';
      if (initH > 12) initH -= 12;
    }
    if (initH === 0) initH = 12;
  }

  const [selectedHour, setSelectedHour] = useState(initH);
  const [selectedMinute, setSelectedMinute] = useState(initialMinutes);
  const [selectedPeriod, setSelectedPeriod] = useState(initPeriod);

  const handleSave = () => {
    let finalH = selectedHour;
    if (mode === 'time') {
      if (selectedPeriod === 'AM' && finalH === 12) finalH = 0;
      if (selectedPeriod === 'PM' && finalH !== 12) finalH += 12;
    }
    onSave(finalH, selectedMinute);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-sm bg-white rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300">
        
        {/* Header */}
        <div className="pt-6 px-6 pb-2">
          <h3 className="text-lg font-bold text-gray-900">{mode === 'duration' ? 'Shift Hours' : 'Select Time'}</h3>
          <p className="text-gray-500 text-sm mt-1">{mode === 'duration' ? 'Enter the number of hours in a shift' : 'Scroll to select the time'}</p>
        </div>

        {/* Scroll Wheels Container */}
        <div className="relative h-56 w-full flex justify-center items-center gap-1 my-2">
          
          {/* Highlight / Selection Bar */}
          <div className="absolute top-1/2 -translate-y-1/2 w-full h-[48px] pointer-events-none z-0">
            <div className="mx-8 h-full border-t border-b border-gray-200 bg-gray-50/50"></div>
          </div>
          
          {/* Hours Label (Duration Mode) */}
          {mode === 'duration' && <span className="text-lg font-bold text-gray-900 z-10 pt-1 w-10 text-right mr-2">Hrs</span>}
          
          {/* Hours Column */}
          <ScrollColumn 
            items={mode === 'duration' ? HOURS_DURATION : HOURS_TIME} 
            value={selectedHour} 
            onChange={setSelectedHour} 
            format={(v) => v.toString().padStart(2, '0')}
          />
          
          {/* Separator */}
          <span className="text-xl font-bold text-gray-400 z-10 pt-1 w-4 text-center">:</span>
          
          {/* Minutes Column */}
          <ScrollColumn 
            items={MINUTES} 
            value={selectedMinute} 
            onChange={setSelectedMinute}
            format={(v) => v.toString().padStart(2, '0')}
          />

          {/* Minutes Label (Duration Mode) */}
          {mode === 'duration' && <span className="text-lg font-bold text-gray-900 z-10 pt-1 w-12 ml-2">Mins</span>}

          {/* AM/PM Column (Time Mode) */}
          {mode === 'time' && (
             <div className="ml-4 w-16 h-[144px] overflow-y-scroll snap-y snap-mandatory no-scrollbar z-10" style={{ scrollBehavior: 'smooth' }}>
                <div style={{ height: ITEM_HEIGHT }} />
                 {PERIODS.map(p => (
                   <div 
                      key={p}
                      onClick={() => setSelectedPeriod(p)}
                      className={`h-[48px] flex items-center justify-center snap-center transition-opacity duration-200 cursor-pointer ${p === selectedPeriod ? 'text-gray-900 font-semibold text-xl' : 'text-gray-300 text-lg'}`}
                   >
                     {p}
                   </div>
                 ))}
                <div style={{ height: ITEM_HEIGHT }} />
             </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-200 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-lg shadow-sm hover:bg-blue-700 active:scale-95 transition-all"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

interface ScrollColumnProps {
  items: number[];
  value: number;
  onChange: (val: number) => void;
  format: (val: number) => string;
}

const ScrollColumn: React.FC<ScrollColumnProps> = ({ items, value, onChange, format }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Initial scroll position
  useEffect(() => {
    if (containerRef.current) {
      // Find index of value
      const index = items.indexOf(value);
      if (index !== -1) {
         containerRef.current.scrollTop = index * ITEM_HEIGHT;
      }
    }
  }, []); // Run once on mount

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const index = Math.round(scrollTop / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, items.length - 1));
    
    if (items[clampedIndex] !== undefined) {
      // Debounce or just set state (React might be fast enough)
      onChange(items[clampedIndex]);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="h-[144px] w-16 overflow-y-scroll snap-y snap-mandatory no-scrollbar z-10"
      onScroll={handleScroll}
      style={{ scrollBehavior: 'smooth' }}
    >
      <div style={{ height: ITEM_HEIGHT }} /> {/* Spacer Top */}
      
      {items.map((item) => (
        <div 
          key={item} 
          className={`h-[48px] flex items-center justify-center snap-center transition-opacity duration-200 ${item === value ? 'text-gray-900 font-semibold text-2xl' : 'text-gray-300 text-xl'}`}
        >
          {format(item)}
        </div>
      ))}
      
      <div style={{ height: ITEM_HEIGHT }} /> {/* Spacer Bottom */}
    </div>
  );
};
