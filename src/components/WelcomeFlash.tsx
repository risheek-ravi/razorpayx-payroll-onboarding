import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
// Icons replaced with emoji for better compatibility
import {colors} from '../theme/colors';

interface WelcomeFlashProps {
  name: string;
  show: boolean;
  onClose: () => void;
}

export const WelcomeFlash = ({name, show, onClose}: WelcomeFlashProps) => {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (show) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss after 4 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  if (!show) {
    return null;
  }

  return (
    <Modal transparent visible={show} animationType="none">
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.content,
            {
              transform: [{scale: scaleAnim}],
              opacity: opacityAnim,
            },
          ]}>
          <View style={styles.iconContainer}>
            <Text style={styles.successEmoji}>✅</Text>
          </View>
          <Text style={styles.title}>Success!</Text>
          <Text style={styles.message}>
            Hi <Text style={styles.nameHighlight}>{name}</Text>,{'\n'}
            welcome to RazorpayX Payroll!
          </Text>
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={handleClose}
            activeOpacity={0.8}>
            <Text style={styles.dismissButtonText}>Dismiss</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  content: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.green[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successEmoji: {
    fontSize: 28,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gray[900],
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: colors.gray[600],
    textAlign: 'center',
    lineHeight: 24,
  },
  nameHighlight: {
    fontWeight: '700',
    color: colors.blue[600],
  },
  dismissButton: {
    marginTop: 24,
    width: '100%',
    backgroundColor: colors.blue[600],
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  dismissButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});

