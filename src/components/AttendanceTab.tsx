import React, {useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import {Employee, Shift} from '../types';
import {EmployeeDetailView} from './EmployeeDetailView';

interface AttendanceTabProps {
  employees: Employee[];
  shifts: (Shift & {staffCount: number})[];
}

type AttendanceStatus = 'checked_in' | 'not_in' | 'time_off';

interface EmployeeAttendance extends Employee {
  status: AttendanceStatus;
  checkInTime?: string;
  workingHours?: string;
  breakHours?: string;
}

export const AttendanceTab: React.FC<AttendanceTabProps> = ({
  employees,
  shifts,
}) => {
  const [selectedShiftId, setSelectedShiftId] = useState<string>('all');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const [showShiftDropdown, setShowShiftDropdown] = useState(false);

  // Mock current date
  const today = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  // Generate mock attendance data for display purposes
  const attendanceData: EmployeeAttendance[] = useMemo(() => {
    return employees.map((emp, index) => {
      // Deterministic pseudo-random based on index to keep UI stable
      const rand = (index + emp.id.length) % 3;
      let status: AttendanceStatus = 'not_in';
      let workingHours = '';
      let breakHours = '';

      if (rand === 0) {
        status = 'checked_in';
        workingHours = `${8 + (index % 2)}h ${10 + index * 5}min`;
        breakHours = '45min';
      } else if (rand === 1) {
        status = 'not_in';
      } else {
        status = 'time_off';
      }

      return {
        ...emp,
        status,
        workingHours,
        breakHours,
      };
    });
  }, [employees]);

  // Filter based on shift
  const filteredData = useMemo(() => {
    if (selectedShiftId === 'all') {
      return attendanceData;
    }
    return attendanceData.filter(e => e.shiftId === selectedShiftId);
  }, [attendanceData, selectedShiftId]);

  // Calculate Stats
  const stats = useMemo(() => {
    return {
      total: filteredData.length,
      checkedIn: filteredData.filter(e => e.status === 'checked_in').length,
      notIn: filteredData.filter(e => e.status === 'not_in').length,
      timeOff: filteredData.filter(e => e.status === 'time_off').length,
    };
  }, [filteredData]);

  // If employee selected, show detail view
  if (selectedEmployee) {
    return (
      <EmployeeDetailView
        employee={selectedEmployee}
        onBack={() => setSelectedEmployee(null)}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Filters Header */}
      <View style={styles.filtersHeader}>
        <View style={styles.dateFilter}>
          <Text style={styles.dateText}>{today}</Text>
        </View>

        <View style={styles.shiftFilter}>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowShiftDropdown(true)}>
            <Text style={styles.dropdownButtonText}>
              {selectedShiftId === 'all'
                ? 'All Shifts'
                : shifts.find(s => s.id === selectedShiftId)?.name ||
                  'All Shifts'}
            </Text>
            <Text style={styles.dropdownIcon}>▼</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.chartContainer}>
            <View style={styles.chartCenter}>
              <Text style={styles.chartTotal}>{stats.total}</Text>
              <Text style={styles.chartLabel}>Total</Text>
            </View>
          </View>

          <View style={styles.statsCards}>
            <StatCard
              count={stats.checkedIn}
              label="Checked In"
              color="#3B82F6"
            />
            <StatCard count={stats.notIn} label="Not in Yet" color="#F87171" />
            <StatCard count={stats.timeOff} label="Time Off" color="#A855F7" />
          </View>
        </View>

        {/* Employee List Section */}
        <View style={styles.listSection}>
          <Text style={styles.listHeader}>Checked In Employees</Text>

          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderText}>Employee</Text>
            <Text style={[styles.tableHeaderText, styles.tableHeaderRight]}>
              Working Hours
            </Text>
            <Text style={[styles.tableHeaderText, styles.tableHeaderRight]}>
              Break Hours
            </Text>
          </View>

          {/* List */}
          {filteredData.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No employees found.</Text>
            </View>
          ) : (
            filteredData.map(emp => (
              <TouchableOpacity
                key={emp.id}
                style={styles.employeeRow}
                onPress={() => setSelectedEmployee(emp)}>
                <View style={styles.employeeInfo}>
                  <Text style={styles.employeeName}>{emp.fullName}</Text>
                  <Text style={styles.employeeDetails}>
                    ID: {emp.companyId || 'N/A'} |{' '}
                    {emp.type === 'full_time' ? 'Full Time' : 'Contract'}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.hoursText,
                    !emp.workingHours && styles.hoursTextEmpty,
                  ]}>
                  {emp.workingHours || '--'}
                </Text>

                <Text
                  style={[
                    styles.hoursText,
                    !emp.breakHours && styles.hoursTextEmpty,
                  ]}>
                  {emp.breakHours || '--'}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Shift Dropdown Modal */}
      <Modal
        visible={showShiftDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowShiftDropdown(false)}>
        <TouchableOpacity
          style={styles.dropdownOverlay}
          activeOpacity={1}
          onPress={() => setShowShiftDropdown(false)}>
          <View style={styles.dropdownMenu}>
            <TouchableOpacity
              style={[
                styles.dropdownItem,
                selectedShiftId === 'all' && styles.dropdownItemActive,
              ]}
              onPress={() => {
                setSelectedShiftId('all');
                setShowShiftDropdown(false);
              }}>
              <Text
                style={[
                  styles.dropdownItemText,
                  selectedShiftId === 'all' && styles.dropdownItemTextActive,
                ]}>
                All Shifts
              </Text>
              {selectedShiftId === 'all' && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>

            {shifts.map(shift => (
              <TouchableOpacity
                key={shift.id}
                style={[
                  styles.dropdownItem,
                  selectedShiftId === shift.id && styles.dropdownItemActive,
                ]}
                onPress={() => {
                  setSelectedShiftId(shift.id);
                  setShowShiftDropdown(false);
                }}>
                <Text
                  style={[
                    styles.dropdownItemText,
                    selectedShiftId === shift.id &&
                      styles.dropdownItemTextActive,
                  ]}>
                  {shift.name}
                </Text>
                {selectedShiftId === shift.id && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const StatCard: React.FC<{count: number; label: string; color: string}> = ({
  count,
  label,
  color,
}) => (
  <View style={styles.statCard}>
    <View style={styles.statCardHeader}>
      <Text style={styles.statCount}>{count}</Text>
      <View style={[styles.statDot, {backgroundColor: color}]} />
    </View>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  filtersHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dateFilter: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  shiftFilter: {
    flex: 1,
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  dropdownButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  dropdownIcon: {
    fontSize: 10,
    color: '#6B7280',
    marginLeft: 8,
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    paddingTop: 120,
    paddingHorizontal: 16,
  },
  dropdownMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    maxHeight: 300,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownItemActive: {
    backgroundColor: '#EFF6FF',
  },
  dropdownItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
  },
  dropdownItemTextActive: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  statsSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 24,
  },
  chartContainer: {
    flex: 1,
    alignItems: 'center',
  },
  chartCenter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 8,
    borderColor: '#3B82F6',
  },
  chartTotal: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
  },
  chartLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  statsCards: {
    width: 120,
    gap: 12,
  },
  statCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FFFFFF',
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  statCount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6B7280',
  },
  listSection: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  listHeader: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 8,
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F8FAFC',
  },
  tableHeaderText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  tableHeaderRight: {
    width: 80,
    textAlign: 'right',
    flex: 0,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  employeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  employeeInfo: {
    flex: 1,
    paddingRight: 8,
  },
  employeeName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  employeeDetails: {
    fontSize: 12,
    color: '#6B7280',
  },
  hoursText: {
    width: 80,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  hoursTextEmpty: {
    color: '#D1D5DB',
  },
});
