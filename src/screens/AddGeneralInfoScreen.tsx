import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Button, Box} from '@razorpay/blade/components';
// Icons replaced with emoji for better compatibility
import {colors} from '../theme/colors';
import {RootStackParamList, Employee} from '../types';
import {saveEmployee, getLatestBusinessDetails} from '../services/dbService';

type Props = NativeStackScreenProps<RootStackParamList, 'AddGeneralInfo'>;

const DAYS = [
  'Saturday',
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
];

export const AddGeneralInfoScreen = ({navigation, route}: Props) => {
  const {staffData} = route.params;
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleDay = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day],
    );
  };

  const getDisplayText = () => {
    if (selectedDays.length === 0) {
      return 'Select Days';
    }
    if (selectedDays.length === 7) {
      return 'All Days';
    }
    return selectedDays.join(', ');
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const employeeData = {
        ...staffData,
        weeklyOffs: selectedDays,
      } as Omit<Employee, 'id' | 'createdAt'>;

      await saveEmployee(employeeData);

      Alert.alert('Success', 'Staff Saved Successfully', [
        {
          text: 'OK',
          onPress: async () => {
            const business = await getLatestBusinessDetails();
            if (business) {
              navigation.navigate('Dashboard', {
                businessName: business.businessName,
                businessId: business.id,
              });
            }
          },
        },
      ]);
    } catch (e) {
      Alert.alert('Error', 'Error saving staff');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add General Info</Text>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>Weekly Off</Text>

          <TouchableOpacity
            style={[styles.selectField, isOpen && styles.selectFieldActive]}
            onPress={() => setIsOpen(!isOpen)}
            activeOpacity={0.7}>
            <Text
              style={[
                styles.selectValue,
                selectedDays.length === 0 && styles.selectPlaceholder,
              ]}
              numberOfLines={1}>
              {getDisplayText()}
            </Text>
            <Text style={[styles.chevronIcon, isOpen && styles.chevronRotated]}>
              ▼
            </Text>
          </TouchableOpacity>

          {isOpen && (
            <View style={styles.optionsList}>
              {DAYS.map(day => (
                <TouchableOpacity
                  key={day}
                  style={styles.optionItem}
                  onPress={() => toggleDay(day)}
                  activeOpacity={0.7}>
                  <View
                    style={[
                      styles.checkbox,
                      selectedDays.includes(day) && styles.checkboxSelected,
                    ]}>
                    {selectedDays.includes(day) && (
                      <Text style={styles.checkIcon}>✓</Text>
                    )}
                  </View>
                  <Text style={styles.optionText}>{day}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Footer */}
      <Box
        padding="spacing.4"
        borderTopWidth="thin"
        borderColor="surface.border.gray.muted"
        backgroundColor="surface.background.gray.intense">
        <Button
          variant="primary"
          isFullWidth
          isDisabled={isSubmitting}
          isLoading={isSubmitting}
          onClick={handleSave}>
          Continue
        </Button>
      </Box>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray[900],
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    minHeight: 200,
    borderWidth: 1,
    borderColor: colors.gray[200],
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  fieldLabel: {
    fontSize: 12,
    color: colors.gray[500],
    marginBottom: 8,
    marginLeft: 4,
  },
  selectField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  selectFieldActive: {
    borderColor: colors.blue[500],
    borderWidth: 2,
  },
  selectValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[900],
    paddingRight: 8,
  },
  selectPlaceholder: {
    color: colors.gray[400],
  },
  chevronIcon: {
    fontSize: 14,
    color: colors.gray[400],
  },
  chevronRotated: {
    transform: [{rotate: '180deg'}],
  },
  backIcon: {
    fontSize: 22,
    color: colors.gray[800],
  },
  checkIcon: {
    fontSize: 12,
    color: colors.white,
    fontWeight: '700',
  },
  optionsList: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.gray[200],
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
    maxHeight: 300,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[50],
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.gray[300],
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  checkboxSelected: {
    backgroundColor: colors.blue[600],
    borderColor: colors.blue[600],
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[700],
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    backgroundColor: colors.white,
  },
  saveButton: {
    backgroundColor: colors.blue[600],
    paddingVertical: 16,
    borderRadius: 12,
  },
  saveButtonDisabled: {
    backgroundColor: colors.blue[400],
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
});
