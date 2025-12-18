import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Alert,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList, Employee} from '../types';
import {InsightsView} from '../components/EmployeeDetailView';
import {InputField} from '../components/InputField';
import {CycleDateModal} from '../components/CycleDateModal';

type Props = NativeStackScreenProps<RootStackParamList, 'StaffProfile'>;

type Tab = 'Basic' | 'Professional' | 'Attendance' | 'Payment';

export const StaffProfileScreen: React.FC<Props> = ({navigation, route}) => {
  const {employee} = route.params;
  const [activeTab, setActiveTab] = useState<Tab>('Basic');
  const [currentEmployee, setCurrentEmployee] = useState(employee);

  const handleUpdateEmployee = async (updatedData: Partial<Employee>) => {
    const updated = {...currentEmployee, ...updatedData};
    try {
      // In a real app, call updateEmployee API
      setCurrentEmployee(updated);
      Alert.alert('Success', 'Updated Successfully');
    } catch (e) {
      Alert.alert('Error', 'Failed to update');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Staff Profile</Text>
          <Text style={styles.headerSubtitle}>
            {currentEmployee.fullName} |{' '}
            {currentEmployee.type === 'full_time' ? 'Full Time' : 'Contract'}
          </Text>
        </View>
      </View>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}>
        {(['Basic', 'Professional', 'Attendance', 'Payment'] as Tab[]).map(
          tab => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tab, activeTab === tab && styles.tabActive]}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.tabTextActive,
                ]}>
                {tab} Details
              </Text>
            </TouchableOpacity>
          ),
        )}
      </ScrollView>

      {/* Content */}
      <ScrollView style={styles.content}>
        {activeTab === 'Basic' && (
          <BasicDetailsTab
            employee={currentEmployee}
            onSave={handleUpdateEmployee}
          />
        )}

        {activeTab === 'Professional' && (
          <ProfessionalTab
            data={currentEmployee.professionalDetails || {}}
            onSave={data => handleUpdateEmployee({professionalDetails: data})}
          />
        )}

        {activeTab === 'Attendance' && (
          <InsightsView
            employee={currentEmployee}
            onBack={() => {}}
            hideHeader
          />
        )}

        {activeTab === 'Payment' && (
          <PaymentTab
            data={currentEmployee.paymentDetails || {}}
            onSave={data => handleUpdateEmployee({paymentDetails: data})}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Sub-components for Tabs ---

interface BasicDetailsTabProps {
  employee: Employee;
  onSave: (d: Partial<Employee>) => void;
}

const BasicDetailsTab: React.FC<BasicDetailsTabProps> = ({
  employee,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    fullName: employee.fullName,
    companyId: employee.companyId,
    phoneNumber: employee.phoneNumber,
    dob: employee.dob,
    gender: employee.gender,
    wageType: employee.wageType || 'Monthly',
    salaryAmount: employee.salaryAmount || '',
    salaryCycleDate: employee.salaryCycleDate || 1,
    weeklyOffs: employee.weeklyOffs || [],
  });

  const [showCyclePicker, setShowCyclePicker] = useState(false);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({...prev, [field]: value}));
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  const getCycleText = (date: number) => {
    return `${date} to ${date} of every month`;
  };

  return (
    <View style={styles.tabContent}>
      <View style={styles.card}>
        <InputField
          label="Full Name"
          value={formData.fullName}
          onChangeText={text => handleChange('fullName', text)}
        />
        <InputField
          label="Company ID"
          value={formData.companyId}
          onChangeText={text => handleChange('companyId', text)}
        />
        <InputField
          label="Phone Number"
          value={formData.phoneNumber}
          onChangeText={text => handleChange('phoneNumber', text)}
          keyboardType="phone-pad"
        />
        <InputField
          label="Date of Birth"
          value={formData.dob}
          onChangeText={text => handleChange('dob', text)}
        />

        <View style={styles.divider} />

        <View style={styles.selectField}>
          <Text style={styles.selectLabel}>Wage Type</Text>
          <View style={styles.selectButtons}>
            {['Monthly', 'Daily', 'Hourly'].map(type => (
              <TouchableOpacity
                key={type}
                onPress={() => handleChange('wageType', type)}
                style={[
                  styles.selectButton,
                  formData.wageType === type && styles.selectButtonActive,
                ]}>
                <Text
                  style={[
                    styles.selectButtonText,
                    formData.wageType === type && styles.selectButtonTextActive,
                  ]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <InputField
          label="Salary Amount"
          value={formData.salaryAmount}
          onChangeText={text => handleChange('salaryAmount', text)}
          keyboardType="numeric"
        />

        {/* Salary Cycle Picker Trigger */}
        <TouchableOpacity
          onPress={() => setShowCyclePicker(true)}
          style={styles.pickerField}>
          <Text style={styles.pickerLabel}>Salary Cycle</Text>
          <Text style={styles.pickerValue}>
            {getCycleText(formData.salaryCycleDate)}
          </Text>
          <Text style={styles.pickerIcon}>📅</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSubmit} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </View>

      <CycleDateModal
        isOpen={showCyclePicker}
        onClose={() => setShowCyclePicker(false)}
        selectedDate={formData.salaryCycleDate}
        onSelect={date => handleChange('salaryCycleDate', date)}
      />
    </View>
  );
};

interface ProfessionalTabProps {
  data: any;
  onSave: (d: any) => void;
}

const ProfessionalTab: React.FC<ProfessionalTabProps> = ({data, onSave}) => {
  const [formData, setFormData] = useState({
    designation: data.designation || '',
    department: data.department || '',
    pfNumber: data.pfNumber || '',
  });

  return (
    <View style={styles.tabContent}>
      <View style={styles.card}>
        <InputField
          label="Designation"
          value={formData.designation}
          onChangeText={text => setFormData(p => ({...p, designation: text}))}
          placeholder="e.g. Senior Developer"
        />
        <InputField
          label="Department"
          value={formData.department}
          onChangeText={text => setFormData(p => ({...p, department: text}))}
          placeholder="e.g. Engineering"
        />
        <InputField
          label="PF Number"
          value={formData.pfNumber}
          onChangeText={text => setFormData(p => ({...p, pfNumber: text}))}
          placeholder="Optional"
        />

        <TouchableOpacity
          onPress={() => onSave(formData)}
          style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save Professional Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

interface PaymentTabProps {
  data: any;
  onSave: (d: any) => void;
}

const PaymentTab: React.FC<PaymentTabProps> = ({data, onSave}) => {
  const [formData, setFormData] = useState({
    upiId: data.upiId || '',
    accountHolderName: data.accountHolderName || '',
    accountNumber: data.accountNumber || '',
    ifsc: data.ifsc || '',
    paymentMode: data.paymentMode || 'NEFT',
  });

  return (
    <View style={styles.tabContent}>
      {/* UPI Section */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>UPI Details</Text>
        <InputField
          label="UPI ID"
          value={formData.upiId}
          onChangeText={text => setFormData(p => ({...p, upiId: text}))}
          placeholder="e.g. user@okhdfcbank"
        />
      </View>

      {/* Bank Details Section */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Bank Account Details</Text>

        <InputField
          label="Account Holder Name"
          value={formData.accountHolderName}
          onChangeText={text =>
            setFormData(p => ({...p, accountHolderName: text}))
          }
          placeholder="e.g. John Doe"
        />

        <InputField
          label="Account Number"
          value={formData.accountNumber}
          onChangeText={text => setFormData(p => ({...p, accountNumber: text}))}
          keyboardType="numeric"
          placeholder="0000000000"
        />

        <InputField
          label="IFSC Code"
          value={formData.ifsc}
          onChangeText={text =>
            setFormData(p => ({...p, ifsc: text.toUpperCase()}))
          }
          placeholder="e.g. HDFC0001234"
        />

        <View style={styles.selectField}>
          <Text style={styles.selectLabel}>Payment Mode</Text>
          <View style={styles.selectButtons}>
            {['NEFT', 'IMPS'].map(mode => (
              <TouchableOpacity
                key={mode}
                onPress={() => setFormData(p => ({...p, paymentMode: mode}))}
                style={[
                  styles.selectButton,
                  formData.paymentMode === mode && styles.selectButtonActive,
                ]}>
                <Text
                  style={[
                    styles.selectButtonText,
                    formData.paymentMode === mode &&
                      styles.selectButtonTextActive,
                  ]}>
                  {mode}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => onSave(formData)}
        style={styles.saveButton}>
        <Text style={styles.saveButtonText}>Save Payment Details</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#111827',
  },
  headerInfo: {
    flex: 1,
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
  tabsContainer: {
    flexGrow: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  tab: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#3B82F6',
  },
  content: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  tabContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 80,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 8,
  },
  selectField: {
    gap: 8,
  },
  selectLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  selectButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  selectButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  selectButtonActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  selectButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  selectButtonTextActive: {
    color: '#3B82F6',
  },
  pickerField: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#D1D5DB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: 'relative',
  },
  pickerLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 4,
  },
  pickerValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  pickerIcon: {
    position: 'absolute',
    right: 16,
    top: '50%',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default StaffProfileScreen;
