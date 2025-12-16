import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Feather';
import {InputField} from '../components/InputField';
import {WelcomeFlash} from '../components/WelcomeFlash';
import {colors} from '../theme/colors';
import {RootStackParamList, InputName, BusinessDetails} from '../types';
import {saveBusinessDetails} from '../services/dbService';
import {useAuth} from '../context/AuthContext';

// DEBUG: This should log when the module loads
console.log('=== BusinessDetailsScreen MODULE LOADED ===');

type Props = NativeStackScreenProps<RootStackParamList, 'BusinessDetails'>;

export const BusinessDetailsScreen = ({navigation}: Props) => {
  const {login} = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    businessEmail: '',
  });

  const [errors, setErrors] = useState<Partial<Record<InputName, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [welcomeData, setWelcomeData] = useState({show: false, name: ''});
  const [businessRecord, setBusinessRecord] = useState<BusinessDetails | null>(
    null,
  );

  const handleInputChange = (name: InputName, value: string) => {
    setFormData(prev => ({...prev, [name]: value}));
    if (errors[name]) {
      setErrors(prev => ({...prev, [name]: undefined}));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<InputName, string>> = {};
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business Name is required';
      isValid = false;
    }

    if (!formData.businessEmail.trim()) {
      newErrors.businessEmail = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.businessEmail)) {
      newErrors.businessEmail = 'Invalid email format';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    console.log('=== FORM SUBMIT ===');
    console.log('formData:', JSON.stringify(formData, null, 2));
    try {
      console.log('Calling saveBusinessDetails...');
      const record = await saveBusinessDetails(formData);
      console.log('Success! Record:', JSON.stringify(record, null, 2));
      setBusinessRecord(record);
      setWelcomeData({show: true, name: formData.name});
    } catch (error) {
      console.log('=== ERROR ===');
      console.log('Error:', error);
      Alert.alert('Error', 'Failed to save details. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleFlashClose = async () => {
    setWelcomeData(prev => ({...prev, show: false}));
    setIsSubmitting(false);

    if (businessRecord) {
      // Log the user in - this will trigger navigation to Dashboard
      await login(businessRecord);
      // Navigation happens automatically via AuthContext
    } else {
      navigation.navigate('SalaryCalculation');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <Icon name="arrow-left" size={24} color={colors.gray[800]} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Business Details</Text>
            <Text style={styles.subtitle}>
              Please provide details as asked below for unique account creation
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <InputField
              label="Your Name"
              value={formData.name}
              onChangeText={text => handleInputChange('name', text)}
              error={errors.name}
              placeholder="e.g. John Doe"
            />

            <InputField
              label="Business Name"
              value={formData.businessName}
              onChangeText={text => handleInputChange('businessName', text)}
              error={errors.businessName}
              placeholder="e.g. Acme Corp"
            />

            <InputField
              label="Business Email ID"
              value={formData.businessEmail}
              onChangeText={text => handleInputChange('businessEmail', text)}
              error={errors.businessEmail}
              placeholder="e.g. john@acme.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.termsText}>
            By continuing you agree to{' '}
            <Text style={styles.termsLink}>Terms & Conditions</Text>
          </Text>

          <TouchableOpacity
            style={[
              styles.continueButton,
              isSubmitting && styles.continueButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.8}>
            <Text style={styles.continueButtonText}>
              {isSubmitting ? 'Saving...' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <WelcomeFlash
        show={welcomeData.show}
        name={welcomeData.name}
        onClose={handleFlashClose}
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
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  titleContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.gray[900],
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.gray[500],
    lineHeight: 20,
  },
  formContainer: {
    gap: 8,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 16,
  },
  termsText: {
    fontSize: 12,
    color: colors.gray[400],
    textAlign: 'center',
    marginBottom: 16,
  },
  termsLink: {
    color: colors.blue[600],
    fontWeight: '500',
  },
  continueButton: {
    backgroundColor: colors.blue[600],
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: colors.blue[400],
  },
  continueButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
});
