
import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronDown, Check, Search } from 'lucide-react';
import { Employee } from '../types';
import { PaymentSecurityModal } from './PaymentSecurityModal';

interface CreatePaymentSheetProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'one-time' | 'advance';
  employees: Employee[];
  onSave: (data: any) => void;
  initialData?: {
    employeeId: string;
    amount?: number;
    narration?: string;
  };
}

export const CreatePaymentSheet: React.FC<CreatePaymentSheetProps> = ({ isOpen, onClose, type, employees, onSave, initialData }) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [narration, setNarration] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<string>('Cash');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setSelectedEmployeeId(initialData.employeeId || '');
        setAmount(initialData.amount ? String(initialData.amount) : '');
        setNarration(initialData.narration || '');
      } else {
        setSelectedEmployeeId('');
        setAmount('');
        setNarration('');
      }
      setPaymentMode('Cash');
      setIsDropdownOpen(false);
      setSearchTerm('');
      setShowSecurityModal(false);
    }
  }, [isOpen, initialData]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update payment mode default when employee changes
  useEffect(() => {
    if (selectedEmployeeId) {
      const emp = employees.find(e => e.id === selectedEmployeeId);
      if (emp && emp.paymentDetails?.paymentMode) {
        if (emp.paymentDetails.paymentMode === 'Cash') setPaymentMode('Cash');
        else if (emp.paymentDetails.upiId) setPaymentMode('UPI');
        else setPaymentMode('Bank Transfer');
      }
    }
  }, [selectedEmployeeId, employees]);

  if (!isOpen) return null;

  const selectedEmployee = employees.find(e => e.id === selectedEmployeeId);
  const filteredEmployees = employees.filter(e => 
    e.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePayClick = () => {
    if (!selectedEmployeeId || !amount) return;
    setShowSecurityModal(true);
  };

  const handleSecuritySuccess = () => {
    setShowSecurityModal(false);
    onSave({
      employeeId: selectedEmployeeId,
      amount: parseFloat(amount),
      narration,
      paymentMode,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    });
    onClose();
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white rounded-t-2xl shadow-xl flex flex-col animate-in slide-in-from-bottom duration-300 max-h-[90vh]">
        
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{type === 'one-time' ? 'Create One-Time Payment' : 'Create Advance Payment'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-4 space-y-6 overflow-y-auto min-h-[300px]">
          
          {/* Custom Employee Select */}
          <div className="relative" ref={dropdownRef}>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Select Employee</label>
            <div 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`
                w-full rounded-xl border bg-white py-3 pl-4 pr-10 text-left cursor-pointer transition-all shadow-sm
                ${isDropdownOpen ? 'border-blue-500 ring-2 ring-blue-50' : 'border-gray-200 hover:border-gray-300'}
              `}
            >
              <span className={`block truncate ${selectedEmployee ? 'text-gray-900 font-semibold' : 'text-gray-400'}`}>
                {selectedEmployee 
                  ? `${selectedEmployee.fullName} ${type === 'advance' && selectedEmployee.salaryAmount ? `(Sal: ${formatCurrency(Number(selectedEmployee.salaryAmount))})` : ''}` 
                  : '-- Select Employee --'
                }
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <ChevronDown className="h-5 w-5 text-gray-400" />
              </span>
            </div>

            {isDropdownOpen && (
              <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none">
                 <div className="sticky top-0 bg-white p-2 border-b border-gray-100">
                    <div className="relative">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                       <input 
                         type="text" 
                         className="w-full bg-gray-50 border-none rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-0" 
                         placeholder="Search..."
                         value={searchTerm}
                         onChange={(e) => setSearchTerm(e.target.value)}
                         autoFocus
                       />
                    </div>
                 </div>
                 {filteredEmployees.length === 0 ? (
                    <div className="py-3 px-4 text-sm text-gray-400 text-center">No employees found</div>
                 ) : (
                   filteredEmployees.map(emp => (
                    <div
                      key={emp.id}
                      onClick={() => {
                        setSelectedEmployeeId(emp.id);
                        setIsDropdownOpen(false);
                      }}
                      className={`
                        relative cursor-pointer select-none py-3 pl-4 pr-9 hover:bg-blue-50 transition-colors
                        ${selectedEmployeeId === emp.id ? 'bg-blue-50' : ''}
                      `}
                    >
                      <div className="flex flex-col">
                        <span className={`block truncate text-sm ${selectedEmployeeId === emp.id ? 'font-bold text-blue-900' : 'font-medium text-gray-900'}`}>
                          {emp.fullName}
                        </span>
                        {type === 'advance' && emp.salaryAmount && (
                          <span className="text-xs text-gray-500">Salary: {formatCurrency(Number(emp.salaryAmount))}</span>
                        )}
                      </div>
                      
                      {selectedEmployeeId === emp.id && (
                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                          <Check className="h-4 w-4" />
                        </span>
                      )}
                    </div>
                  ))
                 )}
              </div>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-900 font-bold text-lg">₹</span>
              <input 
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="block w-full rounded-xl border border-gray-200 py-3.5 pl-8 pr-4 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-50 text-xl font-bold placeholder:text-gray-300 bg-white shadow-sm"
              />
            </div>
          </div>

          {/* Payment Mode */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">Payment Mode</label>
            <div className="grid grid-cols-3 gap-3">
              {['Cash', 'UPI', 'Bank Transfer'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setPaymentMode(mode)}
                  className={`
                    py-2.5 rounded-lg text-xs font-semibold border transition-all shadow-sm
                    ${paymentMode === mode 
                      ? 'border-blue-600 bg-blue-600 text-white shadow-md' 
                      : 'border-gray-200 text-gray-600 bg-white hover:bg-gray-50'
                    }
                  `}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Narration */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Narration (Optional)</label>
            <input 
              type="text"
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
              placeholder="e.g. Diwali Bonus"
              className="block w-full rounded-xl border border-gray-200 py-3 px-4 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-50 text-sm bg-white shadow-sm placeholder:text-gray-400"
            />
          </div>

        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
           <button
             onClick={handlePayClick}
             disabled={!selectedEmployeeId || !amount}
             className={`
               w-full py-3.5 rounded-xl font-bold text-lg transition-all shadow-sm
               ${(!selectedEmployeeId || !amount)
                 ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                 : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98] shadow-blue-200'
               }
             `}
           >
             Pay & Save
           </button>
        </div>

        <PaymentSecurityModal 
          isOpen={showSecurityModal}
          onClose={() => setShowSecurityModal(false)}
          onSuccess={handleSecuritySuccess}
          amount={amount ? parseFloat(amount) : undefined}
        />

      </div>
    </div>
  );
};
