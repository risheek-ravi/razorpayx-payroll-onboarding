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
// Icons replaced with emoji for better compatibility
import {TimePicker} from '../components/TimePicker';
import {colors} from '../theme/colors';
import {RootStackParamList, SalaryConfig} from '../types';
import {
  updateBusinessSalaryConfig,
  getLatestBusinessDetails,
} from '../services/dbService';

type Props = NativeStackScreenProps<RootStackParamList, 'SalaryCalculation'>;

type CalculationMethod = SalaryConfig['calculationMethod'];

export const SalaryScreen = ({navigation}: Props) => {
  const [method, setMethod] = useState<CalculationMethod | null>(null);
  const [shiftHours, setShiftHours] = useState({hours: 8, minutes: 0});
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatTime = (h: number, m: number) => {
    const hh = h.toString().padStart(2, '0');
    const mm = m.toString().padStart(2, '0');
    return `${hh}:${mm} Hrs`;
  };

  const handleContinue = async () => {
    if (!method) {
      return;
    }

    setIsSubmitting(true);
    try {
      const business = await getLatestBusinessDetails();
      if (!business) {
        throw new Error('Business not found');
      }

      await updateBusinessSalaryConfig(business.id, {
        calculationMethod: method,
        shiftHours,
      });

      navigation.navigate('Dashboard', {
        businessName: business.businessName,
        businessId: business.id,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to update salary configuration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = method !== null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>How do you calculate monthly salary</Text>

        {/* Options */}
        <View style={styles.optionsContainer}>
          <RadioCard
            selected={method === 'calendar_month'}
            onPress={() => setMethod('calendar_month')}
            title="Calendar Month"
            description="Ex: March - 31 days, April - 30 Days etc (Per day salary = Salary/No. of days in month)"
          />
          <RadioCard
            selected={method === 'fixed_30_days'}
            onPress={() => setMethod('fixed_30_days')}
            title="Every Month 30 Days"
            description="Ex: March - 30 days, April - 30 Days etc (Per day salary = Salary/30)"
          />
          <RadioCard
            selected={method === 'exclude_weekly_offs'}
            onPress={() => setMethod('exclude_weekly_offs')}
            title="Exclude Weekly Offs"
            description="Ex: Month with 31 days and 4 weekly-offs will have 27 payable days (Per day salary = Salary/Payable Days)"
          />
        </View>

        {/* Shift Hours */}
        <View style={styles.shiftSection}>
          <Text style={styles.shiftTitle}>
            How many hours does your staff work in a shift
          </Text>
          <View style={styles.shiftCard}>
            <View>
              <Text style={styles.shiftLabel}>Shift Hours</Text>
              <Text style={styles.shiftValue}>
                {formatTime(shiftHours.hours, shiftHours.minutes)}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setShowTimePicker(true)}>
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            (!isFormValid || isSubmitting) && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!isFormValid || isSubmitting}
          activeOpacity={0.8}>
          <Text style={styles.continueButtonText}>
            {isSubmitting ? 'Saving...' : 'Continue'}
          </Text>
          {!isSubmitting && (
            <Text style={styles.arrowIcon}>→</Text>
          )}
        </TouchableOpacity>
      </View>

      <TimePicker
        visible={showTimePicker}
        initialHours={shiftHours.hours}
        initialMinutes={shiftHours.minutes}
        onSave={(h, m) => {
          setShiftHours({hours: h, minutes: m});
          setShowTimePicker(false);
        }}
        onCancel={() => setShowTimePicker(false)}
      />
    </SafeAreaView>
  );
};

interface RadioCardProps {
  selected: boolean;
  onPress: () => void;
  title: string;
  description: string;
}

const RadioCard = ({selected, onPress, title, description}: RadioCardProps) => (
  <TouchableOpacity
    style={[styles.radioCard, selected && styles.radioCardSelected]}
    onPress={onPress}
    activeOpacity={0.7}>
    <View style={styles.radioContent}>
      <View
        style={[styles.radioCircle, selected && styles.radioCircleSelected]}>
        {selected && <View style={styles.radioInner} />}
      </View>
      <View style={styles.radioTextContainer}>
        <Text style={styles.radioTitle}>{title}</Text>
        <Text style={styles.radioDescription}>{description}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  backIcon: {
    fontSize: 22,
    color: colors.gray[800],
  },
  arrowIcon: {
    fontSize: 18,
    color: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gray[900],
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 16,
    marginBottom: 32,
  },
  radioCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.gray[200],
  },
  radioCardSelected: {
    borderColor: colors.blue[600],
    backgroundColor: 'rgba(37, 99, 235, 0.05)',
  },
  radioContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.gray[400],
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  radioCircleSelected: {
    borderColor: colors.blue[600],
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.blue[600],
  },
  radioTextContainer: {
    flex: 1,
  },
  radioTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: 4,
  },
  radioDescription: {
    fontSize: 12,
    color: colors.gray[500],
    lineHeight: 18,
  },
  shiftSection: {
    marginBottom: 24,
  },
  shiftTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: 12,
  },
  shiftCard: {
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  shiftLabel: {
    fontSize: 12,
    color: colors.gray[500],
    marginBottom: 4,
  },
  shiftValue: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.gray[900],
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.blue[600],
  },
  footer: {
    padding: 24,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  continueButton: {
    backgroundColor: colors.blue[600],
    paddingVertical: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  continueButtonDisabled: {
    backgroundColor: colors.blue[300],
  },
  continueButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
});

