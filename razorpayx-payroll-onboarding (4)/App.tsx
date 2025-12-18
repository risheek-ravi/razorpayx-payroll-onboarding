
import React, { useState, useEffect } from 'react';
import { BusinessDetailsScreen } from './components/BusinessDetailsScreen';
import { SalaryScreen } from './components/SalaryScreen';
import { DashboardScreen } from './components/DashboardScreen';
import { AddStaffScreen } from './components/AddStaffScreen';
import { AddSalaryScreen } from './components/AddSalaryScreen';
import { AddGeneralInfoScreen } from './components/AddGeneralInfoScreen';
import { ShiftListScreen } from './components/ShiftListScreen';
import { ShiftTypeModal } from './components/ShiftTypeModal';
import { AddFixedShiftScreen } from './components/AddFixedShiftScreen';
import { AssignShiftScreen } from './components/AssignShiftScreen';
import { WelcomeFlash } from './components/WelcomeFlash';
import { FinalizePayrollScreen } from './components/FinalizePayrollScreen';
import { UsageSelectionScreen } from './components/UsageSelectionScreen';
import { LoadWalletScreen } from './components/LoadWalletScreen';
import { saveBusinessDetails, updateBusinessSalaryConfig, updatePayrollUsage, saveEmployee, getLatestBusinessDetails, seedDatabase } from './services/dbService';
import { SalaryConfig, StaffType, Employee, Shift, PayrollUsageType } from './types';

type Step = 
  | 'business_details' 
  | 'usage_selection'
  | 'salary_calculation' 
  | 'dashboard' 
  | 'load_wallet'
  | 'add_staff' 
  | 'add_staff_salary' 
  | 'add_general_info' 
  | 'shift_list'
  | 'add_fixed_shift'
  | 'assign_shift'
  | 'edit_shift'
  | 'edit_shift_staff'
  | 'finalize_payroll';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>('business_details');
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState<string>('My Business');
  const [adminName, setAdminName] = useState<string>('');
  const [selectedStaffType, setSelectedStaffType] = useState<StaffType | null>(null);
  const [tempStaffData, setTempStaffData] = useState<Partial<Employee> | null>(null);
  const [showShiftTypeModal, setShowShiftTypeModal] = useState(false);
  const [tempShiftData, setTempShiftData] = useState<Omit<Shift, 'id'> | null>(null);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [welcomeData, setWelcomeData] = useState<{ show: boolean; name: string }>({ show: false, name: '' });

  // Persistence Check on Load
  useEffect(() => {
    // 1. Try to seed database
    seedDatabase();

    // 2. Fetch data
    const existingBiz = getLatestBusinessDetails();
    if (existingBiz) {
      setBusinessId(existingBiz.id);
      setBusinessName(existingBiz.businessName);
      setCurrentStep('dashboard');
    }
  }, []);

  // Handle Step 1: Business Details
  const handleBusinessDetailsSubmit = async (data: { name: string; businessName: string; businessEmail: string }) => {
    setIsSubmitting(true);
    try {
      const record = await saveBusinessDetails(data);
      setBusinessId(record.id);
      setBusinessName(data.businessName); // Store business name for Dashboard
      setAdminName(data.name); // Store name for welcome screen
      
      // Show flash message
      setWelcomeData({ show: true, name: data.name });
      
    } catch (error) {
      alert('Failed to save details. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Called when Flash message closes
  const handleFlashClose = () => {
    setWelcomeData(prev => ({ ...prev, show: false }));
    setCurrentStep('usage_selection'); // Proceed to usage selection
    setIsSubmitting(false);
  };

  // Handle Step 1.5: Usage Selection
  const handleUsageSelection = async (type: PayrollUsageType) => {
    if (!businessId) return;
    setIsSubmitting(true);
    try {
      await updatePayrollUsage(businessId, type);
      setCurrentStep('salary_calculation');
    } catch (e) {
      alert('Failed to save preference');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Step 2: Salary Configuration
  const handleSalarySubmit = async (config: SalaryConfig) => {
    if (!businessId) return;
    
    setIsSubmitting(true);
    try {
      await updateBusinessSalaryConfig(businessId, config);
      // Navigate to Dashboard
      setCurrentStep('dashboard');
    } catch (error) {
      alert('Failed to update salary configuration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddStaffFlow = (type: StaffType) => {
    setSelectedStaffType(type);
    setCurrentStep('add_staff');
  };

  const handleStaffDetailsNext = (data: Partial<Employee>) => {
    setTempStaffData(data);
    setCurrentStep('add_staff_salary');
  };

  // Called after "Preview -> Continue" in AddSalaryScreen
  const handleSalaryNext = (salaryData: { wageType: NonNullable<Employee['wageType']>; salaryAmount: string }) => {
    if (!tempStaffData) return;
    
    // Merge salary data and move to General Info
    setTempStaffData(prev => ({ ...prev, ...salaryData }));
    setCurrentStep('add_general_info');
  };

  // Final submission of Staff
  const handleGeneralInfoSubmit = async (weeklyOffs: string[]) => {
    if (!tempStaffData) return;

    setIsSubmitting(true);
    try {
       // Merge all data and save
       const employeeData: any = {
         ...tempStaffData,
         weeklyOffs
       };

       await saveEmployee(employeeData);
       alert('Staff Saved Successfully'); 
       setCurrentStep('dashboard');
       setTempStaffData(null);
    } catch (e) {
      alert('Error saving staff');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Shift Logic
  const handleShiftTypeSelected = (type: 'fixed' | 'open' | 'rotational') => {
    setShowShiftTypeModal(false);
    if (type === 'fixed') {
      setCurrentStep('add_fixed_shift');
    } else {
      alert(`${type} shift coming soon`);
    }
  };

  const handleFixedShiftContinue = (shiftData: Omit<Shift, 'id'>) => {
    setTempShiftData(shiftData);
    setCurrentStep('assign_shift');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-start pt-0 sm:bg-gray-50 sm:justify-center">
      
      {/* Screen Router */}
      {currentStep === 'business_details' && (
        <BusinessDetailsScreen 
          onContinue={handleBusinessDetailsSubmit}
          isSubmitting={isSubmitting && !welcomeData.show} // Stop showing loading when flash is active
        />
      )}

      {currentStep === 'usage_selection' && (
        <UsageSelectionScreen 
          adminName={adminName}
          onSelect={handleUsageSelection}
          isSubmitting={isSubmitting}
        />
      )}

      {currentStep === 'salary_calculation' && (
        <SalaryScreen 
          onBack={() => setCurrentStep('business_details')} // Theoretically could go back, but DB state is already partial
          onContinue={handleSalarySubmit}
          isSubmitting={isSubmitting}
        />
      )}

      {currentStep === 'dashboard' && (
        <DashboardScreen 
          businessName={businessName} 
          onAddStaff={handleAddStaffFlow}
          onNavigateToShifts={() => setCurrentStep('shift_list')}
          onExecutePayroll={() => setCurrentStep('finalize_payroll')}
          onLoadWallet={() => setCurrentStep('load_wallet')}
        />
      )}

      {currentStep === 'load_wallet' && (
        <LoadWalletScreen 
          onBack={() => setCurrentStep('dashboard')}
        />
      )}

      {currentStep === 'finalize_payroll' && (
        <FinalizePayrollScreen
          onBack={() => setCurrentStep('dashboard')}
        />
      )}

      {currentStep === 'shift_list' && (
        <ShiftListScreen
          onBack={() => setCurrentStep('dashboard')}
          onAddShift={() => setShowShiftTypeModal(true)}
          onManageShift={(shift) => {
             setEditingShift(shift);
             setCurrentStep('edit_shift');
          }}
          onManageStaff={(shift) => {
             setEditingShift(shift);
             setCurrentStep('edit_shift_staff');
          }}
        />
      )}

      {currentStep === 'add_fixed_shift' && (
        <AddFixedShiftScreen 
          onBack={() => setCurrentStep('shift_list')}
          onContinue={handleFixedShiftContinue}
        />
      )}

      {currentStep === 'edit_shift' && editingShift && (
        <AddFixedShiftScreen 
          onBack={() => setCurrentStep('shift_list')}
          onContinue={() => {}} // Not used in edit mode
          initialData={editingShift}
        />
      )}

      {currentStep === 'assign_shift' && tempShiftData && (
        <AssignShiftScreen
          shiftData={tempShiftData}
          onBack={() => setCurrentStep('add_fixed_shift')}
          onSuccess={() => setCurrentStep('shift_list')}
        />
      )}

      {currentStep === 'edit_shift_staff' && editingShift && (
        <AssignShiftScreen
          shiftData={editingShift}
          onBack={() => setCurrentStep('shift_list')}
          onSuccess={() => setCurrentStep('shift_list')}
          existingShiftId={editingShift.id}
        />
      )}

      {currentStep === 'add_staff' && selectedStaffType && (
        <AddStaffScreen
          staffType={selectedStaffType}
          businessId={businessId}
          onBack={() => setCurrentStep('dashboard')}
          onNext={handleStaffDetailsNext}
        />
      )}

      {currentStep === 'add_staff_salary' && (
        <AddSalaryScreen 
          onBack={() => setCurrentStep('add_staff')}
          onPreview={handleSalaryNext}
          isSubmitting={false} // No API call here anymore, just state transition
        />
      )}

      {currentStep === 'add_general_info' && (
        <AddGeneralInfoScreen
          onBack={() => setCurrentStep('add_staff_salary')}
          onSave={handleGeneralInfoSubmit}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Global Overlays */}
      <WelcomeFlash 
        show={welcomeData.show} 
        name={welcomeData.name} 
        onClose={handleFlashClose} 
      />

      <ShiftTypeModal 
        isOpen={showShiftTypeModal}
        onClose={() => setShowShiftTypeModal(false)}
        onContinue={handleShiftTypeSelected}
      />
      
      {/* Scrollbar hide utility */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </div>
  );
};

export default App;
