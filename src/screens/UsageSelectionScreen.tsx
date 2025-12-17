import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList, PayrollUsageType} from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'UsageSelection'>;

interface UsageOptionProps {
  icon: string;
  title: string;
  description: string;
  onPress: () => void;
  color: string;
  borderColor: string;
  recommended?: boolean;
  disabled?: boolean;
}

export const UsageSelectionScreen: React.FC<Props> = ({navigation, route}) => {
  const {adminName, businessId} = route.params;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelect = async (type: PayrollUsageType) => {
    setIsSubmitting(true);
    try {
      // In a real app, save the preference to backend
      // await updatePayrollUsage(businessId, type);
      
      // Navigate to Dashboard
      navigation.replace('Dashboard', {
        businessName: 'Your Business',
        businessId: businessId,
      });
    } catch (error) {
      console.error('Failed to save preference:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Area */}
      <View style={styles.header}>
        <Text style={styles.headerText}>
          Hi <Text style={styles.headerHighlight}>{adminName || 'Admin'}</Text>,
          {'\n'}how do you want to use our app?
        </Text>
      </View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        <UsageOption
          icon="📄"
          title="Calculate Salaries Only"
          description="Finalise payroll and receive salary register over email"
          onPress={() => handleSelect('calculate_only')}
          color="#F0FDFA"
          borderColor="#99F6E4"
          disabled={isSubmitting}
        />

        <UsageOption
          icon="💰"
          title="Calculate and Pay Salaries"
          description="One-click salary payouts through bank transfers or UPI"
          onPress={() => handleSelect('calculate_and_pay')}
          color="#EFF6FF"
          borderColor="#BFDBFE"
          recommended
          disabled={isSubmitting}
        />
      </View>

      {/* Footer / Branding */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Secure & Automated Payroll by RazorpayX
        </Text>
      </View>
    </SafeAreaView>
  );
};

const UsageOption: React.FC<UsageOptionProps> = ({
  icon,
  title,
  description,
  onPress,
  color,
  borderColor,
  recommended,
  disabled,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.optionCard,
        {backgroundColor: '#FFFFFF', borderColor},
        disabled && styles.optionCardDisabled,
      ]}
      activeOpacity={0.7}>
      {recommended && (
        <View style={styles.recommendedBadge}>
          <Text style={styles.recommendedText}>RECOMMENDED</Text>
        </View>
      )}

      <View style={styles.optionContent}>
        <View style={[styles.iconContainer, {backgroundColor: color}]}>
          <Text style={styles.iconText}>{icon}</Text>
        </View>
        <View style={styles.optionTextContainer}>
          <Text style={styles.optionTitle}>{title}</Text>
          <Text style={styles.optionDescription}>{description}</Text>
        </View>
      </View>

      {disabled && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color="#3B82F6" />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 32,
    paddingTop: 48,
    paddingBottom: 24,
  },
  headerText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 32,
  },
  headerHighlight: {
    color: '#3B82F6',
  },
  optionsContainer: {
    flex: 1,
    paddingHorizontal: 24,
    gap: 16,
  },
  optionCard: {
    position: 'relative',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
  },
  optionCardDisabled: {
    opacity: 0.7,
  },
  recommendedBadge: {
    position: 'absolute',
    top: -12,
    right: 16,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recommendedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 28,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});

export default UsageSelectionScreen;

