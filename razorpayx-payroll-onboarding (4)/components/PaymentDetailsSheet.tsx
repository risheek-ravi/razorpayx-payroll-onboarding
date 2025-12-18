
import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, AlertCircle, Smartphone, Building2, Calendar, Clock, AlertOctagon, HelpCircle } from 'lucide-react';
import { Employee, PayrollEntry, PayrollAdjustment } from '../types';

interface PaymentDetailsSheetProps {
  employee: Employee;
  entry: PayrollEntry;
  onSave: (updatedEntry: PayrollEntry) => void;
  onClose: () => void;
}

export const PaymentDetailsSheet: React.FC<PaymentDetailsSheetProps> = ({ employee, entry, onSave, onClose }) => {
  const [localEntry, setLocalEntry] = useState<PayrollEntry>(entry);
  const [newAdjustment, setNewAdjustment] = useState<{ label: string; amount: string; type: 'addition' | 'deduction' } | null>(null);

  useEffect(() => {
    const totalAdditions = localEntry.adjustments
      .filter(a => a.type === 'addition')
      .reduce((sum, a) => sum + a.amount, 0);
    
    const totalDeductions = localEntry.adjustments
      .filter(a => a.type === 'deduction')
      .reduce((sum, a) => sum + a.amount, 0);

    const netPay = Math.max(0, localEntry.baseAmount + totalAdditions - totalDeductions);
    
    setLocalEntry(prev => ({ ...prev, netPay }));
  }, [localEntry.adjustments, localEntry.baseAmount]);

  const hasUPI = !!employee.paymentDetails?.upiId;
  const hasBank = !!employee.paymentDetails?.accountNumber;
  const isPaymentMethodValid = 
    (localEntry.paymentMode === 'UPI' && hasUPI) || 
    (localEntry.paymentMode === 'Bank' && hasBank) ||
    localEntry.paymentMode === 'Cash';

  const handleAddAdjustment = () => {
    if (!newAdjustment || !newAdjustment.label || !newAdjustment.amount) return;
    
    const adjustment: PayrollAdjustment = {
      id: crypto.randomUUID(),
      type: newAdjustment.type,
      label: newAdjustment.label,
      amount: parseFloat(newAdjustment.amount)
    };

    setLocalEntry(prev => ({
      ...prev,
      adjustments: [...prev.adjustments, adjustment]
    }));
    setNewAdjustment(null);
  };

  const removeAdjustment = (id: string) => {
    setLocalEntry(prev => ({
      ...prev,
      adjustments: prev.adjustments.filter(a => a.id !== id)
    }));
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const isDaily = employee.wageType === 'Daily';
  const isMonthly = employee.wageType === 'Monthly';
  const totalAdditions = localEntry.adjustments.filter(a => a.type === 'addition').reduce((sum, a) => sum + a.amount, 0);
  const totalDeductions = localEntry.adjustments.filter(a => a.type === 'deduction').reduce((sum, a) => sum + a.amount, 0);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white rounded-t-2xl shadow-xl h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-300">
        
        <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{employee.fullName}</h2>
            <p className="text-xs text-gray-500">{employee.wageType} • {employee.companyId}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-4 min-h-0 pb-20">
          
          <div className="bg-blue-50 rounded-xl p-6 text-center mb-6 border border-blue-100">
            <span className="text-sm font-medium text-blue-600 uppercase tracking-wide">Net Pay</span>
            <h1 className="text-4xl font-bold text-gray-900 mt-2">{formatCurrency(localEntry.netPay)}</h1>
            <p className="text-xs text-gray-400 mt-2">Based on {isDaily ? 'Hours' : (isMonthly ? 'Month' : 'Attendance')}</p>
          </div>

          {localEntry.calculationStats && (
            <div className="mb-6 grid grid-cols-2 gap-3">
               
               <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-2 mb-1">
                     <Calendar className="w-4 h-4 text-gray-500" />
                     <span className="text-xs font-semibold text-gray-500">
                        {isDaily ? 'Total Worked' : (isMonthly ? 'Days Worked' : 'Shifts')}
                     </span>
                  </div>
                  <p className="text-sm font-bold text-gray-900">
                     {isDaily 
                        ? `${localEntry.calculationStats.totalHoursWorked} hrs`
                        : isMonthly 
                           ? `${localEntry.calculationStats.workingDays} / ${localEntry.calculationStats.totalDays}`
                           : `${localEntry.calculationStats.presentShifts} / ${localEntry.calculationStats.totalShifts}`
                     }
                  </p>
               </div>

               <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-2 mb-1">
                     <Clock className="w-4 h-4 text-blue-500" />
                     <span className="text-xs font-semibold text-gray-500">Overtime</span>
                  </div>
                  <p className="text-sm font-bold text-gray-900">
                     {localEntry.calculationStats.overtimeHours} Hrs <span className="text-xs text-gray-400 font-normal">({formatCurrency(localEntry.calculationStats.overtimeAmount || 0)})</span>
                  </p>
               </div>

               {(localEntry.calculationStats.penalties || 0) > 0 && (
                 <div className="p-3 bg-red-50 rounded-lg border border-red-100 col-span-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <AlertOctagon className="w-4 h-4 text-red-500" />
                       <div>
                          <span className="text-xs font-semibold text-red-600 block">Penalty Applied</span>
                          <span className="text-[10px] text-red-400">{localEntry.calculationStats.penaltyReason}</span>
                       </div>
                    </div>
                    <p className="text-sm font-bold text-red-700">
                       -{formatCurrency(localEntry.calculationStats.penalties || 0)}
                    </p>
                 </div>
               )}
            </div>
          )}

          <div className="space-y-6">
            
            {/* Daily Wage Logic Breakdown */}
            {isDaily && localEntry.calculationStats && (
               <div className="bg-yellow-50/50 border border-yellow-100 rounded-lg p-3 text-xs space-y-2 text-gray-600">
                  <div className="flex justify-between">
                     <span>Regular Hours:</span>
                     <span className="font-bold">{localEntry.calculationStats.regularHours} hrs</span>
                  </div>
                  <div className="flex justify-between">
                     <span>Shift Hours:</span>
                     <span className="font-bold">{localEntry.calculationStats.shiftHours} hrs</span>
                  </div>
                  <div className="flex justify-between">
                     <span>Pay per day:</span>
                     <span className="font-bold">{formatCurrency(localEntry.calculationStats.payPerDay || 0)}</span>
                  </div>
                  <div className="pt-2 border-t border-yellow-200 mt-1">
                     <div className="flex items-center gap-1 mb-1 font-semibold text-gray-800">
                        Base Calculation <HelpCircle className="w-3 h-3" />
                     </div>
                     <p className="font-mono text-[10px] mb-1">
                        Rate: {formatCurrency(localEntry.calculationStats.payPerDay || 0)} / {localEntry.calculationStats.shiftHours} = {formatCurrency(localEntry.calculationStats.hourlyRate || 0)}/hr
                     </p>
                     <p className="font-mono text-[10px] mb-1">
                        Base: {formatCurrency(localEntry.calculationStats.hourlyRate || 0)} * {localEntry.calculationStats.regularHours} hrs = {formatCurrency(localEntry.baseAmount)}
                     </p>
                     <p className="font-mono text-[10px] text-gray-500">
                        (Note: Completed Overtime hours are paid separately below at 1.5x rate to prevent double counting)
                     </p>
                  </div>
               </div>
            )}

            {/* Monthly Wage Logic Breakdown */}
            {isMonthly && localEntry.calculationStats && (
               <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 text-xs space-y-2 text-gray-600">
                  <div className="flex justify-between">
                     <span>Salary / Month:</span>
                     <span className="font-bold">{formatCurrency(Number(employee.salaryAmount || 0))}</span>
                  </div>
                  <div className="flex justify-between">
                     <span>Days in Month:</span>
                     <span className="font-bold">{localEntry.calculationStats.totalDays}</span>
                  </div>
                  <div className="flex justify-between border-t border-blue-100 pt-1 mt-1">
                     <span>Per Day Pay:</span>
                     <span className="font-bold text-blue-600">{formatCurrency(localEntry.calculationStats.payPerDay || 0)}</span>
                  </div>
                  <div className="pt-2 border-t border-blue-200 mt-1">
                     <div className="flex items-center gap-1 mb-1 font-semibold text-gray-800">
                        Calculation <HelpCircle className="w-3 h-3" />
                     </div>
                     <p className="font-mono text-[10px] mb-1">
                        Base: {formatCurrency(localEntry.calculationStats.payPerDay || 0)} * {localEntry.calculationStats.workingDays} Days = {formatCurrency(localEntry.baseAmount)}
                     </p>
                  </div>
               </div>
            )}

            {/* Base Salary */}
            {(!isDaily && !isMonthly) && (
               <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-gray-600 font-medium">Base Salary</span>
                  <span className="text-gray-900 font-bold">{formatCurrency(localEntry.baseAmount)}</span>
               </div>
            )}

            {/* Additions */}
            <div>
               <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold text-gray-900">Additions</h3>
                  <button 
                    onClick={() => setNewAdjustment({ type: 'addition', label: '', amount: '' })}
                    className="text-xs font-semibold text-blue-600 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded"
                  >
                    <Plus className="w-3 h-3" /> Add
                  </button>
               </div>
               
               {localEntry.adjustments.filter(a => a.type === 'addition').map(adj => (
                 <div key={adj.id} className="flex justify-between items-center py-2 text-sm">
                    <span className="text-gray-600">{adj.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-green-600 font-medium">+{formatCurrency(adj.amount)}</span>
                      <button onClick={() => removeAdjustment(adj.id)} className="text-gray-300 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                 </div>
               ))}
            </div>

            {/* Deductions */}
            <div>
               <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold text-gray-900">Deductions</h3>
                  <button 
                    onClick={() => setNewAdjustment({ type: 'deduction', label: '', amount: '' })}
                    className="text-xs font-semibold text-orange-600 flex items-center gap-1 bg-orange-50 px-2 py-1 rounded"
                  >
                    <Plus className="w-3 h-3" /> Add
                  </button>
               </div>
               
               {localEntry.adjustments.filter(a => a.type === 'deduction').map(adj => (
                 <div key={adj.id} className="flex justify-between items-center py-2 text-sm">
                    <span className="text-gray-600">{adj.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-red-600 font-medium">-{formatCurrency(adj.amount)}</span>
                      <button onClick={() => removeAdjustment(adj.id)} className="text-gray-300 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                 </div>
               ))}
            </div>

            {/* Payment Method */}
            <div className="pt-4 border-t border-gray-100">
               <h3 className="text-sm font-bold text-gray-900 mb-3">Payment Method</h3>
               <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setLocalEntry(prev => ({ ...prev, paymentMode: 'UPI' }))}
                    className={`
                      flex items-center justify-center gap-2 py-3 rounded-lg border text-xs font-semibold transition-all
                      ${localEntry.paymentMode === 'UPI' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500'}
                    `}
                  >
                    <Smartphone className="w-3 h-3" /> UPI
                  </button>
                  <button
                    onClick={() => setLocalEntry(prev => ({ ...prev, paymentMode: 'Bank' }))}
                    className={`
                      flex items-center justify-center gap-2 py-3 rounded-lg border text-xs font-semibold transition-all
                      ${localEntry.paymentMode === 'Bank' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500'}
                    `}
                  >
                    <Building2 className="w-3 h-3" /> Bank
                  </button>
                  <button
                    onClick={() => setLocalEntry(prev => ({ ...prev, paymentMode: 'Cash' }))}
                    className={`
                      flex items-center justify-center gap-2 py-3 rounded-lg border text-xs font-semibold transition-all
                      ${localEntry.paymentMode === 'Cash' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500'}
                    `}
                  >
                    <span className="text-xs">₹</span> Cash
                  </button>
               </div>
               
               {!isPaymentMethodValid && (
                 <div className="mt-3 bg-red-50 text-red-600 text-xs p-3 rounded-lg flex items-start gap-2">
                   <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                   <div>
                     Missing {localEntry.paymentMode} details for this employee. 
                     <span className="font-bold underline ml-1">Update Profile</span>
                   </div>
                 </div>
               )}
            </div>

          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-white flex-shrink-0 pb-safe">
          <button
            onClick={() => onSave(localEntry)}
            disabled={!isPaymentMethodValid}
            className={`
              w-full py-3.5 rounded-lg font-semibold text-lg transition-all shadow-sm
              ${isPaymentMethodValid 
                ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98]' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            Save Changes
          </button>
        </div>

        {newAdjustment && (
          <div className="absolute inset-0 bg-white z-20 p-6 animate-in slide-in-from-bottom flex flex-col">
             <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-gray-900">Add {newAdjustment.type === 'addition' ? 'Earnings' : 'Deduction'}</h3>
                <button onClick={() => setNewAdjustment(null)} className="p-1 hover:bg-gray-100 rounded-full"><X className="w-6 h-6 text-gray-500" /></button>
             </div>
             
             <div className="space-y-6 flex-1">
               <div className="group relative w-full rounded-t-md bg-gray-100 px-4 py-2 border-b-2 border-gray-300 focus-within:border-blue-600 focus-within:bg-blue-50/30 transition-colors">
                 <label className="block text-xs font-medium text-gray-500 mb-1 group-focus-within:text-blue-600">Label</label>
                 <input 
                   autoFocus
                   type="text" 
                   value={newAdjustment.label}
                   onChange={(e) => setNewAdjustment(prev => prev ? ({ ...prev, label: e.target.value }) : null)}
                   placeholder="e.g. Overtime, Advance"
                   className="block w-full border-none bg-transparent p-0 text-gray-900 placeholder-gray-400 focus:ring-0 sm:text-sm font-medium outline-none"
                 />
               </div>
               
               <div className="group relative w-full rounded-t-md bg-gray-100 px-4 py-2 border-b-2 border-gray-300 focus-within:border-blue-600 focus-within:bg-blue-50/30 transition-colors">
                 <label className="block text-xs font-medium text-gray-500 mb-1 group-focus-within:text-blue-600">Amount</label>
                 <input 
                   type="number" 
                   value={newAdjustment.amount}
                   onChange={(e) => setNewAdjustment(prev => prev ? ({ ...prev, amount: e.target.value }) : null)}
                   placeholder="0"
                   className="block w-full border-none bg-transparent p-0 text-gray-900 placeholder-gray-400 focus:ring-0 sm:text-sm font-medium outline-none"
                 />
               </div>
               
               <button 
                 onClick={handleAddAdjustment}
                 disabled={!newAdjustment.label || !newAdjustment.amount}
                 className={`
                   w-full py-3.5 rounded-lg font-semibold text-lg transition-all shadow-sm mt-4
                   ${(!newAdjustment.label || !newAdjustment.amount) 
                     ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                     : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98]'
                   }
                 `}
               >
                 Add
               </button>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};
