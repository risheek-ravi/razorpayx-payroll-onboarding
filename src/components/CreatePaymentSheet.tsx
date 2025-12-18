import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {Employee} from '../types';
import {PaymentSecurityModal} from './PaymentSecurityModal';

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

export const CreatePaymentSheet: React.FC<CreatePaymentSheetProps> = ({
  isOpen,
  onClose,
  type,
  employees,
  onSave,
  initialData,
}) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [narration, setNarration] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<string>('Cash');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [upiId, setUpiId] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSecurityModal, setShowSecurityModal] = useState(false);

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
      setPhoneNumber('');
      setUpiId('');
      setIsDropdownOpen(false);
      setSearchTerm('');
      setShowSecurityModal(false);
    }
  }, [isOpen, initialData]);

  // Update payment mode default when employee changes
  useEffect(() => {
    if (selectedEmployeeId) {
      const emp = employees.find(e => e.id === selectedEmployeeId);
      if (emp && emp.paymentDetails?.paymentMode) {
        if (
          emp.paymentDetails.paymentMode === 'NEFT' ||
          emp.paymentDetails.paymentMode === 'IMPS'
        ) {
          setPaymentMode('Bank Transfer');
          setPhoneNumber(emp.phoneNumber || '');
          setUpiId('');
        } else if (emp.paymentDetails.upiId) {
          setPaymentMode('UPI');
          setPhoneNumber(emp.phoneNumber || '');
          setUpiId(emp.paymentDetails.upiId || '');
        } else {
          setPaymentMode('Cash');
          setPhoneNumber('');
          setUpiId('');
        }
      }
    }
  }, [selectedEmployeeId, employees]);

  const selectedEmployee = employees.find(e => e.id === selectedEmployeeId);
  const filteredEmployees = employees.filter(e =>
    e.fullName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handlePayClick = () => {
    if (!selectedEmployeeId || !amount) {
      return;
    }
    // Validate UPI ID if UPI mode is selected
    if (paymentMode === 'UPI' && !upiId) {
      return;
    }
    // Validate phone number if Phone mode is selected
    if (
      paymentMode === 'Phone' &&
      (!phoneNumber || phoneNumber.length !== 10)
    ) {
      return;
    }
    setShowSecurityModal(true);
  };

  const handleSecuritySuccess = () => {
    setShowSecurityModal(false);
    const date = new Date();
    const formattedDate = `${date.getDate()} ${date.toLocaleString('en-GB', {
      month: 'short',
    })} ${date.getFullYear()}`;
    onSave({
      employeeId: selectedEmployeeId,
      amount: parseFloat(amount),
      narration,
      paymentMode,
      phoneNumber:
        paymentMode === 'UPI' ||
        paymentMode === 'Bank Transfer' ||
        paymentMode === 'Phone'
          ? phoneNumber
          : undefined,
      upiId: paymentMode === 'UPI' ? upiId : undefined,
      mobileNumber: paymentMode === 'Phone' ? phoneNumber : undefined,
      date: formattedDate,
    });
    onClose();
  };

  const formatCurrency = (val: number) => {
    const safeVal =
      typeof val === 'number' && isFinite(val) ? Math.round(val) : 0;
    const numStr = safeVal.toString();
    let result = '';
    const len = numStr.length;

    if (len <= 3) {
      result = numStr;
    } else {
      result = numStr.slice(-3);
      let remaining = numStr.slice(0, -3);
      while (remaining.length > 2) {
        result = remaining.slice(-2) + ',' + result;
        remaining = remaining.slice(0, -2);
      }
      if (remaining.length > 0) {
        result = remaining + ',' + result;
      }
    }
    return `₹${result}`;
  };

  return (
    <>
      <Modal visible={isOpen} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={onClose}
          />

          <View style={styles.sheet}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>
                {type === 'one-time'
                  ? 'Create One-Time Payment'
                  : 'Create Advance Payment'}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
              {/* Employee Selector */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Select Employee</Text>
                <TouchableOpacity
                  onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                  style={[
                    styles.dropdown,
                    isDropdownOpen && styles.dropdownActive,
                  ]}>
                  <Text
                    style={[
                      styles.dropdownText,
                      !selectedEmployee && styles.dropdownPlaceholder,
                    ]}>
                    {selectedEmployee
                      ? `${selectedEmployee.fullName}${
                          type === 'advance' && selectedEmployee.salaryAmount
                            ? ` (Sal: ${formatCurrency(
                                Number(selectedEmployee.salaryAmount),
                              )})`
                            : ''
                        }`
                      : '-- Select Employee --'}
                  </Text>
                  <Text style={styles.dropdownIcon}>▼</Text>
                </TouchableOpacity>
              </View>

              {/* Dropdown List */}
              {isDropdownOpen && (
                <View style={styles.dropdownList}>
                  <View style={styles.searchContainer}>
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search..."
                      value={searchTerm}
                      onChangeText={setSearchTerm}
                      autoFocus
                    />
                  </View>
                  <ScrollView style={styles.dropdownScroll}>
                    {filteredEmployees.length === 0 ? (
                      <Text style={styles.noResults}>No employees found</Text>
                    ) : (
                      filteredEmployees.map(emp => (
                        <TouchableOpacity
                          key={emp.id}
                          onPress={() => {
                            setSelectedEmployeeId(emp.id);
                            setIsDropdownOpen(false);
                          }}
                          style={[
                            styles.dropdownItem,
                            selectedEmployeeId === emp.id &&
                              styles.dropdownItemActive,
                          ]}>
                          <View style={styles.dropdownItemContent}>
                            <Text
                              style={[
                                styles.dropdownItemText,
                                selectedEmployeeId === emp.id &&
                                  styles.dropdownItemTextActive,
                              ]}>
                              {emp.fullName}
                            </Text>
                            {type === 'advance' && emp.salaryAmount && (
                              <Text style={styles.dropdownItemSubtext}>
                                Salary:{' '}
                                {formatCurrency(Number(emp.salaryAmount))}
                              </Text>
                            )}
                          </View>
                          {selectedEmployeeId === emp.id && (
                            <Text style={styles.checkmark}>✓</Text>
                          )}
                        </TouchableOpacity>
                      ))
                    )}
                  </ScrollView>
                </View>
              )}

              {/* Amount */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Amount</Text>
                <View style={styles.amountInputContainer}>
                  <Text style={styles.currencySymbol}>₹</Text>
                  <TextInput
                    style={styles.amountInput}
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="0"
                    placeholderTextColor="#D1D5DB"
                  />
                </View>
              </View>

              {/* Payment Mode */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Payment Mode</Text>
                <View style={styles.paymentModeGrid}>
                  {['Cash', 'UPI', 'Phone', 'Bank Transfer'].map(mode => (
                    <TouchableOpacity
                      key={mode}
                      onPress={() => {
                        setPaymentMode(mode);
                        if (mode === 'Cash') {
                          setPhoneNumber('');
                          setUpiId('');
                        } else if (mode === 'Phone') {
                          setUpiId(''); // Phone mode doesn't need UPI ID
                          // Keep or set phone number from employee
                          if (selectedEmployee) {
                            setPhoneNumber(selectedEmployee.phoneNumber || '');
                          }
                        }
                      }}
                      style={[
                        styles.paymentModeButton,
                        paymentMode === mode && styles.paymentModeButtonActive,
                      ]}>
                      <Text
                        style={[
                          styles.paymentModeButtonText,
                          paymentMode === mode &&
                            styles.paymentModeButtonTextActive,
                        ]}>
                        {mode === 'Bank Transfer' ? 'Bank' : mode}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* UPI ID - Show when UPI is selected */}
              {paymentMode === 'UPI' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>UPI ID*</Text>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="email-address"
                    value={upiId}
                    onChangeText={setUpiId}
                    placeholder="e.g. 9876543210@paytm"
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="none"
                  />
                </View>
              )}

              {/* Phone Number for Mobile Payment - Show when Phone mode is selected */}
              {paymentMode === 'Phone' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Mobile Number for UPI Payment*
                  </Text>
                  <View style={styles.phoneInputContainer}>
                    <Text style={styles.phonePrefix}>+91</Text>
                    <TextInput
                      style={styles.phoneInput}
                      keyboardType="phone-pad"
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      placeholder="Enter 10-digit mobile number"
                      placeholderTextColor="#9CA3AF"
                      maxLength={10}
                    />
                  </View>
                  <Text style={styles.inputHint}>
                    Payment will be sent to the bank account linked with this
                    mobile number
                  </Text>
                </View>
              )}

              {/* Phone Number - Show when UPI or Bank Transfer is selected */}
              {(paymentMode === 'UPI' || paymentMode === 'Bank Transfer') && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Phone Number</Text>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="phone-pad"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    placeholder="Enter phone number"
                    placeholderTextColor="#9CA3AF"
                    maxLength={10}
                  />
                </View>
              )}

              {/* Narration */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Narration (Optional)</Text>
                <TextInput
                  style={styles.textInput}
                  value={narration}
                  onChangeText={setNarration}
                  placeholder="e.g. Diwali Bonus"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
              <TouchableOpacity
                onPress={handlePayClick}
                disabled={
                  !selectedEmployeeId ||
                  !amount ||
                  (paymentMode === 'UPI' && !upiId) ||
                  (paymentMode === 'Phone' &&
                    (!phoneNumber || phoneNumber.length !== 10))
                }
                style={[
                  styles.payButton,
                  (!selectedEmployeeId ||
                    !amount ||
                    (paymentMode === 'UPI' && !upiId) ||
                    (paymentMode === 'Phone' &&
                      (!phoneNumber || phoneNumber.length !== 10))) &&
                    styles.payButtonDisabled,
                ]}>
                <Text
                  style={[
                    styles.payButtonText,
                    (!selectedEmployeeId ||
                      !amount ||
                      (paymentMode === 'UPI' && !upiId) ||
                      (paymentMode === 'Phone' &&
                        (!phoneNumber || phoneNumber.length !== 10))) &&
                      styles.payButtonTextDisabled,
                  ]}>
                  Pay & Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <PaymentSecurityModal
        isOpen={showSecurityModal}
        onClose={() => setShowSecurityModal(false)}
        onSuccess={handleSecuritySuccess}
        amount={amount ? parseFloat(amount) : undefined}
      />
    </>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#6B7280',
  },
  content: {
    padding: 16,
    minHeight: 300,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 8,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  dropdownActive: {
    borderColor: '#3B82F6',
    borderWidth: 2,
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  dropdownPlaceholder: {
    color: '#9CA3AF',
    fontWeight: '400',
  },
  dropdownIcon: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  dropdownList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    maxHeight: 240,
    overflow: 'hidden',
  },
  searchContainer: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  searchInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
  },
  dropdownScroll: {
    maxHeight: 180,
  },
  noResults: {
    padding: 16,
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 14,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  dropdownItemActive: {
    backgroundColor: '#EFF6FF',
  },
  dropdownItemContent: {
    flex: 1,
  },
  dropdownItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  dropdownItemTextActive: {
    fontWeight: '700',
    color: '#1E40AF',
  },
  dropdownItemSubtext: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  checkmark: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '700',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    paddingVertical: 14,
  },
  paymentModeGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  paymentModeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  paymentModeButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  paymentModeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  paymentModeButtonTextActive: {
    color: '#FFFFFF',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  phonePrefix: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    backgroundColor: '#F9FAFB',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  phoneInput: {
    flex: 1,
    padding: 12,
    fontSize: 14,
    color: '#111827',
  },
  inputHint: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 6,
    fontStyle: 'italic',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#F9FAFB',
  },
  payButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  payButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  payButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  payButtonTextDisabled: {
    color: '#9CA3AF',
  },
});
