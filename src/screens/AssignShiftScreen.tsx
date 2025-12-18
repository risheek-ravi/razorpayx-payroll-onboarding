import React, {useState, useEffect, useMemo, useCallback} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  View,
  Text as RNText,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  Box,
  Text,
  Heading,
  Button,
  SearchInput,
  Spinner,
  IconButton,
  ArrowLeftIcon,
} from '@razorpay/blade/components';
import {
  getEmployees,
  getLatestBusinessDetails,
  saveShift,
  assignShiftToEmployees,
  updateShiftAssignment,
} from '../services/dbService';
import {RootStackParamList, Employee, Shift} from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'AssignShift'>;

export const AssignShiftScreen = ({navigation, route}: Props) => {
  const {shiftData, existingShiftId} = route.params;

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [businessId, setBusinessId] = useState<string | undefined>();

  const loadEmployees = useCallback(async () => {
    try {
      const bizData = await getLatestBusinessDetails();
      setBusinessId(bizData?.id);
      const data = await getEmployees(bizData?.id);
      setEmployees(data);

      // If editing existing shift, pre-select employees
      if (existingShiftId) {
        const preSelected = data
          .filter(e => e.shiftId === existingShiftId)
          .map(e => e.id);
        setSelectedIds(preSelected);
      }
    } catch (e) {
      console.error('Failed to load employees:', e);
    } finally {
      setLoading(false);
    }
  }, [existingShiftId]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const filteredEmployees = useMemo(() => {
    if (!searchTerm) {
      return employees;
    }
    return employees.filter(e =>
      e.fullName.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [employees, searchTerm]);

  const toggleEmployee = (empId: string) => {
    setSelectedIds(prev => {
      if (prev.includes(empId)) {
        return prev.filter(id => id !== empId);
      }
      return [...prev, empId];
    });
  };

  const handleAssign = async () => {
    setIsSaving(true);
    try {
      if (existingShiftId) {
        // Edit Mode: Just update assignments
        await updateShiftAssignment(existingShiftId, selectedIds);
      } else {
        // Create Mode: Save new shift first with businessId
        const shiftWithBusiness = {
          ...shiftData,
          businessId: businessId!,
        } as Omit<Shift, 'id'>;
        const savedShift = await saveShift(shiftWithBusiness);
        if (selectedIds.length > 0) {
          await assignShiftToEmployees(savedShift.id, selectedIds);
        }
      }
      // Navigate back to shift list
      navigation.navigate('ShiftList');
    } catch (e) {
      console.error('Failed to save shift assignment:', e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Box
        backgroundColor="surface.background.gray.intense"
        paddingX="spacing.5"
        paddingY="spacing.4"
        flexDirection="row"
        alignItems="center">
        <IconButton
          icon={ArrowLeftIcon}
          accessibilityLabel="Go back"
          onClick={() => navigation.goBack()}
          size="medium"
        />
        <Box marginLeft="spacing.3">
          <Heading size="medium">
            {existingShiftId ? 'Manage Assigned Staff' : 'Assign Shift'}
          </Heading>
          <Text size="small" color="surface.text.gray.muted">
            {shiftData.name} | {shiftData.startTime} - {shiftData.endTime}
          </Text>
        </Box>
      </Box>

      {/* Content */}
      <ScrollView style={styles.scrollView}>
        <Box padding="spacing.4">
          <Text weight="semibold" marginBottom="spacing.4">
            Select Staffs you wish to give access to
          </Text>

          {/* Search */}
          <Box marginBottom="spacing.6">
            <SearchInput
              accessibilityLabel="Search staff"
              placeholder="Search by Staff Name"
              value={searchTerm}
              onChange={({value}) => setSearchTerm(value || '')}
              onClearButtonClick={() => setSearchTerm('')}
            />
          </Box>

          {loading ? (
            <Box
              alignItems="center"
              justifyContent="center"
              paddingY="spacing.10">
              <Spinner
                accessibilityLabel="Loading staff"
                color="primary"
                size="large"
              />
              <Text marginTop="spacing.4" color="surface.text.gray.muted">
                Loading staff...
              </Text>
            </Box>
          ) : filteredEmployees.length === 0 ? (
            <Box
              alignItems="center"
              justifyContent="center"
              paddingY="spacing.10">
              <Text color="surface.text.gray.muted">No staff found</Text>
            </Box>
          ) : (
            <View>
              {filteredEmployees.map(emp => (
                <TouchableOpacity
                  key={emp.id}
                  style={styles.employeeRow}
                  onPress={() => toggleEmployee(emp.id)}
                  activeOpacity={0.7}>
                  <View style={styles.checkboxContainer}>
                    <View
                      style={[
                        styles.checkbox,
                        selectedIds.includes(emp.id) && styles.checkboxSelected,
                      ]}>
                      {selectedIds.includes(emp.id) && (
                        <RNText style={styles.checkmark}>✓</RNText>
                      )}
                    </View>
                    <RNText style={styles.employeeName}>{emp.fullName}</RNText>
                  </View>
                  {emp.wageType && (
                    <Text size="small" color="surface.text.gray.muted">
                      {emp.wageType}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Box>
      </ScrollView>

      {/* Footer */}
      <Box
        backgroundColor="surface.background.gray.intense"
        padding="spacing.4"
        borderTopWidth="thin"
        borderTopColor="surface.border.gray.muted">
        <Button
          variant="secondary"
          isFullWidth
          isDisabled={isSaving}
          isLoading={isSaving}
          onClick={handleAssign}>
          {isSaving ? 'Saving...' : `Assign to ${selectedIds.length} Staff`}
        </Button>
      </Box>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  employeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#528FF0',
    borderColor: '#528FF0',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  employeeName: {
    fontSize: 16,
    color: '#1A1A1A',
  },
});
