
import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, ChevronRight, AlertTriangle, CheckCircle2, History, Info, Square, CheckSquare, Filter, ChevronDown, X, Plus, Lock } from 'lucide-react';
import { PayrollEntry, Employee, BusinessDetails } from '../types';
import { generatePayrollDraft, getEmployees, getLatestBusinessDetails, saveApprovedAdvance } from '../services/dbService';
import { PaymentDetailsSheet } from './PaymentDetailsSheet';
import { CreatePaymentSheet } from './CreatePaymentSheet';
import { PaymentSecurityModal } from './PaymentSecurityModal';

interface FinalizePayrollScreenProps {
  onBack: () => void;
  initialTab?: 'Daily' | 'Monthly' | 'One-Time' | 'Advance';
  initialPaymentRequest?: {
     type: 'One-Time' | 'Advance';
     employeeId: string;
     amount?: number;
     reason?: string;
  };
}

type Tab = 'Daily' | 'Monthly' | 'One-Time' | 'Advance';
type FilterType = 'all' | 'selected' | 'not_selected';

export const FinalizePayrollScreen: React.FC<FinalizePayrollScreenProps> = ({ onBack, initialTab, initialPaymentRequest }) => {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab || 'Daily');
  const [entries, setEntries] = useState<PayrollEntry[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [payrollUsageType, setPayrollUsageType] = useState<'calculate_only' | 'calculate_and_pay'>('calculate_and_pay');
  const [businessDetails, setBusinessDetails] = useState<BusinessDetails | null>(null);
  const [successView, setSuccessView] = useState(false);
  
  // Processed State (Session based)
  const [isProcessed, setIsProcessed] = useState(false);

  // Payment Security
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [securityAmount, setSecurityAmount] = useState<number | undefined>(undefined);

  // Create Payment State
  const [showCreatePayment, setShowCreatePayment] = useState(false);
  const [createPaymentType, setCreatePaymentType] = useState<'one-time' | 'advance'>('one-time');
  const [createPaymentData, setCreatePaymentData] = useState<{employeeId: string; amount?: number; narration?: string} | undefined>(undefined);

  // New State for Selection and Cash Paid tracking
  const [includedIds, setIncludedIds] = useState<Set<string>>(new Set());
  const [cashPaidIds, setCashPaidIds] = useState<Set<string>>(new Set());

  // Mock History Data
  const [oneTimeHistory, setOneTimeHistory] = useState([
     { id: '1', name: 'Aarav Sharma', amount: 2000, date: '15 Dec 2025', reason: 'Diwali Bonus' },
     { id: '2', name: 'Priya Patel', amount: 1500, date: '12 Dec 2025', reason: 'Performance Incentive' }
  ]);

  const [advanceHistory, setAdvanceHistory] = useState([
     { id: '1', name: 'Vikram Singh', amount: 5000, date: '10 Dec 2025', reason: 'Medical Emergency' },
     { id: '2', name: 'Rohan Gupta', amount: 1000, date: '05 Dec 2025', reason: 'Personal' }
  ]);

  useEffect(() => {
    const init = async () => {
      try {
        const [empData, payrollData, bizData] = await Promise.all([
          getEmployees(),
          generatePayrollDraft(),
          Promise.resolve(getLatestBusinessDetails())
        ]);
        setEmployees(empData);
        setEntries(payrollData);
        setBusinessDetails(bizData);

        if (bizData?.payrollUsageType) {
           setPayrollUsageType(bizData.payrollUsageType);
        }
        
        // Initially include everyone
        setIncludedIds(new Set(payrollData.map(e => e.employeeId)));

        // Handle Initial Request
        if (initialPaymentRequest) {
           setActiveTab(initialPaymentRequest.type);
           setCreatePaymentType(initialPaymentRequest.type === 'One-Time' ? 'one-time' : 'advance');
           setCreatePaymentData({
              employeeId: initialPaymentRequest.employeeId,
              amount: initialPaymentRequest.amount,
              narration: initialPaymentRequest.reason
           });
           setShowCreatePayment(true);
        }

      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [initialPaymentRequest]);

  const handleUpdateEntry = (updated: PayrollEntry) => {
    setEntries(prev => prev.map(e => e.employeeId === updated.employeeId ? updated : e));
    setSelectedEntryId(null);
  };

  const toggleInclude = (id: string) => {
    const newSet = new Set(includedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setIncludedIds(newSet);
  };

  const toggleCashPaid = (id: string) => {
    const newSet = new Set(cashPaidIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setCashPaidIds(newSet);
  };

  const handleCreatePayment = async (data: any) => {
    const employee = employees.find(e => e.id === data.employeeId);
    
    // 1. Save to Local History State (Visual)
    const newItem = {
      id: crypto.randomUUID(),
      name: employee?.fullName || 'Unknown',
      amount: data.amount,
      date: data.date,
      reason: data.narration || (createPaymentType === 'one-time' ? 'Bonus' : 'Advance')
    };

    if (createPaymentType === 'one-time') {
      setOneTimeHistory(prev => [newItem, ...prev]);
    } else {
      setAdvanceHistory(prev => [newItem, ...prev]);
      
      // 2. IMPORTANT: Save Advance to DB so it reflects in payroll calculation
      try {
         await saveApprovedAdvance(data.employeeId, data.amount, data.narration || 'Advance from Payment Tab');
         
         // 3. Refresh Payroll Draft
         const updatedDraft = await generatePayrollDraft();
         setEntries(updatedDraft);
      } catch (e) {
         console.error("Failed to save advance", e);
      }
    }
  };

  const openCreateModal = (type: 'one-time' | 'advance') => {
    setCreatePaymentType(type);
    setCreatePaymentData(undefined);
    setShowCreatePayment(true);
  };

  // Filter Logic: Filters by Tab -> Then by Dropdown Selection
  const visibleEntries = useMemo(() => {
    // 1. Filter by Tab
    let filtered = entries.filter(e => {
      if (activeTab === 'Monthly') return e.wageType === 'Monthly';
      if (activeTab === 'Daily') return e.wageType === 'Daily' || e.wageType === 'Hourly';
      return false;
    });

    // 2. Filter by Dropdown
    if (activeFilter === 'selected') {
      filtered = filtered.filter(e => includedIds.has(e.employeeId));
    } else if (activeFilter === 'not_selected') {
      filtered = filtered.filter(e => !includedIds.has(e.employeeId));
    }

    return filtered;
  }, [entries, activeTab, activeFilter, includedIds]);

  // Totals Calculation
  // IMPORTANT: For cash employees, we only sum up "Net Pay" if they are selected. 
  // Whether they are marked "Paid" or not on the card affects if we should "transfer" money, 
  // but for the "Total Payroll Cost" context, it usually includes everyone.
  // However, for the "Proceed to Pay" button which implies transfer, we usually exclude already paid cash.
  const totalPayout = visibleEntries
    .filter(e => includedIds.has(e.employeeId)) 
    .filter(e => !(e.paymentMode === 'Cash' && cashPaidIds.has(e.employeeId)))
    .reduce((sum, e) => sum + e.netPay, 0);
  
  const count = visibleEntries.filter(e => includedIds.has(e.employeeId)).length;

  const getPeriodText = () => {
    const date = new Date();
    if (activeTab === 'Daily') return `Daily — ${date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`;
    if (activeTab === 'Monthly') return `Monthly — ${date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}`;
    return activeTab;
  };

  const getProcessedText = () => {
     const date = new Date();
     if (activeTab === 'Daily') return `Salary Processed for "Today"`;
     return `Salary Processed for ${date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}`;
  }

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const getEmployee = (id: string) => employees.find(e => e.id === id)!;

  const initiatePaymentProcess = () => {
    setShowSummary(false);
    // If only cash employees are selected (and not paid yet), security amount is 0 effectively for transfer, but we show confirmation.
    setSecurityAmount(totalPayout);
    setShowSecurityModal(true);
  };

  const handleSecuritySuccess = () => {
    setShowSecurityModal(false);
    setSuccessView(true);
  };

  const handleSuccessClose = () => {
     setSuccessView(false);
     setIsProcessed(true); // Mark session as processed
  };

  if (successView) {
     return (
        <SuccessScreen 
           usageType={payrollUsageType} 
           adminEmail={businessDetails?.businessEmail || 'admin@company.com'}
           onClose={handleSuccessClose} 
        />
     );
  }

  return (
    <div className="w-full bg-white h-full flex flex-col relative">
      
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
               <ArrowLeft className="w-5 h-5 text-gray-800" />
             </button>
             <div>
               <h1 className="text-sm font-semibold text-gray-500">{getPeriodText()}</h1>
               {(activeTab === 'Daily' || activeTab === 'Monthly') && !isProcessed && (
                  <div className="text-xl font-bold text-gray-900">{formatCurrency(totalPayout)}</div>
               )}
             </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-4 gap-4 mt-1 overflow-x-auto no-scrollbar pb-0">
          <TabButton 
            label="Daily" 
            count={entries.filter(e => e.wageType !== 'Monthly').length} 
            active={activeTab === 'Daily'} 
            onClick={() => { setActiveTab('Daily'); setIsProcessed(false); }}
          />
          <TabButton 
            label="Monthly" 
            count={entries.filter(e => e.wageType === 'Monthly').length} 
            active={activeTab === 'Monthly'} 
            onClick={() => { setActiveTab('Monthly'); setIsProcessed(false); }}
          />
          <TabButton label="One-Time" active={activeTab === 'One-Time'} onClick={() => { setActiveTab('One-Time'); setIsProcessed(false); }} />
          <TabButton label="Advance" active={activeTab === 'Advance'} onClick={() => { setActiveTab('Advance'); setIsProcessed(false); }} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4 pb-24">
        
        {/* Filter Dropdown (Only Daily/Monthly) */}
        {(activeTab === 'Daily' || activeTab === 'Monthly') && !isProcessed && (
          <div className="flex justify-end mb-4">
             <div className="relative inline-block">
                <select 
                  className="appearance-none bg-white border border-gray-200 text-gray-700 py-1.5 pl-3 pr-8 rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-500"
                  value={activeFilter}
                  onChange={(e) => setActiveFilter(e.target.value as FilterType)}
                >
                  <option value="all">All Employees</option>
                  <option value="selected">Selected</option>
                  <option value="not_selected">Not Selected</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
             </div>
          </div>
        )}

        {/* --- PROCESSED STATE --- */}
        {isProcessed && (activeTab === 'Daily' || activeTab === 'Monthly') && (
           <div className="flex flex-col items-center justify-center pt-20">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                 <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{getProcessedText()}</h2>
              <p className="text-gray-500 text-sm max-w-xs text-center">
                 You can view the payout details in the History tab or download the Salary Register from your email.
              </p>
           </div>
        )}

        {/* --- DAILY & MONTHLY VIEWS --- */}
        {!isProcessed && (activeTab === 'Daily' || activeTab === 'Monthly') && (
          <>
            {loading ? (
              <div className="text-center py-10 text-gray-400">Preparing payroll...</div>
            ) : visibleEntries.length === 0 ? (
              <div className="text-center py-20 text-gray-400 flex flex-col items-center">
                <CheckCircle2 className="w-12 h-12 mb-3 text-gray-300" />
                <p>No employees found.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {visibleEntries.map(entry => {
                  const isSelected = includedIds.has(entry.employeeId);
                  const isCash = entry.paymentMode === 'Cash';
                  const isPaid = isCash && cashPaidIds.has(entry.employeeId);

                  return (
                    <div key={entry.employeeId} className={`bg-white rounded-xl p-3 border shadow-sm flex items-center gap-3 ${isSelected ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
                      
                      {/* Selection Checkbox (Left) */}
                      <button 
                        onClick={() => toggleInclude(entry.employeeId)}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                      >
                         {isSelected ? <CheckSquare className="w-5 h-5 text-blue-600" /> : <Square className="w-5 h-5" />}
                      </button>
                      
                      {/* Main Info */}
                      <div className="flex-1 min-w-0" onClick={() => setSelectedEntryId(entry.employeeId)}>
                          <div className="flex justify-between items-start">
                             <h3 className="font-bold text-gray-900 text-sm truncate">{entry.employeeName}</h3>
                             <div className="text-right">
                                <div className={`font-bold text-gray-900 ${isPaid ? 'line-through text-gray-400' : ''}`}>
                                   {formatCurrency(entry.netPay)}
                                </div>
                             </div>
                          </div>
                          
                          <div className="flex items-center justify-between mt-1">
                            <div className="flex items-center gap-2">
                               <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium border ${
                                  entry.paymentMode === 'Cash' ? 'bg-green-50 text-green-700 border-green-100' : 
                                  entry.paymentMode === 'UPI' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                                  'bg-purple-50 text-purple-700 border-purple-100'
                               }`}>
                                  {entry.paymentMode}
                               </span>
                               {entry.status === 'missing_details' && (
                                  <span className="flex items-center gap-1 text-[10px] text-red-500 font-medium">
                                    <AlertTriangle className="w-3 h-3" /> Missing Info
                                  </span>
                               )}
                            </div>
                            
                            {/* Cash Paid Checkbox (Right side, specific to Cash) */}
                            {isCash && isSelected && (
                               <button 
                                 onClick={(e) => { e.stopPropagation(); toggleCashPaid(entry.employeeId); }}
                                 className="flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded px-2 py-1 transition-colors"
                               >
                                  <div className={`w-3 h-3 rounded-sm border flex items-center justify-center ${isPaid ? 'bg-green-500 border-green-500' : 'border-gray-400'}`}>
                                     {isPaid && <CheckSquare className="w-2.5 h-2.5 text-white" />}
                                  </div>
                                  <span className={`text-xs font-semibold ${isPaid ? 'text-green-700' : 'text-gray-500'}`}>Paid</span>
                               </button>
                            )}

                             {!isCash && (
                                <ChevronRight className="w-4 h-4 text-gray-300" />
                             )}
                          </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* --- ONE-TIME PAYMENTS --- */}
        {activeTab === 'One-Time' && (
           <div className="space-y-4 pb-20">
               <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg text-xs border border-yellow-200">
                  <span className="font-bold block mb-1">Important:</span>
                  Amounts paid out as one time payments will NOT automatically be recovered in the next payroll.
               </div>
               <div className="flex justify-between items-center">
                  <h3 className="font-bold text-gray-700 text-sm">Payment History</h3>
               </div>
               {oneTimeHistory.length === 0 ? (
                  <div className="text-center py-10 text-gray-400 text-sm">No one-time payments yet.</div>
               ) : (
                  <div className="space-y-3">
                     {oneTimeHistory.map(item => (
                        <HistoryItem key={item.id} item={item} />
                     ))}
                  </div>
               )}
           </div>
        )}

        {/* --- ADVANCE PAYMENTS --- */}
        {activeTab === 'Advance' && (
           <div className="space-y-4 pb-20">
               <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-xs border border-blue-200">
                  <span className="font-bold block mb-1">Advance Policy:</span>
                  Amounts paid out as one time payments will automatically be recovered in the next payroll. Please check the amount carefully against the staff's salary.
               </div>
               <div className="flex justify-between items-center">
                  <h3 className="font-bold text-gray-700 text-sm">Advance History</h3>
               </div>
               {advanceHistory.length === 0 ? (
                  <div className="text-center py-10 text-gray-400 text-sm">No advance payments yet.</div>
               ) : (
                  <div className="space-y-3">
                     {advanceHistory.map(item => (
                        <HistoryItem key={item.id} item={item} />
                     ))}
                  </div>
               )}
           </div>
        )}
        
      </div>

      {/* Footer for Daily/Monthly */}
      {(activeTab === 'Daily' || activeTab === 'Monthly') && !isProcessed && (
          <div className="p-4 bg-white border-t border-gray-100 flex-shrink-0 absolute bottom-0 left-0 right-0 z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
             <div className="flex justify-between items-center mb-3">
                <div>
                   <span className="text-xs text-gray-500 font-medium">Total Payout</span>
                   <div className="text-xl font-bold text-gray-900">{formatCurrency(totalPayout)}</div>
                </div>
                <div className="text-right">
                   <span className="text-xs text-gray-500 font-medium">Employees</span>
                   <div className="text-sm font-bold text-gray-900">{count} Selected</div>
                </div>
             </div>
             <button
               onClick={() => setShowSummary(true)}
               disabled={count === 0}
               className={`w-full py-3.5 rounded-xl font-bold text-lg transition-all shadow-lg ${count > 0 ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-blue-200' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
             >
               Proceed to Pay
             </button>
          </div>
       )}

      {/* Footer for One-Time/Advance */}
      {(activeTab === 'One-Time' || activeTab === 'Advance') && (
         <div className="p-4 bg-white border-t border-gray-100 flex-shrink-0 absolute bottom-0 left-0 right-0 z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <button 
               onClick={() => openCreateModal(activeTab === 'One-Time' ? 'one-time' : 'advance')} 
               className="w-full py-3.5 rounded-xl font-bold text-lg text-white bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
            >
               <Plus className="w-5 h-5" /> Create New
            </button>
         </div>
      )}

      {/* Sheets */}
      {selectedEntryId && (
          <PaymentDetailsSheet 
            employee={getEmployee(selectedEntryId)}
            entry={entries.find(e => e.employeeId === selectedEntryId)!}
            onSave={handleUpdateEntry}
            onClose={() => setSelectedEntryId(null)}
          />
       )}

       <CreatePaymentSheet 
         isOpen={showCreatePayment}
         onClose={() => setShowCreatePayment(false)}
         type={createPaymentType}
         employees={employees}
         onSave={handleCreatePayment}
         initialData={createPaymentData}
       />

       {/* Security Modal */}
       <PaymentSecurityModal 
         isOpen={showSecurityModal}
         onClose={() => setShowSecurityModal(false)}
         onSuccess={handleSecuritySuccess}
         amount={securityAmount}
       />

       {/* Summary Modal (Confirmation) */}
       {showSummary && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center">
             <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSummary(false)} />
             <div className="relative w-full max-w-md bg-white rounded-t-2xl shadow-2xl p-6 animate-in slide-in-from-bottom duration-300 pb-10">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Confirm Payout</h2>
                
                <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
                   <div className="flex justify-between mb-2">
                      <span className="text-gray-600 text-sm">Total Employees</span>
                      <span className="font-bold text-gray-900">{count}</span>
                   </div>
                   <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">Total Amount</span>
                      <span className="font-bold text-blue-600">{formatCurrency(totalPayout)}</span>
                   </div>
                </div>

                <div className="flex gap-3">
                   <button onClick={() => setShowSummary(false)} className="flex-1 py-3 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200">
                      Cancel
                   </button>
                   <button onClick={initiatePaymentProcess} className="flex-1 py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200 active:scale-95 transition-transform">
                      Confirm & Pay
                   </button>
                </div>
             </div>
          </div>
       )}
    </div>
  );
};

// --- Helper Components ---

const HistoryItem: React.FC<{ item: any }> = ({ item }) => (
  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center">
     <div>
        <h4 className="font-bold text-gray-900 text-sm">{item.name}</h4>
        <p className="text-xs text-gray-500">{item.reason} • {item.date}</p>
     </div>
     <div className="text-right">
        <span className="block font-bold text-gray-900 text-sm">₹{item.amount}</span>
        <span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded font-medium">Paid</span>
     </div>
  </div>
);

const TabButton: React.FC<{ label: string; count?: number; active?: boolean; onClick: () => void }> = ({ label, count, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`
      whitespace-nowrap pb-3 px-2 border-b-2 text-sm font-medium transition-colors flex items-center gap-2 flex-shrink-0
      ${active ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
    `}
  >
    {label}
    {count !== undefined && count > 0 && (
      <span className={`text-[10px] px-1.5 rounded-full ${active ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
        {count}
      </span>
    )}
  </button>
);

interface SuccessScreenProps {
  usageType: 'calculate_only' | 'calculate_and_pay';
  adminEmail: string;
  onClose: () => void;
}

const SuccessScreen: React.FC<SuccessScreenProps> = ({ usageType, adminEmail, onClose }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-white p-6 text-center animate-in zoom-in-95 duration-300">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
         <CheckCircle2 className="w-10 h-10 text-green-600" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        {usageType === 'calculate_and_pay' ? 'Payroll Processed' : 'Payroll Processed!'}
      </h2>
      
      <p className="text-gray-500 mb-4 max-w-xs mx-auto leading-relaxed">
        {usageType === 'calculate_and_pay' 
          ? 'Your staff will receive their salaries as per their preferred payment method within 24 hours.' 
          : ''
        }
      </p>

      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 max-w-xs mb-8">
         <p className="text-xs text-gray-600">
            Salary Register with Staff Payment Details have been sent to <span className="font-bold text-gray-900">{adminEmail}</span> and over WhatsApp.
         </p>
      </div>

      <button 
        onClick={onClose}
        className="w-full max-w-xs bg-blue-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all"
      >
        Go to Dashboard
      </button>
    </div>
  );
};
