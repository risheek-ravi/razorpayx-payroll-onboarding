import React, {useState, useEffect} from 'react';
import {TouchableOpacity} from 'react-native';
import {
  BottomSheet,
  BottomSheetHeader,
  BottomSheetBody,
  BottomSheetFooter,
  Box,
  Button,
  Text,
  TextInput,
  Divider,
} from '@razorpay/blade/components';
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
      {/* Main Payment Details Sheet */}
      <BottomSheet
        isOpen={visible}
        onDismiss={onClose}
        snapPoints={[0.5, 0.75, 0.9]}>
        <BottomSheetHeader
          title={employee.fullName}
          subtitle={`${employee.wageType} • ${employee.companyId}`}
        />

        <BottomSheetBody>
          <Box display="flex" flexDirection="column" gap="spacing.5">
            {/* Net Pay Hero */}
            <Box
              backgroundColor="surface.background.primary.subtle"
              borderRadius="medium"
              padding="spacing.6"
              display="flex"
              flexDirection="column"
              alignItems="center">
              <Text
                size="small"
                weight="semibold"
                color="surface.text.primary.normal">
                NET PAY
              </Text>
              <Text size="large" weight="semibold" marginTop="spacing.2">
                {formatCurrency(localEntry.netPay)}
              </Text>
              <Text
                size="small"
                color="surface.text.gray.muted"
                marginTop="spacing.2">
                Based on{' '}
                {employee.wageType === 'Monthly' ? '30 days' : 'Attendance'}
              </Text>
            </Box>

            {/* Base Salary */}
            <Box
              display="flex"
              flexDirection="row"
              justifyContent="space-between"
              paddingY="spacing.3">
              <Text weight="medium">Base Salary</Text>
              <Text weight="semibold">
                {formatCurrency(localEntry.baseAmount)}
              </Text>
            </Box>

            <Divider />

            {/* Additions Section */}
            <Box>
              <Box
                display="flex"
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                marginBottom="spacing.3">
                <Text weight="semibold">Additions</Text>
                <Button
                  size="xsmall"
                  variant="tertiary"
                  onClick={() =>
                    setNewAdjustment({type: 'addition', label: '', amount: ''})
                  }>
                  + Add
                </Button>
              </Box>

              {localEntry.adjustments
                .filter(a => a.type === 'addition')
                .map(adj => (
                  <Box
                    key={adj.id}
                    display="flex"
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems="center"
                    paddingY="spacing.2">
                    <Text>{adj.label}</Text>
                    <Box
                      display="flex"
                      flexDirection="row"
                      alignItems="center"
                      gap="spacing.3">
                      <Text color="feedback.text.positive.intense">
                        +{formatCurrency(adj.amount)}
                      </Text>
                      <Button
                        size="xsmall"
                        variant="tertiary"
                        onClick={() => removeAdjustment(adj.id)}>
                        🗑
                      </Button>
                    </Box>
                  </Box>
                ))}
            </Box>

            <Divider />

            {/* Deductions Section */}
            <Box>
              <Box
                display="flex"
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                marginBottom="spacing.3">
                <Text weight="semibold">Deductions</Text>
                <Button
                  size="xsmall"
                  variant="tertiary"
                  onClick={() =>
                    setNewAdjustment({
                      type: 'deduction',
                      label: '',
                      amount: '',
                    })
                  }>
                  + Add
                </Button>
              </Box>

              {localEntry.adjustments
                .filter(a => a.type === 'deduction')
                .map(adj => (
                  <Box
                    key={adj.id}
                    display="flex"
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems="center"
                    paddingY="spacing.2">
                    <Text>{adj.label}</Text>
                    <Box
                      display="flex"
                      flexDirection="row"
                      alignItems="center"
                      gap="spacing.3">
                      <Text color="feedback.text.negative.intense">
                        -{formatCurrency(adj.amount)}
                      </Text>
                      <Button
                        size="xsmall"
                        variant="tertiary"
                        onClick={() => removeAdjustment(adj.id)}>
                        🗑
                      </Button>
                    </Box>
                  </Box>
                ))}
            </Box>

            <Divider />

            {/* Payment Method */}
            <Box>
              <Text weight="semibold" marginBottom="spacing.3">
                Payment Method
              </Text>
              <Button
                variant="secondary"
                isFullWidth
                onClick={() => setShowPaymentMethodSheet(true)}>
                {localEntry.paymentMode === 'UPI' ? '📱 UPI' : '🏦 Bank'}
              </Button>

              {!isPaymentMethodValid && (
                <Box
                  backgroundColor="surface.background.gray.moderate"
                  padding="spacing.3"
                  borderRadius="medium"
                  marginTop="spacing.3">
                  <Text size="small" color="feedback.text.negative.intense">
                    ⚠️ Missing {localEntry.paymentMode} details for this
                    employee.
                  </Text>
                </Box>
              )}
            </Box>
          </Box>
        </BottomSheetBody>

        <BottomSheetFooter>
          <Button
            isFullWidth
            variant="primary"
            isDisabled={!isPaymentMethodValid}
            onClick={() => onSave(localEntry)}>
            Save Changes
          </Button>
        </BottomSheetFooter>
      </BottomSheet>

      {/* Payment Method Selection Sheet */}
      <BottomSheet
        isOpen={showPaymentMethodSheet}
        onDismiss={() => setShowPaymentMethodSheet(false)}
        snapPoints={[0.4, 0.5, 0.6]}>
        <BottomSheetHeader title="Select Payment Method" />
        <BottomSheetBody>
          <Box display="flex" flexDirection="column" gap="spacing.4">
            {/* UPI Option */}
            <TouchableOpacity
              onPress={() => {
                setLocalEntry(prev => ({...prev, paymentMode: 'UPI'}));
                setShowPaymentMethodSheet(false);
              }}>
              <Box
                borderWidth="thin"
                borderColor={
                  localEntry.paymentMode === 'UPI'
                    ? 'surface.border.primary.normal'
                    : 'surface.border.gray.muted'
                }
                borderRadius="medium"
                padding="spacing.5"
                backgroundColor={
                  localEntry.paymentMode === 'UPI'
                    ? 'surface.background.primary.subtle'
                    : 'surface.background.gray.subtle'
                }
                display="flex"
                flexDirection="column"
                alignItems="flex-start">
                <Box
                  display="flex"
                  flexDirection="row"
                  alignItems="center"
                  gap="spacing.3"
                  width="100%">
                  <Text size="large">📱</Text>
                  <Text weight="semibold">UPI</Text>
                  {localEntry.paymentMode === 'UPI' && (
                    <Text
                      color="surface.text.primary.normal"
                      weight="semibold"
                      marginLeft="auto">
                      ✓
                    </Text>
                  )}
                </Box>
                <Text
                  size="small"
                  color="surface.text.gray.muted"
                  marginTop="spacing.2">
                  {hasUPI
                    ? employee.paymentDetails?.upiId
                    : 'No UPI ID available'}
                </Text>
              </Box>
            </TouchableOpacity>

            {/* Bank Option */}
            <TouchableOpacity
              onPress={() => {
                setLocalEntry(prev => ({...prev, paymentMode: 'Bank'}));
                setShowPaymentMethodSheet(false);
              }}>
              <Box
                borderWidth="thin"
                borderColor={
                  localEntry.paymentMode === 'Bank'
                    ? 'surface.border.primary.normal'
                    : 'surface.border.gray.muted'
                }
                borderRadius="medium"
                padding="spacing.5"
                backgroundColor={
                  localEntry.paymentMode === 'Bank'
                    ? 'surface.background.primary.subtle'
                    : 'surface.background.gray.subtle'
                }
                display="flex"
                flexDirection="column"
                alignItems="flex-start">
                <Box
                  display="flex"
                  flexDirection="row"
                  alignItems="center"
                  gap="spacing.3"
                  width="100%">
                  <Text size="large">🏦</Text>
                  <Text weight="semibold">Bank Transfer</Text>
                  {localEntry.paymentMode === 'Bank' && (
                    <Text
                      color="surface.text.primary.normal"
                      weight="semibold"
                      marginLeft="auto">
                      ✓
                    </Text>
                  )}
                </Box>
                <Text
                  size="small"
                  color="surface.text.gray.muted"
                  marginTop="spacing.2">
                  {hasBank
                    ? `****${employee.paymentDetails?.accountNumber?.slice(-4)}`
                    : 'No bank account available'}
                </Text>
              </Box>
            </TouchableOpacity>
          </Box>
        </BottomSheetBody>
      </BottomSheet>

      {/* Add Adjustment Sheet */}
      {newAdjustment && (
        <BottomSheet
          isOpen={!!newAdjustment}
          onDismiss={() => setNewAdjustment(null)}
          snapPoints={[0.4, 0.5, 0.6]}>
          <BottomSheetHeader
            title={`Add ${
              newAdjustment.type === 'addition' ? 'Earnings' : 'Deduction'
            }`}
          />
          <BottomSheetBody>
            <Box display="flex" flexDirection="column" gap="spacing.5">
              <TextInput
                label="Label"
                placeholder="e.g. Overtime, Advance"
                value={newAdjustment.label}
                onChange={({value}) =>
                  setNewAdjustment(prev =>
                    prev ? {...prev, label: value ?? ''} : null,
                  )
                }
              />
              <TextInput
                label="Amount"
                placeholder="0"
                value={newAdjustment.amount}
                onChange={({value}) =>
                  setNewAdjustment(prev =>
                    prev ? {...prev, amount: value ?? ''} : null,
                  )
                }
              />
            </Box>
          </BottomSheetBody>
          <BottomSheetFooter>
            <Button
              isFullWidth
              onClick={handleAddAdjustment}
              isDisabled={!newAdjustment.label || !newAdjustment.amount}>
              Add
            </Button>
          </BottomSheetFooter>
        </BottomSheet>
      )}
    </>
  );
};
