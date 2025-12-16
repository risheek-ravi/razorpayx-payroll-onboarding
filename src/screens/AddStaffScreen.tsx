import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Feather';
import DateTimePicker from '@react-native-community/datetimepicker';
import {InputField} from '../components/InputField';
import {CycleDateModal} from '../components/CycleDateModal';
import {colors} from '../theme/colors';
import {RootStackParamList} from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'AddStaff'>;

const GENDER_OPTIONS = ['Male', 'Female', 'Other'];
const SALARY_ACCESS_OPTIONS = [
  'Allow till previous cycle',
  'Allow till current date',
  'Disable access',
];

export const AddStaffScreen = ({navigation, route}: Props) => {
  const {staffType, businessId} = route.params;

  const [formData, setFormData] = useState({
    fullName: '',
    companyId: '',
    phoneNumber: '',
    dob: '',
    gender: 'Male',
    salaryCycleDate: 1,
    salaryAccess: 'Allow till previous cycle',
  });

  const [showCyclePicker, setShowCyclePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [showAccessPicker, setShowAccessPicker] = useState(false);

  const isFormValid =
    formData.fullName.trim() !== '' &&
    formData.companyId.trim() !== '' &&
    formData.phoneNumber.trim().length >= 10 &&
    formData.dob.trim() !== '' &&
    formData.gender.trim() !== '';

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({...prev, [name]: value}));
  };

  const handleSubmit = () => {
    if (!isFormValid || !businessId) {
      return;
    }

    navigation.navigate('AddSalary', {
      staffData: {
        businessId,
        type: staffType,
        ...formData,
      },
    });
  };

  const getCycleText = (date: number) => {
    return `${date} to ${date} of every month`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) {
      return '';
    }
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const title =
    staffType === 'full_time' ? 'Add Full Time Staff' : 'Add Contractual Staff';

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color={colors.gray[800]} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{title}</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {/* Staff Full Name */}
          <InputField
            label="Staff Full Name"
            value={formData.fullName}
            onChangeText={text => handleInputChange('fullName', text)}
            placeholder="e.g. Rahul Kumar"
          />

          {/* Company ID */}
          <View>
            <InputField
              label="Staff Company ID"
              value={formData.companyId}
              onChangeText={text => handleInputChange('companyId', text)}
              placeholder="e.g. 0012"
            />
            <Text style={styles.hint}>Last Added Staff Id: 001</Text>
          </View>

          {/* Phone Number */}
          <InputField
            label="Phone Number"
            value={formData.phoneNumber}
            onChangeText={text => handleInputChange('phoneNumber', text)}
            placeholder="+91 0000000000"
            keyboardType="phone-pad"
          />

          {/* DOB */}
          <TouchableOpacity
            style={styles.selectField}
            onPress={() => setShowDatePicker(true)}>
            <Text style={styles.selectLabel}>Date of Birth</Text>
            <Text
              style={[
                styles.selectValue,
                !formData.dob && styles.selectPlaceholder,
              ]}>
              {formData.dob ? formatDate(formData.dob) : 'Select Date'}
            </Text>
            <Icon
              name="calendar"
              size={20}
              color={colors.gray[400]}
              style={styles.selectIcon}
            />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={
                formData.dob ? new Date(formData.dob) : new Date(2000, 0, 1)
              }
              mode="date"
              display="spinner"
              maximumDate={new Date()}
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate && event.type === 'set') {
                  handleInputChange('dob', selectedDate.toISOString());
                }
              }}
            />
          )}

          {/* Gender */}
          <TouchableOpacity
            style={styles.selectField}
            onPress={() => setShowGenderPicker(!showGenderPicker)}>
            <Text style={styles.selectLabel}>Gender</Text>
            <Text style={styles.selectValue}>{formData.gender}</Text>
            <Icon
              name="chevron-down"
              size={20}
              color={colors.gray[500]}
              style={styles.selectIcon}
            />
          </TouchableOpacity>

          {showGenderPicker && (
            <View style={styles.optionsList}>
              {GENDER_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option}
                  style={styles.optionItem}
                  onPress={() => {
                    handleInputChange('gender', option);
                    setShowGenderPicker(false);
                  }}>
                  <Text
                    style={[
                      styles.optionText,
                      formData.gender === option && styles.optionTextSelected,
                    ]}>
                    {option}
                  </Text>
                  {formData.gender === option && (
                    <Icon name="check" size={18} color={colors.blue[600]} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Salary Cycle */}
          <TouchableOpacity
            style={styles.cycleDateField}
            onPress={() => setShowCyclePicker(true)}>
            <View>
              <Text style={styles.selectLabel}>Salary Cycle</Text>
              <Text style={styles.cycleDateValue}>
                {getCycleText(formData.salaryCycleDate)}
              </Text>
            </View>
            <Icon name="calendar" size={20} color={colors.gray[400]} />
          </TouchableOpacity>

          {/* Salary Access */}
          <TouchableOpacity
            style={styles.accessField}
            onPress={() => setShowAccessPicker(!showAccessPicker)}>
            <Text style={styles.selectLabel}>Salary Access</Text>
            <Text style={styles.selectValue}>{formData.salaryAccess}</Text>
            <Icon
              name="chevron-down"
              size={20}
              color={colors.gray[500]}
              style={styles.selectIcon}
            />
          </TouchableOpacity>

          {showAccessPicker && (
            <View style={styles.optionsList}>
              {SALARY_ACCESS_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option}
                  style={styles.optionItem}
                  onPress={() => {
                    handleInputChange('salaryAccess', option);
                    setShowAccessPicker(false);
                  }}>
                  <Text
                    style={[
                      styles.optionText,
                      formData.salaryAccess === option &&
                        styles.optionTextSelected,
                    ]}>
                    {option}
                  </Text>
                  {formData.salaryAccess === option && (
                    <Icon name="check" size={18} color={colors.blue[600]} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={styles.termsText}>
            By continuing you agree to{' '}
            <Text style={styles.termsLink}>Terms & Conditions</Text>
          </Text>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              !isFormValid && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!isFormValid}
            activeOpacity={0.8}>
            <Text style={styles.submitButtonText}>Onboard Staff</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <CycleDateModal
        isOpen={showCyclePicker}
        onClose={() => setShowCyclePicker(false)}
        selectedDate={formData.salaryCycleDate}
        onSelect={date =>
          setFormData(prev => ({...prev, salaryCycleDate: date}))
        }
      />
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
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
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  hint: {
    fontSize: 12,
    color: colors.gray[400],
    marginTop: -8,
    marginBottom: 16,
    marginLeft: 4,
  },
  selectField: {
    backgroundColor: colors.gray[100],
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: colors.gray[300],
    marginBottom: 20,
    position: 'relative',
  },
  selectLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.gray[500],
    marginBottom: 4,
  },
  selectValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[900],
    paddingRight: 24,
  },
  selectPlaceholder: {
    color: colors.gray[400],
  },
  selectIcon: {
    position: 'absolute',
    right: 16,
    top: '50%',
  },
  optionsList: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginTop: -12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.gray[200],
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[700],
  },
  optionTextSelected: {
    color: colors.blue[600],
  },
  cycleDateField: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  cycleDateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[900],
  },
  accessField: {
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    marginBottom: 32,
    position: 'relative',
  },
  termsText: {
    fontSize: 12,
    color: colors.gray[400],
    textAlign: 'center',
  },
  termsLink: {
    color: colors.blue[600],
    fontWeight: '500',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    backgroundColor: colors.white,
  },
  submitButton: {
    backgroundColor: colors.blue[600],
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: colors.blue[200],
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
});
