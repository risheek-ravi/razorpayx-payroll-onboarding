import React, {useState} from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import {Button, Box, Heading, Divider} from '@razorpay/blade/components';
import {ShiftType} from '../types';

type ShiftTypeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onContinue: (type: ShiftType) => void;
};

interface ShiftOption {
  value: ShiftType;
  title: string;
  description: string;
}

const SHIFT_OPTIONS: ShiftOption[] = [
  {
    value: 'fixed',
    title: 'Fixed Shift',
    description:
      'Add and assign single shift to your staff who have fixed work timing',
  },
  {
    value: 'open',
    title: 'Open Shift',
    description:
      'Add and assign staff to open shifts, no predefined shift timings',
  },
  {
    value: 'rotational',
    title: 'Rotational Shift',
    description: 'Add and assign shifts to your staff who have multiple shifts',
  },
];

export const ShiftTypeModal = ({
  isOpen,
  onClose,
  onContinue,
}: ShiftTypeModalProps) => {
  const [selectedType, setSelectedType] = useState<ShiftType>('fixed');

  const handleContinue = () => {
    onContinue(selectedType);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropPressable} onPress={onClose} />
        <View style={styles.modalContent}>
          {/* Header */}
          <Box paddingX="spacing.5" paddingY="spacing.4">
            <Heading size="medium">Select Shift Type</Heading>
          </Box>
          <Divider />

          {/* Body - Custom Radio Buttons */}
          <View style={styles.body}>
            {SHIFT_OPTIONS.map(option => (
              <TouchableOpacity
                key={option.value}
                style={styles.radioOption}
                onPress={() => setSelectedType(option.value)}
                activeOpacity={0.7}>
                <View style={styles.radioOuter}>
                  {selectedType === option.value && (
                    <View style={styles.radioInner} />
                  )}
                </View>
                <View style={styles.radioText}>
                  <Text style={styles.radioTitle}>{option.title}</Text>
                  <Text style={styles.radioDescription}>
                    {option.description}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Footer */}
          <Box
            paddingX="spacing.5"
            paddingY="spacing.4"
            borderTopWidth="thin"
            borderTopColor="surface.border.gray.muted">
            <Button variant="secondary" isFullWidth onClick={handleContinue}>
              Continue
            </Button>
          </Box>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdropPressable: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
  },
  body: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#528FF0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#528FF0',
  },
  radioText: {
    flex: 1,
  },
  radioTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  radioDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});
