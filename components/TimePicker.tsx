import React, { useEffect, useRef, useState } from 'react';

interface TimePickerProps {
  initialHours: number;
  initialMinutes: number;
  onSave: (hours: number, minutes: number) => void;
  onCancel: () => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const ITEM_HEIGHT = 48; // Height of each scroll item in pixels

export const TimePicker: React.FC<TimePickerProps> = ({ initialHours, initialMinutes, onSave, onCancel }) => {
  const [selectedHour, setSelectedHour] = useState(initialHours);
  const [selectedMinute, setSelectedMinute] = useState(initialMinutes);

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
          <h3 className="text-lg font-bold text-gray-900">Shift Hours</h3>
          <p className="text-gray-500 text-sm mt-1">Enter the number of hours in a shift</p>
        </div>

        {/* Scroll Wheels Container */}
        <div className="relative h-56 w-full flex justify-center items-center gap-4 my-2">
          
          {/* Highlight / Selection Bar */}
          <div className="absolute top-1/2 -translate-y-1/2 w-full h-[48px] pointer-events-none z-0">
            <div className="mx-8 h-full border-t border-b border-gray-200"></div>
          </div>
          
          {/* Hours Label */}
          <span className="text-lg font-bold text-gray-900 z-10 pt-1">Hrs</span>
          
          {/* Hours Column */}
          <ScrollColumn 
            items={HOURS} 
            value={selectedHour} 
            onChange={setSelectedHour} 
            format={(v) => v.toString().padStart(2, '0')}
          />
          
          {/* Separator */}
          <span className="text-xl font-bold text-gray-400 z-10 pt-1">:</span>
          
          {/* Minutes Column */}
          <ScrollColumn 
            items={MINUTES} 
            value={selectedMinute} 
            onChange={setSelectedMinute}
            format={(v) => v.toString().padStart(2, '0')}
          />

          {/* Minutes Label */}
          <span className="text-lg font-bold text-gray-900 z-10 pt-1">Mins</span>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100">
          <button
            onClick={() => onSave(selectedHour, selectedMinute)}
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg shadow-sm hover:bg-blue-700 active:scale-95 transition-all"
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
  const isScrolling = useRef(false);

  // Initial scroll position
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = value * ITEM_HEIGHT;
    }
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const index = Math.round(scrollTop / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, items.length - 1));
    
    if (items[clampedIndex] !== undefined) {
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
          className={`h-[48px] flex items-center justify-center snap-center transition-opacity duration-200 ${item === value ? 'text-gray-900 font-semibold text-2xl' : 'text-gray-400 text-xl'}`}
        >
          {format(item)}
        </div>
      ))}
      
      <div style={{ height: ITEM_HEIGHT }} /> {/* Spacer Bottom */}
    </div>
  );
};
