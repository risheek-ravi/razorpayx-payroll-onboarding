import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Modal} from 'react-native';
import {PayrollUsageType} from '../types';

interface UsageTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentType?: PayrollUsageType;
  onSave: (type: PayrollUsageType) => void;
}

export const UsageTypeModal: React.FC<UsageTypeModalProps> = ({
  isOpen,
  onClose,
  currentType,
  onSave,
}) => {
  return (
    <Modal visible={isOpen} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>App Usage Mode</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <ModalOption
              type="calculate_only"
              currentType={currentType}
              icon="📄"
              title="Calculate Salaries Only"
              desc="Generate payroll register only"
              onSelect={() => onSave('calculate_only')}
            />
            <ModalOption
              type="calculate_and_pay"
              currentType={currentType}
              icon="💰"
              title="Calculate & Pay"
              desc="Direct bank transfers & UPI"
              onSelect={() => onSave('calculate_and_pay')}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

interface ModalOptionProps {
  type: PayrollUsageType;
  currentType?: PayrollUsageType;
  icon: string;
  title: string;
  desc: string;
  onSelect: () => void;
}

const ModalOption: React.FC<ModalOptionProps> = ({
  type,
  currentType,
  icon,
  title,
  desc,
  onSelect,
}) => {
  const isSelected = currentType === type;

  return (
    <TouchableOpacity
      onPress={onSelect}
      style={[styles.optionCard, isSelected && styles.optionCardSelected]}>
      <View style={styles.optionContent}>
        <View style={styles.optionIcon}>
          <Text style={styles.optionIconText}>{icon}</Text>
        </View>
        <View style={styles.optionTextContainer}>
          <Text
            style={[
              styles.optionTitle,
              isSelected && styles.optionTitleSelected,
            ]}>
            {title}
          </Text>
          <Text style={styles.optionDesc}>{desc}</Text>
        </View>
      </View>
      {isSelected && (
        <View style={styles.checkCircle}>
          <Text style={styles.checkText}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#6B7280',
  },
  content: {
    padding: 24,
    gap: 16,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  optionCardSelected: {
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconText: {
    fontSize: 20,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  optionTitleSelected: {
    color: '#1E40AF',
  },
  optionDesc: {
    fontSize: 12,
    color: '#6B7280',
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
