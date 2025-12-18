import React, {useState} from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import {colors} from '../theme/colors';
import {StaffType} from '../types';

interface StaffTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: (type: StaffType) => void;
}

export const StaffTypeModal = ({
  isOpen,
  onClose,
  onContinue,
}: StaffTypeModalProps) => {
  const [selected, setSelected] = useState<StaffType | null>(null);

  const handleContinue = () => {
    if (selected) {
      onContinue(selected);
      setSelected(null);
    }
  };

  return (
    <Modal transparent visible={isOpen} animationType="slide">
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Select Staff Type</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.optionsContainer}>
            <SelectionCard
              isSelected={selected === 'full_time'}
              onPress={() => setSelected('full_time')}
              title="Full Time Employee"
              emoji="💼"
              bgColor={colors.orange[50]}
            />
            <SelectionCard
              isSelected={selected === 'contract'}
              onPress={() => setSelected('contract')}
              title="Contract Employee"
              emoji="⏰"
              bgColor={colors.teal[50]}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.continueButton,
              !selected && styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={!selected}
            activeOpacity={0.8}>
            <Text
              style={[
                styles.continueButtonText,
                !selected && styles.continueButtonTextDisabled,
              ]}>
              Continue
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

interface SelectionCardProps {
  isSelected: boolean;
  onPress: () => void;
  title: string;
  emoji: string;
  bgColor: string;
}

const SelectionCard = ({
  isSelected,
  onPress,
  title,
  emoji,
  bgColor,
}: SelectionCardProps) => {
  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.cardSelected]}
      onPress={onPress}
      activeOpacity={0.7}>
      <View style={[styles.iconContainer, {backgroundColor: bgColor}]}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
      <Text style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gray[900],
  },
  closeButton: {
    padding: 4,
  },
  closeIcon: {
    fontSize: 20,
    color: colors.gray[500],
  },
  optionsContainer: {
    flexDirection: 'row',
    padding: 24,
    gap: 16,
  },
  card: {
    flex: 1,
    borderWidth: 2,
    borderColor: colors.gray[100],
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  cardSelected: {
    borderColor: colors.blue[600],
    backgroundColor: 'rgba(37, 99, 235, 0.05)',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emoji: {
    fontSize: 40,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[700],
    textAlign: 'center',
  },
  cardTitleSelected: {
    color: colors.blue[700],
  },
  continueButton: {
    marginHorizontal: 24,
    backgroundColor: colors.blue[600],
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: colors.gray[200],
  },
  continueButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  continueButtonTextDisabled: {
    color: colors.gray[400],
  },
});
