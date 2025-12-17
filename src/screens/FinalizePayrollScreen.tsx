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
import {RootStackParamList, PayrollEntry, Employee} from '../types';
import {getEmployees} from '../services/dbService';
import {PaymentDetailsSheet} from '../components/PaymentDetailsSheet';

type Props = NativeStackScreenProps<RootStackParamList, 'FinalizePayroll'>;

type Tab = 'Daily' | 'Monthly';

export const FinalizePayrollScreen: React.FC<Props> = ({navigation}) => {
  const [activeTab, setActiveTab] = useState<Tab>('Monthly');
  const [entries, setEntries] = useState<PayrollEntry[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  // Initialize Data
  useEffect(() => {
    const init = async () => {
      try {
        const empData = await getEmployees();
        setEmployees(empData);

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

  // Filter Logic
  const filteredEntries = useMemo(() => {
    return entries.filter(e => {
      if (activeTab === 'Monthly') {
        return e.wageType === 'Monthly';
      }
      return e.wageType === 'Daily' || e.wageType === 'Hourly';
    });
  }, [entries, activeTab]);

  // Totals
  const totalPayout = filteredEntries.reduce((sum, e) => sum + e.netPay, 0);
  const count = filteredEntries.length;

  const getPeriodText = () => {
    const date = new Date();
    if (activeTab === 'Daily') {
      return `Daily — ${date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })}`;
    }
    return `Monthly — ${date.toLocaleDateString('en-GB', {
      month: 'short',
      year: 'numeric',
    })}`;
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

  const getEmployee = (id: string) => employees.find(e => e.id === id);

  const handleExecute = () => {
    Alert.alert(
      'Execute Payroll',
      `Payroll executed for ${count} employees! Total: ${formatCurrency(
        totalPayout,
      )}`,
      [{text: 'OK', onPress: () => navigation.goBack()}],
    );
  };

  const selectedEmployee = selectedEntryId
    ? getEmployee(selectedEntryId)
    : null;
  const selectedEntry = selectedEntryId
    ? entries.find(e => e.employeeId === selectedEntryId)
    : null;

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
              <Text style={styles.totalAmount}>
                {formatCurrency(totalPayout)}
              </Text>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            <TabButton
              label="Daily"
              count={entries.filter(e => e.wageType !== 'Monthly').length}
              active={activeTab === 'Daily'}
              onPress={() => setActiveTab('Daily')}
            />
            <TabButton
              label="Monthly"
              count={entries.filter(e => e.wageType === 'Monthly').length}
              active={activeTab === 'Monthly'}
              onPress={() => setActiveTab('Monthly')}
            />
          </View>
        </View>

        {/* Content */}
        <ScrollView style={styles.content}>
          {loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Preparing payroll...</Text>
            </View>
          ) : filteredEntries.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>✓</Text>
              <Text style={styles.emptyStateText}>
                No employees in this category.
              </Text>
            </View>
          ) : (
            <View style={styles.entriesList}>
              {filteredEntries.map(entry => (
                <View key={entry.employeeId} style={styles.entryCard}>
                  <View style={styles.entryInfo}>
                    <Text style={styles.entryName}>{entry.employeeName}</Text>
                    <View style={styles.entryMeta}>
                      <View style={styles.paymentModeBadge}>
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
                    <Text style={styles.entryAmount}>
                      {formatCurrency(entry.netPay)}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => setSelectedEntryId(entry.employeeId)}
                    style={styles.detailsButton}>
                    <Text style={styles.detailsButtonText}>Details →</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={handleExecute}
            disabled={count === 0}
            style={[
              styles.executeButton,
              count === 0 && styles.executeButtonDisabled,
            ]}>
            <Text
              style={[
                styles.executeButtonText,
                count === 0 && styles.executeButtonTextDisabled,
              ]}>
              Execute Payroll
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sheet */}
      </SafeAreaView>
      {selectedEmployee && selectedEntry && (
        <PaymentDetailsSheet
          visible={!!selectedEntryId}
          employee={selectedEmployee}
          entry={selectedEntry}
          onSave={handleUpdateEntry}
          onClose={() => setSelectedEntryId(null)}
        />
      )}
    </>
  );
};

interface TabButtonProps {
  label: string;
  count: number;
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
    <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
      {label}{' '}
      <Text style={[styles.tabCount, active && styles.tabCountActive]}>
        {count}
      </Text>
    </Text>
    {active && <View style={styles.tabIndicator} />}
  </TouchableOpacity>
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
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 24,
    marginTop: 4,
  },
  tabButton: {
    paddingBottom: 12,
    position: 'relative',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  tabLabelActive: {
    color: '#3B82F6',
  },
  tabCount: {
    fontSize: 12,
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  tabCountActive: {
    backgroundColor: '#DBEAFE',
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
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  entryInfo: {
    flex: 1,
  },
  entryName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  entryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  paymentModeBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  paymentModeText: {
    fontSize: 12,
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
  entryAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
  },
  detailsButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  detailsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  executeButton: {
    backgroundColor: '#16A34A',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  executeButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  executeButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  executeButtonTextDisabled: {
    color: '#9CA3AF',
  },
});

export default FinalizePayrollScreen;
