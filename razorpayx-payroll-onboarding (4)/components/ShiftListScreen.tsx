import React, { useEffect, useState } from 'react';
import { ArrowLeft, Clock } from 'lucide-react';
import { getShifts } from '../services/dbService';
import { Shift } from '../types';

interface ShiftListScreenProps {
  onBack: () => void;
  onAddShift: () => void;
  onManageShift: (shift: Shift) => void;
  onManageStaff: (shift: Shift) => void;
}

export const ShiftListScreen: React.FC<ShiftListScreenProps> = ({ onBack, onAddShift, onManageShift, onManageStaff }) => {
  const [shifts, setShifts] = useState<(Shift & { staffCount: number })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShifts();
  }, []);

  const loadShifts = async () => {
    try {
      const data = await getShifts();
      setShifts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
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
        <h1 className="text-lg font-bold text-gray-900">Shift Settings</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col">
        
        <div className="flex-1">
          {shifts.length > 0 && (
            <h2 className="text-sm font-bold text-gray-900 mb-4 px-1">Fixed Shift</h2>
          )}
          
          {loading ? (
             <div className="text-center py-10 text-gray-400">Loading...</div>
          ) : shifts.length === 0 ? (
            <div className="mt-4">
              <h2 className="text-base font-semibold text-gray-800 mb-2 px-1">
                Assign Morning/Evening/Night Shift to your staff
              </h2>
              <p className="text-sm text-gray-500 mb-6 px-1 flex items-center gap-1">
                <span className="text-green-500 font-bold">✓</span> Create shifts for your staff
              </p>
              <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                <p className="text-gray-400 font-medium">No Shifts Added</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {shifts.map(shift => (
                <div key={shift.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{shift.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">{shift.startTime} - {shift.endTime}</p>
                    </div>
                    <span className="text-xs text-gray-400">Assigned to {shift.staffCount} Staffs</span>
                  </div>
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={() => onManageShift(shift)}
                      className="flex-1 bg-blue-50 text-blue-600 font-semibold py-2 rounded-lg text-sm hover:bg-blue-100 transition-colors"
                    >
                      Manage
                    </button>
                    <button 
                      onClick={() => onManageStaff(shift)}
                      className="flex-1 bg-blue-50 text-blue-600 font-semibold py-2 rounded-lg text-sm hover:bg-blue-100 transition-colors"
                    >
                      Assigned Staff List
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 bg-white">
        <button
          className="w-full bg-blue-600 text-white py-3.5 rounded-lg font-semibold text-lg hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm"
          onClick={onAddShift}
        >
          {shifts.length === 0 ? 'Add Shift' : 'Create Shift'}
        </button>
      </div>
    </div>
  );
};
