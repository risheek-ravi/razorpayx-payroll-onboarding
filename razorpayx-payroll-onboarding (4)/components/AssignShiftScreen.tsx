import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import { Employee, Shift } from '../types';
import { getEmployees, assignShiftToEmployees, saveShift, updateShiftAssignment } from '../services/dbService';

interface AssignShiftScreenProps {
  shiftData: Omit<Shift, 'id'> | Shift; // Can be partial (creation) or full (edit)
  onBack: () => void;
  onSuccess: () => void;
  existingShiftId?: string; // Optional ID if we are editing an existing shift's staff
}

export const AssignShiftScreen: React.FC<AssignShiftScreenProps> = ({ shiftData, onBack, onSuccess, existingShiftId }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const data = await getEmployees();
      setEmployees(data);
      
      // If editing existing shift, pre-select employees
      if (existingShiftId) {
        const preSelected = new Set(
          data.filter(e => e.shiftId === existingShiftId).map(e => e.id)
        );
        setSelectedIds(preSelected);
      }
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleAssign = async () => {
    setIsSaving(true);
    try {
      if (existingShiftId) {
        // Edit Mode: Just update assignments
        await updateShiftAssignment(existingShiftId, Array.from(selectedIds));
      } else {
        // Create Mode: Save new shift first
        const savedShift = await saveShift(shiftData as Omit<Shift, 'id'>);
        if (selectedIds.size > 0) {
          await assignShiftToEmployees(savedShift.id, Array.from(selectedIds));
        }
      }
      onSuccess();
    } catch (e) {
      alert('Failed to save shift assignment');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredEmployees = employees.filter(e => 
    e.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full max-w-md bg-white sm:shadow-lg sm:rounded-xl sm:overflow-hidden h-screen sm:h-auto flex flex-col mx-auto relative">
      <div className="px-4 py-4 flex items-center shadow-sm relative z-10 bg-white">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-gray-100 mr-2">
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </button>
        <div>
           <h1 className="text-lg font-bold text-gray-900">{existingShiftId ? 'Manage Assigned Staff' : 'Assign Shift'}</h1>
           <p className="text-xs text-gray-500">{shiftData.name} | {shiftData.startTime} - {shiftData.endTime}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-white">
        <p className="text-sm font-bold text-gray-800 mb-4">Select Staffs you wish to give access to</p>

        {/* Search */}
        <div className="relative mb-6">
          <input 
            type="text"
            placeholder="Search by Staff Name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-200 rounded-lg pl-4 pr-10 py-3 text-sm focus:border-blue-500 outline-none"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-400">Loading staff...</div>
        ) : filteredEmployees.length === 0 ? (
          <div className="text-center py-10 text-gray-400">No staff found</div>
        ) : (
          <div className="space-y-4">
            {filteredEmployees.map(emp => (
              <div 
                key={emp.id} 
                className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 cursor-pointer"
                onClick={() => handleToggle(emp.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedIds.has(emp.id) ? 'bg-blue-600 border-blue-600' : 'border-gray-400'}`}>
                    {selectedIds.has(emp.id) && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <span className="text-sm text-gray-800 font-medium">{emp.fullName}</span>
                </div>
                {emp.wageType && <span className="text-xs text-gray-400">{emp.wageType}</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-100 bg-white">
        <button
          onClick={handleAssign}
          disabled={isSaving}
          className={`
            w-full py-3.5 rounded-lg font-semibold text-lg transition-all shadow-sm
            ${(selectedIds.size > 0 || existingShiftId)
               ? 'bg-gray-200 text-gray-900 hover:bg-gray-300' 
               : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          {isSaving ? 'Saving...' : `Assign to ${selectedIds.size} Staff`}
        </button>
      </div>
    </div>
  );
};
