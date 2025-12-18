import React, {useState, useEffect, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  RootStackParamList,
  PayrollEntry,
  Employee,
  BusinessDetails,
} from '../types';
import {
  getEmployees,
  getLatestBusinessDetails,
  createUPIPayout,
  createBankPayout,
  createMobilePayout,
} from '../services/dbService';
import {savePayment, getPayments} from '../services/paymentService';
import {getRazorpayCredentials} from '../config/razorpay';
import {PaymentDetailsSheet} from '../components/PaymentDetailsSheet';
import {CreatePaymentSheet} from '../components/CreatePaymentSheet';
import {PaymentSecurityModal} from '../components/PaymentSecurityModal';

type Props = NativeStackScreenProps<RootStackParamList, 'FinalizePayroll'>;

type Tab = 'Daily' | 'Monthly' | 'One-Time' | 'Advance';
type FilterType = 'all' | 'selected' | 'not_selected';

interface HistoryItem {
  id: string;
  name: string;
  amount: number;
  date: string;
  reason: string;
}

export const FinalizePayrollScreen: React.FC<Props> = ({navigation}) => {
  const [activeTab, setActiveTab] = useState<Tab>('Monthly');
  const [entries, setEntries] = useState<PayrollEntry[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [businessDetails, setBusinessDetails] =
    useState<BusinessDetails | null>(null);
  const [successView, setSuccessView] = useState(false);
  const [isProcessed, setIsProcessed] = useState(false);

  // Payment Security
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [securityAmount, setSecurityAmount] = useState<number | undefined>(
    undefined,
  );

  // Create Payment State
  const [showCreatePayment, setShowCreatePayment] = useState(false);
  const [createPaymentType, setCreatePaymentType] = useState<
    'one-time' | 'advance'
  >('one-time');

  // Selection and Cash Paid tracking
  const [includedIds, setIncludedIds] = useState<Set<string>>(new Set());
  const [cashPaidIds, setCashPaidIds] = useState<Set<string>>(new Set());

  // History Data
  const [oneTimeHistory, setOneTimeHistory] = useState<HistoryItem[]>([]);
  const [advanceHistory, setAdvanceHistory] = useState<HistoryItem[]>([]);

  // Function to refresh payment history from database
  const refreshPaymentHistory = async () => {
    try {
      if (businessDetails?.id) {
        const payments = await getPayments({businessId: businessDetails.id});

        // Convert payments to history items
        const oneTimePayments = payments
          .filter(p => p.type === 'one-time')
          .map(p => {
            const emp = employees.find(e => e.id === p.employeeId);
            return {
              id: p.id,
              name: emp?.fullName || 'Unknown',
              amount: p.amount,
              date: p.date,
              reason: p.narration || 'Bonus',
            };
          });

        const advancePayments = payments
          .filter(p => p.type === 'advance')
          .map(p => {
            const emp = employees.find(e => e.id === p.employeeId);
            return {
              id: p.id,
              name: emp?.fullName || 'Unknown',
              amount: p.amount,
              date: p.date,
              reason: p.narration || 'Advance',
            };
          });

        setOneTimeHistory(oneTimePayments);
        setAdvanceHistory(advancePayments);

        console.log('Payment history refreshed:', {
          oneTime: oneTimePayments.length,
          advance: advancePayments.length,
        });
      }
    } catch (error) {
      console.error('Error refreshing payment history:', error);
    }
  };

  // Initialize Data
  useEffect(() => {
    const init = async () => {
      try {
        const bizData = await getLatestBusinessDetails();
        const empData = await getEmployees(bizData?.id);
        setEmployees(empData);
        setBusinessDetails(bizData);

        // Load existing payments from database
        if (bizData?.id) {
          const payments = await getPayments({businessId: bizData.id});

          // Convert payments to history items
          const oneTimePayments = payments
            .filter(p => p.type === 'one-time')
            .map(p => {
              const emp = empData.find(e => e.id === p.employeeId);
              return {
                id: p.id,
                name: emp?.fullName || 'Unknown',
                amount: p.amount,
                date: p.date,
                reason: p.narration || 'Bonus',
              };
            });

          const advancePayments = payments
            .filter(p => p.type === 'advance')
            .map(p => {
              const emp = empData.find(e => e.id === p.employeeId);
              return {
                id: p.id,
                name: emp?.fullName || 'Unknown',
                amount: p.amount,
                date: p.date,
                reason: p.narration || 'Advance',
              };
            });

          setOneTimeHistory(oneTimePayments);
          setAdvanceHistory(advancePayments);
        }

        // Generate payroll entries from employees
        const payrollEntries: PayrollEntry[] = empData.map(emp => {
          let baseAmount = 0;
          const salary = Number(emp.salaryAmount) || 0;

          if (emp.wageType === 'Monthly') {
            baseAmount = salary;
          } else if (emp.wageType === 'Daily') {
            baseAmount = salary;
          } else if (emp.wageType === 'Hourly') {
            baseAmount = salary * 9;
          }

          const hasUPI = !!emp.paymentDetails?.upiId;
          const hasBank = !!emp.paymentDetails?.accountNumber;

          return {
            employeeId: emp.id,
            employeeName: emp.fullName,
            wageType: emp.wageType || 'Monthly',
            baseAmount: baseAmount,
            adjustments: [],
            netPay: baseAmount,
            paymentMode: hasUPI ? 'UPI' : 'Bank',
            status: hasUPI || hasBank ? 'ready' : 'missing_details',
          };
        });

        setEntries(payrollEntries);
        // Initially include everyone
        setIncludedIds(new Set(payrollEntries.map(e => e.employeeId)));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleUpdateEntry = (updated: PayrollEntry) => {
    setEntries(prev =>
      prev.map(e => (e.employeeId === updated.employeeId ? updated : e)),
    );
    setSelectedEntryId(null);
  };

  const toggleInclude = (id: string) => {
    const newSet = new Set(includedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setIncludedIds(newSet);
  };

  const toggleCashPaid = (id: string) => {
    const newSet = new Set(cashPaidIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setCashPaidIds(newSet);
  };

  const handleCreatePayment = async (data: any) => {
    try {
      const employee = employees.find(e => e.id === data.employeeId);

      if (!businessDetails?.id) {
        Alert.alert('Error', 'Business details not found');
        return;
      }

      if (!employee) {
        Alert.alert('Error', 'Employee not found');
        return;
      }

      let razorpayPayoutId: string | undefined;
      let paymentStatus: 'pending' | 'completed' | 'failed' = 'completed';

      // If UPI ID provided for UPI, phone number for Phone mode, or phone number for Bank Transfer, make Razorpay payout API call
      if (
        (data.paymentMode === 'UPI' && data.upiId) ||
        (data.paymentMode === 'Phone' && data.mobileNumber) ||
        (data.paymentMode === 'Bank Transfer' && data.phoneNumber)
      ) {
        try {
          console.log('Initiating Razorpay payout...');

          // Get Razorpay credentials
          const razorpayCredentials = getRazorpayCredentials();

          if (data.paymentMode === 'UPI') {
            // UPI Payout - Use provided UPI ID
            if (!data.upiId) {
              Alert.alert(
                'Missing UPI ID',
                'UPI ID is required for UPI payments. Payment will be saved but not processed.',
              );
              paymentStatus = 'pending';
            } else {
              const payoutResponse = await createUPIPayout(
                razorpayCredentials.apiKey,
                razorpayCredentials.apiSecret,
                {
                  accountNumber: razorpayCredentials.accountNumber,
                  amount: data.amount,
                  upiId: data.upiId,
                  accountHolderName: employee.fullName,
                  contactName: employee.fullName,
                  contactEmail: businessDetails.businessEmail,
                  contactPhone: data.phoneNumber || employee.phoneNumber,
                  referenceId: `PAY-${Date.now()}`,
                  narration:
                    data.narration ||
                    `${
                      createPaymentType === 'one-time' ? 'Bonus' : 'Advance'
                    } Payment`,
                  notes: {
                    employee_id: employee.id,
                    payment_type: createPaymentType,
                    business_id: businessDetails.id,
                  },
                },
              );

              razorpayPayoutId = payoutResponse.id;
              paymentStatus =
                payoutResponse.status === 'processed' ? 'completed' : 'pending';

              console.log('UPI Payout successful:', payoutResponse);
              Alert.alert(
                'Payout Initiated',
                `UPI payout of ₹${data.amount} has been initiated to ${data.upiId}`,
              );
            }
          } else if (data.paymentMode === 'Phone') {
            // Mobile/Phone Payout - Use provided mobile number
            if (!data.mobileNumber || data.mobileNumber.length !== 10) {
              Alert.alert(
                'Invalid Mobile Number',
                'A valid 10-digit mobile number is required for Phone payments. Payment will be saved but not processed.',
              );
              paymentStatus = 'pending';
            } else {
              const payoutResponse = await createMobilePayout(
                razorpayCredentials.apiKey,
                razorpayCredentials.apiSecret,
                {
                  accountNumber: razorpayCredentials.accountNumber,
                  amount: data.amount,
                  mobileNumber: data.mobileNumber,
                  accountHolderName: employee.fullName,
                  contactName: employee.fullName,
                  contactEmail: businessDetails.businessEmail,
                  contactPhone: data.mobileNumber,
                  referenceId: `PAY-${Date.now()}`,
                  narration:
                    data.narration ||
                    `${
                      createPaymentType === 'one-time' ? 'Bonus' : 'Advance'
                    } Payment`,
                  notes: {
                    employee_id: employee.id,
                    payment_type: createPaymentType,
                    business_id: businessDetails.id,
                  },
                },
              );

              razorpayPayoutId = payoutResponse.id;
              paymentStatus =
                payoutResponse.status === 'processed' ? 'completed' : 'pending';

              console.log('Mobile Payout successful:', payoutResponse);
              Alert.alert(
                'Payout Initiated',
                `UPI payout of ₹${data.amount} has been initiated to mobile number +91 ${data.mobileNumber}`,
              );
            }
          } else if (data.paymentMode === 'Bank Transfer') {
            // Bank Transfer Payout
            if (
              !employee.paymentDetails?.accountNumber ||
              !employee.paymentDetails?.ifsc
            ) {
              Alert.alert(
                'Missing Bank Details',
                'Employee bank account details are not available. Payment will be saved but not processed.',
              );
              paymentStatus = 'pending';
            } else {
              const payoutResponse = await createBankPayout(
                razorpayCredentials.apiKey,
                razorpayCredentials.apiSecret,
                {
                  accountNumber: razorpayCredentials.accountNumber,
                  amount: data.amount,
                  beneficiaryName:
                    employee.paymentDetails.accountHolderName ||
                    employee.fullName,
                  beneficiaryAccountNumber:
                    employee.paymentDetails.accountNumber,
                  ifscCode: employee.paymentDetails.ifsc,
                  contactName: employee.fullName,
                  contactEmail: businessDetails.businessEmail,
                  contactPhone: data.phoneNumber,
                  mode: employee.paymentDetails.paymentMode || 'IMPS',
                  referenceId: `PAY-${Date.now()}`,
                  narration:
                    data.narration ||
                    `${
                      createPaymentType === 'one-time' ? 'Bonus' : 'Advance'
                    } Payment`,
                  notes: {
                    employee_id: employee.id,
                    payment_type: createPaymentType,
                    business_id: businessDetails.id,
                  },
                },
              );

              razorpayPayoutId = payoutResponse.id;
              paymentStatus =
                payoutResponse.status === 'processed' ? 'completed' : 'pending';

              console.log('Bank Transfer Payout successful:', payoutResponse);
              Alert.alert(
                'Payout Initiated',
                `Bank transfer of ₹${data.amount} has been initiated to ${employee.fullName}`,
              );
            }
          }
        } catch (razorpayError: any) {
          console.error('Razorpay payout failed:', razorpayError);

          // Set payment status to failed but continue to save in database
          paymentStatus = 'failed';

          Alert.alert(
            'Payout Failed',
            `Failed to process payout: ${
              razorpayError.message || 'Unknown error'
            }. Payment will be saved as failed.`,
          );
        }
      }

      // Save payment to database (regardless of Razorpay success/failure)
      const paymentData = {
        type: createPaymentType,
        amount: data.amount,
        paymentMode: data.paymentMode,
        phoneNumber: data.phoneNumber || data.mobileNumber, // Use mobileNumber for Phone mode
        upiId: data.upiId, // Save UPI ID
        mobileNumber: data.mobileNumber, // Save mobile number for Phone mode
        narration: data.narration,
        status: paymentStatus,
        date: data.date,
        employeeId: data.employeeId,
        businessId: businessDetails.id,
        razorpayPayoutId, // Save Razorpay payout ID
      };

      const savedPayment = await savePayment(paymentData);

      console.log('Payment saved successfully:', {
        ...savedPayment,
        razorpayPayoutId,
      });

      // Refresh payment history from database to get latest data
      await refreshPaymentHistory();

      // Show success message if no Razorpay call was made (Cash payment)
      if (data.paymentMode === 'Cash') {
        Alert.alert(
          'Payment Saved',
          `Cash payment of ₹${data.amount} to ${employee.fullName} has been recorded.`,
        );
      }
    } catch (error) {
      console.error('Error saving payment:', error);
      Alert.alert('Error', 'Failed to save payment. Please try again.');
    }
  };

  const openCreateModal = (type: 'one-time' | 'advance') => {
    setCreatePaymentType(type);
    setShowCreatePayment(true);
  };

  // Filter Logic
  const visibleEntries = useMemo(() => {
    // Filter by Tab
    let filtered = entries.filter(e => {
      if (activeTab === 'Monthly') {
        return e.wageType === 'Monthly';
      }
      if (activeTab === 'Daily') {
        return e.wageType === 'Daily' || e.wageType === 'Hourly';
      }
      return false;
    });

    // Filter by Dropdown
    if (activeFilter === 'selected') {
      filtered = filtered.filter(e => includedIds.has(e.employeeId));
    } else if (activeFilter === 'not_selected') {
      filtered = filtered.filter(e => !includedIds.has(e.employeeId));
    }

    return filtered;
  }, [entries, activeTab, activeFilter, includedIds]);

  // Totals Calculation
  const totalPayout = visibleEntries
    .filter(e => includedIds.has(e.employeeId))
    .filter(e => !(e.paymentMode === 'Cash' && cashPaidIds.has(e.employeeId)))
    .reduce((sum, e) => sum + e.netPay, 0);

  const count = visibleEntries.filter(e =>
    includedIds.has(e.employeeId),
  ).length;

  const getPeriodText = () => {
    const date = new Date();
    if (activeTab === 'Daily') {
      return `Daily — ${date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
      })}`;
    }
    if (activeTab === 'Monthly') {
      return `Monthly — ${date.toLocaleDateString('en-GB', {
        month: 'short',
        year: 'numeric',
      })}`;
    }
    return activeTab;
  };

  const getProcessedText = () => {
    const date = new Date();
    if (activeTab === 'Daily') {
      return 'Salary Processed for "Today"';
    }
    return `Salary Processed for ${date.toLocaleDateString('en-GB', {
      month: 'long',
      year: 'numeric',
    })}`;
  };

  // Manual Indian number formatting (avoids Hermes Intl issues)
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

  const getEmployee = (id: string) => employees.find(e => e.id === id);

  const initiatePaymentProcess = () => {
    setShowSummary(false);
    setSecurityAmount(totalPayout);
    setShowSecurityModal(true);
  };

  const handleSecuritySuccess = () => {
    setShowSecurityModal(false);
    setSuccessView(true);
  };

  const handleSuccessClose = () => {
    setSuccessView(false);
    setIsProcessed(true);
  };

  const selectedEmployee = selectedEntryId
    ? getEmployee(selectedEntryId)
    : null;
  const selectedEntry = selectedEntryId
    ? entries.find(e => e.employeeId === selectedEntryId)
    : null;

  // Success Screen
  if (successView) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Text style={styles.successIconText}>✓</Text>
          </View>

          <Text style={styles.successTitle}>
            {businessDetails?.payrollUsageType === 'calculate_and_pay'
              ? 'Payroll Processed'
              : 'Payroll Processed!'}
          </Text>

          <Text style={styles.successSubtitle}>
            {businessDetails?.payrollUsageType === 'calculate_and_pay'
              ? 'Your staff will receive their salaries as per their preferred payment method within 24 hours.'
              : ''}
          </Text>

          <View style={styles.successInfoBox}>
            <Text style={styles.successInfoText}>
              Salary Register with Staff Payment Details have been sent to{' '}
              <Text style={styles.successInfoBold}>
                {businessDetails?.businessEmail || 'admin@company.com'}
              </Text>{' '}
              and over WhatsApp.
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleSuccessClose}
            style={styles.successButton}>
            <Text style={styles.successButtonText}>Go to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <SafeAreaView style={styles.container}>
        {/* Sticky Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <Text style={styles.periodText}>{getPeriodText()}</Text>
              {(activeTab === 'Daily' || activeTab === 'Monthly') &&
                !isProcessed && (
                  <Text style={styles.totalAmount}>
                    {formatCurrency(totalPayout)}
                  </Text>
                )}
            </View>
          </View>

          {/* Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabs}
            contentContainerStyle={styles.tabsContent}>
            <TabButton
              label="Daily"
              count={entries.filter(e => e.wageType !== 'Monthly').length}
              active={activeTab === 'Daily'}
              onPress={() => {
                setActiveTab('Daily');
                setIsProcessed(false);
              }}
            />
            <TabButton
              label="Monthly"
              count={entries.filter(e => e.wageType === 'Monthly').length}
              active={activeTab === 'Monthly'}
              onPress={() => {
                setActiveTab('Monthly');
                setIsProcessed(false);
              }}
            />
            <TabButton
              label="One-Time"
              active={activeTab === 'One-Time'}
              onPress={() => {
                setActiveTab('One-Time');
                setIsProcessed(false);
              }}
            />
            <TabButton
              label="Advance"
              active={activeTab === 'Advance'}
              onPress={() => {
                setActiveTab('Advance');
                setIsProcessed(false);
              }}
            />
          </ScrollView>
        </View>

        {/* Content */}
        <ScrollView style={styles.content}>
          {/* Filter Dropdown (Only Daily/Monthly) */}
          {(activeTab === 'Daily' || activeTab === 'Monthly') &&
            !isProcessed && (
              <View style={styles.filterContainer}>
                <View style={styles.filterDropdown}>
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert('Filter', 'Select filter option', [
                        {
                          text: 'All Employees',
                          onPress: () => setActiveFilter('all'),
                        },
                        {
                          text: 'Selected',
                          onPress: () => setActiveFilter('selected'),
                        },
                        {
                          text: 'Not Selected',
                          onPress: () => setActiveFilter('not_selected'),
                        },
                        {text: 'Cancel', style: 'cancel'},
                      ]);
                    }}
                    style={styles.filterButton}>
                    <Text style={styles.filterButtonText}>
                      {activeFilter === 'all'
                        ? 'All Employees'
                        : activeFilter === 'selected'
                        ? 'Selected'
                        : 'Not Selected'}
                    </Text>
                    <Text style={styles.filterIcon}>▼</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

          {/* PROCESSED STATE */}
          {isProcessed &&
            (activeTab === 'Daily' || activeTab === 'Monthly') && (
              <View style={styles.processedContainer}>
                <View style={styles.processedIcon}>
                  <Text style={styles.processedIconText}>✓</Text>
                </View>
                <Text style={styles.processedTitle}>{getProcessedText()}</Text>
                <Text style={styles.processedSubtitle}>
                  You can view the payout details in the History tab or download
                  the Salary Register from your email.
                </Text>
              </View>
            )}

          {/* DAILY & MONTHLY VIEWS */}
          {!isProcessed &&
            (activeTab === 'Daily' || activeTab === 'Monthly') && (
              <>
                {loading ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>
                      Preparing payroll...
                    </Text>
                  </View>
                ) : visibleEntries.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateIcon}>✓</Text>
                    <Text style={styles.emptyStateText}>
                      No employees in this category.
                    </Text>
                  </View>
                ) : (
                  <View style={styles.entriesList}>
                    {visibleEntries.map(entry => {
                      const isSelected = includedIds.has(entry.employeeId);
                      const isCash = entry.paymentMode === 'Cash';
                      const isPaid =
                        isCash && cashPaidIds.has(entry.employeeId);

                      return (
                        <View
                          key={entry.employeeId}
                          style={[
                            styles.entryCard,
                            !isSelected && styles.entryCardUnselected,
                          ]}>
                          {/* Selection Checkbox */}
                          <TouchableOpacity
                            onPress={() => toggleInclude(entry.employeeId)}
                            style={styles.checkbox}>
                            <Text
                              style={[
                                styles.checkboxIcon,
                                isSelected && styles.checkboxIconSelected,
                              ]}>
                              {isSelected ? '☑' : '☐'}
                            </Text>
                          </TouchableOpacity>

                          {/* Main Info */}
                          <TouchableOpacity
                            style={styles.entryInfo}
                            onPress={() =>
                              setSelectedEntryId(entry.employeeId)
                            }>
                            <View style={styles.entryHeader}>
                              <Text style={styles.entryName}>
                                {entry.employeeName}
                              </Text>
                              <Text
                                style={[
                                  styles.entryAmount,
                                  isPaid && styles.entryAmountPaid,
                                ]}>
                                {formatCurrency(entry.netPay)}
                              </Text>
                            </View>

                            <View style={styles.entryMeta}>
                              <View style={styles.entryMetaLeft}>
                                <View
                                  style={[
                                    styles.paymentModeBadge,
                                    entry.paymentMode === 'Cash' &&
                                      styles.paymentModeBadgeCash,
                                    entry.paymentMode === 'UPI' &&
                                      styles.paymentModeBadgeUPI,
                                    entry.paymentMode === 'Bank' &&
                                      styles.paymentModeBadgeBank,
                                  ]}>
                                  <Text style={styles.paymentModeText}>
                                    {entry.paymentMode}
                                  </Text>
                                </View>
                                {entry.status === 'missing_details' && (
                                  <View style={styles.warningBadge}>
                                    <Text style={styles.warningText}>
                                      ⚠️ Missing Info
                                    </Text>
                                  </View>
                                )}
                              </View>

                              {/* Cash Paid Checkbox */}
                              {isCash && isSelected && (
                                <TouchableOpacity
                                  onPress={() =>
                                    toggleCashPaid(entry.employeeId)
                                  }
                                  style={styles.cashPaidButton}>
                                  <View
                                    style={[
                                      styles.cashPaidCheckbox,
                                      isPaid && styles.cashPaidCheckboxChecked,
                                    ]}>
                                    {isPaid && (
                                      <Text style={styles.cashPaidCheckmark}>
                                        ✓
                                      </Text>
                                    )}
                                  </View>
                                  <Text
                                    style={[
                                      styles.cashPaidText,
                                      isPaid && styles.cashPaidTextChecked,
                                    ]}>
                                    Paid
                                  </Text>
                                </TouchableOpacity>
                              )}

                              {!isCash && <Text style={styles.chevron}>›</Text>}
                            </View>
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </View>
                )}
              </>
            )}

          {/* ONE-TIME PAYMENTS */}
          {activeTab === 'One-Time' && (
            <View style={styles.historyContainer}>
              <View style={styles.infoBox}>
                <Text style={styles.infoBoxTitle}>Important:</Text>
                <Text style={styles.infoBoxText}>
                  Amounts paid out as one time payments will NOT automatically
                  be recovered in the next payroll.
                </Text>
              </View>

              <Text style={styles.historyTitle}>Payment History</Text>

              {oneTimeHistory.length === 0 ? (
                <View style={styles.emptyHistory}>
                  <Text style={styles.emptyHistoryText}>
                    No one-time payments yet.
                  </Text>
                </View>
              ) : (
                <View style={styles.historyList}>
                  {oneTimeHistory.map(item => (
                    <HistoryItemCard key={item.id} item={item} />
                  ))}
                </View>
              )}
            </View>
          )}

          {/* ADVANCE PAYMENTS */}
          {activeTab === 'Advance' && (
            <View style={styles.historyContainer}>
              <View style={[styles.infoBox, styles.infoBoxBlue]}>
                <Text style={[styles.infoBoxTitle, styles.infoBoxTitleBlue]}>
                  Advance Policy:
                </Text>
                <Text style={[styles.infoBoxText, styles.infoBoxTextBlue]}>
                  Amounts paid out as advance will automatically be recovered in
                  the next payroll. Please check the amount carefully against
                  the staff's salary.
                </Text>
              </View>

              <Text style={styles.historyTitle}>Advance History</Text>

              {advanceHistory.length === 0 ? (
                <View style={styles.emptyHistory}>
                  <Text style={styles.emptyHistoryText}>
                    No advance payments yet.
                  </Text>
                </View>
              ) : (
                <View style={styles.historyList}>
                  {advanceHistory.map(item => (
                    <HistoryItemCard key={item.id} item={item} />
                  ))}
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* Footer for Daily/Monthly */}
        {(activeTab === 'Daily' || activeTab === 'Monthly') && !isProcessed && (
          <View style={styles.footer}>
            <View style={styles.footerSummary}>
              <View>
                <Text style={styles.footerLabel}>Total Payout</Text>
                <Text style={styles.footerAmount}>
                  {formatCurrency(totalPayout)}
                </Text>
              </View>
              <View style={styles.footerRight}>
                <Text style={styles.footerLabel}>Employees</Text>
                <Text style={styles.footerCount}>{count} Selected</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => setShowSummary(true)}
              disabled={count === 0}
              style={[
                styles.proceedButton,
                count === 0 && styles.proceedButtonDisabled,
              ]}>
              <Text
                style={[
                  styles.proceedButtonText,
                  count === 0 && styles.proceedButtonTextDisabled,
                ]}>
                Proceed to Pay
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Footer for One-Time/Advance */}
        {(activeTab === 'One-Time' || activeTab === 'Advance') && (
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={() =>
                openCreateModal(
                  activeTab === 'One-Time' ? 'one-time' : 'advance',
                )
              }
              style={styles.createButton}>
              <Text style={styles.createButtonText}>+ Create New</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Summary Modal */}
        {showSummary && (
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={() => setShowSummary(false)}
            />
            <View style={styles.summaryModal}>
              <Text style={styles.summaryTitle}>Confirm Payout</Text>

              <View style={styles.summaryBox}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total Employees</Text>
                  <Text style={styles.summaryValue}>{count}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total Amount</Text>
                  <Text style={styles.summaryValueAmount}>
                    {formatCurrency(totalPayout)}
                  </Text>
                </View>
              </View>

              <View style={styles.summaryButtons}>
                <TouchableOpacity
                  onPress={() => setShowSummary(false)}
                  style={styles.summaryCancelButton}>
                  <Text style={styles.summaryCancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={initiatePaymentProcess}
                  style={styles.summaryConfirmButton}>
                  <Text style={styles.summaryConfirmButtonText}>
                    Confirm & Pay
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </SafeAreaView>

      {/* Sheets */}
      {selectedEmployee && selectedEntry && (
        <PaymentDetailsSheet
          visible={!!selectedEntryId}
          employee={selectedEmployee}
          entry={selectedEntry}
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
      />

      <PaymentSecurityModal
        isOpen={showSecurityModal}
        onClose={() => setShowSecurityModal(false)}
        onSuccess={handleSecuritySuccess}
        amount={securityAmount}
      />
    </>
  );
};

// Helper Components

interface TabButtonProps {
  label: string;
  count?: number;
  active: boolean;
  onPress: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({
  label,
  count,
  active,
  onPress,
}) => (
  <TouchableOpacity onPress={onPress} style={styles.tabButton}>
    <View style={styles.tabContent}>
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
        {label}
      </Text>
      {count !== undefined && count > 0 && (
        <View style={[styles.tabBadge, active && styles.tabBadgeActive]}>
          <Text style={[styles.tabCount, active && styles.tabCountActive]}>
            {count}
          </Text>
        </View>
      )}
    </View>
    {active && <View style={styles.tabIndicator} />}
  </TouchableOpacity>
);

interface HistoryItemCardProps {
  item: HistoryItem;
}

const HistoryItemCard: React.FC<HistoryItemCardProps> = ({item}) => (
  <View style={styles.historyItem}>
    <View style={styles.historyItemLeft}>
      <Text style={styles.historyItemName}>{item.name}</Text>
      <Text style={styles.historyItemMeta}>
        {item.reason} • {item.date}
      </Text>
    </View>
    <View style={styles.historyItemRight}>
      <Text style={styles.historyItemAmount}>₹{item.amount}</Text>
      <View style={styles.historyItemBadge}>
        <Text style={styles.historyItemBadgeText}>Paid</Text>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  backButtonText: {
    fontSize: 24,
    color: '#111827',
  },
  headerInfo: {
    flex: 1,
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  totalAmount: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  tabs: {
    marginTop: 4,
  },
  tabsContent: {
    paddingHorizontal: 16,
    gap: 24,
  },
  tabButton: {
    paddingBottom: 12,
    position: 'relative',
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  tabLabelActive: {
    color: '#3B82F6',
  },
  tabBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tabBadgeActive: {
    backgroundColor: '#DBEAFE',
  },
  tabCount: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
  },
  tabCountActive: {
    color: '#3B82F6',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#3B82F6',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  content: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
  },
  filterContainer: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  filterDropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 8,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  filterIcon: {
    fontSize: 10,
    color: '#6B7280',
  },
  processedContainer: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  processedIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  processedIconText: {
    fontSize: 32,
    color: '#10B981',
  },
  processedTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  processedSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: 300,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyStateIcon: {
    fontSize: 48,
    color: '#D1D5DB',
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  entriesList: {
    gap: 12,
  },
  entryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  entryCardUnselected: {
    opacity: 0.6,
  },
  checkbox: {
    padding: 4,
  },
  checkboxIcon: {
    fontSize: 20,
    color: '#9CA3AF',
  },
  checkboxIconSelected: {
    color: '#3B82F6',
  },
  entryInfo: {
    flex: 1,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  entryName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  entryAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  entryAmountPaid: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  entryMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryMetaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paymentModeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  paymentModeBadgeCash: {
    backgroundColor: '#D1FAE5',
    borderColor: '#A7F3D0',
  },
  paymentModeBadgeUPI: {
    backgroundColor: '#DBEAFE',
    borderColor: '#BFDBFE',
  },
  paymentModeBadgeBank: {
    backgroundColor: '#E9D5FF',
    borderColor: '#D8B4FE',
  },
  paymentModeText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#4B5563',
  },
  warningBadge: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  warningText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#EF4444',
  },
  cashPaidButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cashPaidCheckbox: {
    width: 12,
    height: 12,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#9CA3AF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cashPaidCheckboxChecked: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  cashPaidCheckmark: {
    fontSize: 8,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  cashPaidText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  cashPaidTextChecked: {
    color: '#059669',
  },
  chevron: {
    fontSize: 20,
    color: '#D1D5DB',
  },
  historyContainer: {
    paddingBottom: 100,
  },
  infoBox: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  infoBoxBlue: {
    backgroundColor: '#DBEAFE',
    borderColor: '#BFDBFE',
  },
  infoBoxTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 4,
  },
  infoBoxTitleBlue: {
    color: '#1E3A8A',
  },
  infoBoxText: {
    fontSize: 12,
    color: '#92400E',
    lineHeight: 18,
  },
  infoBoxTextBlue: {
    color: '#1E3A8A',
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4B5563',
    marginBottom: 12,
  },
  emptyHistory: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyHistoryText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  historyList: {
    gap: 12,
  },
  historyItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyItemLeft: {
    flex: 1,
  },
  historyItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  historyItemMeta: {
    fontSize: 12,
    color: '#6B7280',
  },
  historyItemRight: {
    alignItems: 'flex-end',
  },
  historyItemAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  historyItemBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  historyItemBadgeText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#059669',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  footerSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  footerLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 4,
  },
  footerAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  footerRight: {
    alignItems: 'flex-end',
  },
  footerCount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  proceedButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  proceedButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  proceedButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  proceedButtonTextDisabled: {
    color: '#9CA3AF',
  },
  createButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  summaryModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    paddingBottom: 40,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  summaryBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  summaryValueAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3B82F6',
  },
  summaryButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  summaryCancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4B5563',
  },
  summaryConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#16A34A',
    alignItems: 'center',
  },
  summaryConfirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successIconText: {
    fontSize: 40,
    color: '#10B981',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
    maxWidth: 300,
    lineHeight: 20,
  },
  successInfoBox: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 32,
    maxWidth: 300,
  },
  successInfoText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
  successInfoBold: {
    fontWeight: '700',
    color: '#111827',
  },
  successButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
  },
  successButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default FinalizePayrollScreen;
