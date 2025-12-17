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
import {Employee, PayrollEntry, PayrollAdjustment} from '../types';

interface PaymentDetailsSheetProps {
  employee: Employee;
  entry: PayrollEntry;
  onSave: (updatedEntry: PayrollEntry) => void;
  onClose: () => void;
  visible: boolean;
}

export const PaymentDetailsSheet: React.FC<PaymentDetailsSheetProps> = ({
  employee,
  entry,
  onSave,
  onClose,
  visible,
}) => {
  const [localEntry, setLocalEntry] = useState<PayrollEntry>(entry);
  const [newAdjustment, setNewAdjustment] = useState<{
    label: string;
    amount: string;
    type: 'addition' | 'deduction';
  } | null>(null);
  const [showPaymentMethodSheet, setShowPaymentMethodSheet] = useState(false);

  // Recalculate Net Pay whenever base or adjustments change
  useEffect(() => {
    const totalAdditions = localEntry.adjustments
      .filter(a => a.type === 'addition')
      .reduce((sum, a) => sum + a.amount, 0);

    const totalDeductions = localEntry.adjustments
      .filter(a => a.type === 'deduction')
      .reduce((sum, a) => sum + a.amount, 0);

    const netPay = Math.max(
      0,
      localEntry.baseAmount + totalAdditions - totalDeductions,
    );

    setLocalEntry(prev => ({...prev, netPay}));
  }, [localEntry.adjustments, localEntry.baseAmount]);

  // Validation
  const hasUPI = !!employee.paymentDetails?.upiId;
  const hasBank = !!employee.paymentDetails?.accountNumber;
  const isPaymentMethodValid =
    (localEntry.paymentMode === 'UPI' && hasUPI) ||
    (localEntry.paymentMode === 'Bank' && hasBank);

  const handleAddAdjustment = () => {
    if (!newAdjustment || !newAdjustment.label || !newAdjustment.amount) {
      return;
    }

    const adjustment: PayrollAdjustment = {
      id: Date.now().toString(),
      type: newAdjustment.type,
      label: newAdjustment.label,
      amount: parseFloat(newAdjustment.amount),
    };

    setLocalEntry(prev => ({
      ...prev,
      adjustments: [...prev.adjustments, adjustment],
    }));
    setNewAdjustment(null);
  };

  const removeAdjustment = (id: string) => {
    setLocalEntry(prev => ({
      ...prev,
      adjustments: prev.adjustments.filter(a => a.id !== id),
    }));
  };

  // Manual Indian number formatting (avoids Hermes Intl issues)
  const formatCurrency = (val: number) => {
    const safeVal =
      typeof val === 'number' && isFinite(val) ? Math.round(val) : 0;
    // Format number with Indian comma separators (lakhs/crores)
    const numStr = safeVal.toString();
    let result = '';
    const len = numStr.length;

    if (len <= 3) {
      result = numStr;
    } else {
      // Last 3 digits
      result = numStr.slice(-3);
      let remaining = numStr.slice(0, -3);
      // Add commas every 2 digits for Indian format
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
      <Modal visible={visible} animationType="slide" transparent>
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
              <View>
                <Text style={styles.headerTitle}>{employee.fullName}</Text>
                <Text style={styles.headerSubtitle}>
                  {employee.wageType} • {employee.companyId}
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Scrollable Content */}
            <ScrollView style={styles.content}>
              {/* Net Pay Hero */}
              <View style={styles.netPayHero}>
                <Text style={styles.netPayLabel}>Net Pay</Text>
                <Text style={styles.netPayAmount}>
                  {formatCurrency(localEntry.netPay)}
                </Text>
                <Text style={styles.netPayNote}>
                  Based on{' '}
                  {employee.wageType === 'Monthly' ? '30 days' : 'Attendance'}
                </Text>
              </View>

              {/* Breakdown */}
              <View style={styles.breakdown}>
                {/* Base Salary */}
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Base Salary</Text>
                  <Text style={styles.breakdownValue}>
                    {formatCurrency(localEntry.baseAmount)}
                  </Text>
                </View>

                {/* Additions */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Additions</Text>
                    <TouchableOpacity
                      onPress={() =>
                        setNewAdjustment({
                          type: 'addition',
                          label: '',
                          amount: '',
                        })
                      }
                      style={styles.addButton}>
                      <Text style={styles.addButtonText}>+ Add</Text>
                    </TouchableOpacity>
                  </View>

                  {localEntry.adjustments
                    .filter(a => a.type === 'addition')
                    .map(adj => (
                      <View key={adj.id} style={styles.adjustmentRow}>
                        <Text style={styles.adjustmentLabel}>{adj.label}</Text>
                        <View style={styles.adjustmentRight}>
                          <Text style={styles.adjustmentAmountAdd}>
                            +{formatCurrency(adj.amount)}
                          </Text>
                          <TouchableOpacity
                            onPress={() => removeAdjustment(adj.id)}>
                            <Text style={styles.deleteButton}>🗑</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                </View>

                {/* Deductions */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Deductions</Text>
                    <TouchableOpacity
                      onPress={() =>
                        setNewAdjustment({
                          type: 'deduction',
                          label: '',
                          amount: '',
                        })
                      }
                      style={[styles.addButton, styles.addButtonOrange]}>
                      <Text
                        style={[
                          styles.addButtonText,
                          styles.addButtonTextOrange,
                        ]}>
                        + Add
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {localEntry.adjustments
                    .filter(a => a.type === 'deduction')
                    .map(adj => (
                      <View key={adj.id} style={styles.adjustmentRow}>
                        <Text style={styles.adjustmentLabel}>{adj.label}</Text>
                        <View style={styles.adjustmentRight}>
                          <Text style={styles.adjustmentAmountDeduct}>
                            -{formatCurrency(adj.amount)}
                          </Text>
                          <TouchableOpacity
                            onPress={() => removeAdjustment(adj.id)}>
                            <Text style={styles.deleteButton}>🗑</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                </View>

                {/* Payment Method */}
                <View style={styles.paymentMethodSection}>
                  <Text style={styles.sectionTitle}>Payment Method</Text>
                  <TouchableOpacity
                    onPress={() => setShowPaymentMethodSheet(true)}
                    style={styles.paymentMethodSelector}>
                    <View style={styles.paymentMethodSelectorContent}>
                      <Text style={styles.paymentMethodSelectorLabel}>
                        {localEntry.paymentMode === 'UPI'
                          ? '📱 UPI'
                          : '🏦 Bank'}
                      </Text>
                      <Text style={styles.paymentMethodSelectorIcon}>›</Text>
                    </View>
                  </TouchableOpacity>

                  {/* Validation Error */}
                  {!isPaymentMethodValid && (
                    <View style={styles.errorBanner}>
                      <Text style={styles.errorText}>
                        ⚠️ Missing {localEntry.paymentMode} details for this
                        employee.
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
              <TouchableOpacity
                onPress={() => onSave(localEntry)}
                disabled={!isPaymentMethodValid}
                style={[
                  styles.saveButton,
                  !isPaymentMethodValid && styles.saveButtonDisabled,
                ]}>
                <Text
                  style={[
                    styles.saveButtonText,
                    !isPaymentMethodValid && styles.saveButtonTextDisabled,
                  ]}>
                  Save Changes
                </Text>
              </TouchableOpacity>
            </View>

            {/* Add Adjustment Overlay */}
            {newAdjustment && (
              <View style={styles.addAdjustmentOverlay}>
                <View style={styles.addAdjustmentHeader}>
                  <Text style={styles.addAdjustmentTitle}>
                    Add{' '}
                    {newAdjustment.type === 'addition'
                      ? 'Earnings'
                      : 'Deduction'}
                  </Text>
                  <TouchableOpacity onPress={() => setNewAdjustment(null)}>
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.addAdjustmentForm}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Label</Text>
                    <TextInput
                      autoFocus
                      value={newAdjustment.label}
                      onChangeText={text =>
                        setNewAdjustment(prev =>
                          prev ? {...prev, label: text} : null,
                        )
                      }
                      placeholder="e.g. Overtime, Advance"
                      style={styles.textInput}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Amount</Text>
                    <TextInput
                      keyboardType="numeric"
                      value={newAdjustment.amount}
                      onChangeText={text =>
                        setNewAdjustment(prev =>
                          prev ? {...prev, amount: text} : null,
                        )
                      }
                      placeholder="0"
                      style={styles.textInput}
                    />
                  </View>

                  <TouchableOpacity
                    onPress={handleAddAdjustment}
                    disabled={!newAdjustment.label || !newAdjustment.amount}
                    style={[
                      styles.addAdjustmentButton,
                      (!newAdjustment.label || !newAdjustment.amount) &&
                        styles.addAdjustmentButtonDisabled,
                    ]}>
                    <Text style={styles.addAdjustmentButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Payment Method Bottom Sheet */}
      <Modal visible={showPaymentMethodSheet} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.paymentMethodModalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={() => setShowPaymentMethodSheet(false)}
          />

          <View style={styles.paymentMethodSheet}>
            {/* Header */}
            <View style={styles.paymentMethodSheetHeader}>
              <Text style={styles.paymentMethodSheetTitle}>
                Select Payment Method
              </Text>
              <TouchableOpacity
                onPress={() => setShowPaymentMethodSheet(false)}
                style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Payment Options */}
            <View style={styles.paymentMethodSheetContent}>
              <TouchableOpacity
                onPress={() => {
                  setLocalEntry(prev => ({...prev, paymentMode: 'UPI'}));
                  setShowPaymentMethodSheet(false);
                }}
                style={[
                  styles.paymentMethodOption,
                  localEntry.paymentMode === 'UPI' &&
                    styles.paymentMethodOptionActive,
                ]}>
                <View style={styles.paymentMethodOptionLeft}>
                  <Text style={styles.paymentMethodOptionIcon}>📱</Text>
                  <View>
                    <Text style={styles.paymentMethodOptionTitle}>UPI</Text>
                    <Text style={styles.paymentMethodOptionSubtitle}>
                      {hasUPI
                        ? employee.paymentDetails?.upiId
                        : 'No UPI ID available'}
                    </Text>
                  </View>
                </View>
                {localEntry.paymentMode === 'UPI' && (
                  <Text style={styles.paymentMethodOptionCheck}>✓</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setLocalEntry(prev => ({...prev, paymentMode: 'Bank'}));
                  setShowPaymentMethodSheet(false);
                }}
                style={[
                  styles.paymentMethodOption,
                  localEntry.paymentMode === 'Bank' &&
                    styles.paymentMethodOptionActive,
                ]}>
                <View style={styles.paymentMethodOptionLeft}>
                  <Text style={styles.paymentMethodOptionIcon}>🏦</Text>
                  <View>
                    <Text style={styles.paymentMethodOptionTitle}>
                      Bank Transfer
                    </Text>
                    <Text style={styles.paymentMethodOptionSubtitle}>
                      {hasBank
                        ? `****${employee.paymentDetails?.accountNumber?.slice(
                            -4,
                          )}`
                        : 'No bank account available'}
                    </Text>
                  </View>
                </View>
                {localEntry.paymentMode === 'Bank' && (
                  <Text style={styles.paymentMethodOptionCheck}>✓</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    height: '100%',
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
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#6B7280',
  },
  content: {
    flex: 1,
    padding: 16,
    paddingBottom: 80,
  },
  netPayHero: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  netPayLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3B82F6',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  netPayAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
  },
  netPayNote: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
  },
  breakdown: {
    gap: 24,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  breakdownLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  addButton: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  addButtonOrange: {
    backgroundColor: '#FFF7ED',
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
  },
  addButtonTextOrange: {
    color: '#EA580C',
  },
  adjustmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  adjustmentLabel: {
    fontSize: 14,
    color: '#4B5563',
  },
  adjustmentRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  adjustmentAmountAdd: {
    fontSize: 14,
    fontWeight: '500',
    color: '#16A34A',
  },
  adjustmentAmountDeduct: {
    fontSize: 14,
    fontWeight: '500',
    color: '#EF4444',
  },
  deleteButton: {
    fontSize: 14,
    color: '#D1D5DB',
  },
  paymentMethodSection: {
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  paymentMethodSelector: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  paymentMethodSelectorContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentMethodSelectorLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  paymentMethodSelectorIcon: {
    fontSize: 24,
    color: '#9CA3AF',
  },
  paymentMethodModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  paymentMethodSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 40,
  },
  paymentMethodSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  paymentMethodSheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  paymentMethodSheetContent: {
    padding: 20,
    gap: 16,
    paddingBottom: 40,
  },
  paymentMethodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    minHeight: 80,
  },
  paymentMethodOptionActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  paymentMethodOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  paymentMethodOptionIcon: {
    fontSize: 24,
  },
  paymentMethodOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  paymentMethodOptionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  paymentMethodOptionCheck: {
    fontSize: 20,
    color: '#3B82F6',
    fontWeight: '700',
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  saveButtonTextDisabled: {
    color: '#9CA3AF',
  },
  addAdjustmentOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  addAdjustmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  addAdjustmentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  addAdjustmentForm: {
    gap: 16,
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  textInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
    paddingVertical: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  addAdjustmentButton: {
    backgroundColor: '#111827',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  addAdjustmentButtonDisabled: {
    opacity: 0.5,
  },
  addAdjustmentButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
