import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

interface PaymentSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount?: number;
}

type Step = 'preparing' | 'otp_input' | 'processing' | 'success';

export const PaymentSecurityModal: React.FC<PaymentSecurityModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  amount,
}) => {
  const [step, setStep] = useState<Step>('preparing');
  const [otp, setOtp] = useState(['', '', '', '']);
  const inputsRef = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setStep('preparing');
      setOtp(['', '', '', '']);
      // 1.5s Loading Screen
      const timer = setTimeout(() => {
        setStep('otp_input');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (step === 'otp_input' && inputsRef.current[0]) {
      inputsRef.current[0]?.focus();
    }
  }, [step]);

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input
    if (value && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }

    // Check completion
    if (newOtp.every(d => d !== '') && index === 3 && value) {
      setTimeout(() => startProcessing(), 300);
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const startProcessing = () => {
    setStep('processing');
    // 5s Processing Screen
    setTimeout(() => {
      setStep('success');
      // Auto close after showing success for a bit
      setTimeout(() => {
        onSuccess();
      }, 1500);
    }, 5000);
  };

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} animationType="fade" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {step === 'preparing' && (
            <View style={styles.stepContainer}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={styles.stepText}>Securing connection...</Text>
            </View>
          )}

          {step === 'otp_input' && (
            <View style={styles.stepContainer}>
              <View style={styles.iconContainer}>
                <Text style={styles.iconText}>🔒</Text>
              </View>
              <Text style={styles.title}>Verify Payment</Text>
              <Text style={styles.subtitle}>
                Please enter the 4-digit PIN to authorize this payment
                {amount ? ` of ₹${amount}` : ''}.
              </Text>

              <View style={styles.otpContainer}>
                {otp.map((digit, idx) => (
                  <TextInput
                    key={idx}
                    ref={el => (inputsRef.current[idx] = el)}
                    style={styles.otpInput}
                    keyboardType="number-pad"
                    maxLength={1}
                    value={digit}
                    onChangeText={value => handleOtpChange(idx, value)}
                    onKeyPress={({nativeEvent}) =>
                      handleKeyPress(idx, nativeEvent.key)
                    }
                    secureTextEntry
                  />
                ))}
              </View>

              <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 'processing' && (
            <View style={styles.stepContainer}>
              <View style={styles.processingSpinner}>
                <ActivityIndicator size="large" color="#3B82F6" />
              </View>
              <Text style={styles.title}>Processing Payment</Text>
              <Text style={styles.subtitle}>
                Please do not close this window
              </Text>
            </View>
          )}

          {step === 'success' && (
            <View style={styles.stepContainer}>
              <View style={styles.successIcon}>
                <Text style={styles.successIconText}>✓</Text>
              </View>
              <Text style={styles.successTitle}>Payment Successful</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  stepContainer: {
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconText: {
    fontSize: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  stepText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 16,
  },
  otpContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  otpInput: {
    width: 48,
    height: 48,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  cancelButton: {
    padding: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  processingSpinner: {
    marginBottom: 24,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successIconText: {
    fontSize: 40,
    color: '#10B981',
    fontWeight: '700',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
});

