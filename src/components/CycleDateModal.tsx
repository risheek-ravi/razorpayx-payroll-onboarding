import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import {colors} from '../theme/colors';

interface CycleDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (date: number) => void;
  selectedDate: number;
}

export const CycleDateModal = ({
  isOpen,
  onClose,
  onSelect,
  selectedDate,
}: CycleDateModalProps) => {
  const dates = Array.from({length: 28}, (_, i) => i + 1);

  return (
    <Modal transparent visible={isOpen} animationType="fade">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.content}>
              <Text style={styles.title}>Select Salary Cycle Start Date</Text>

              <View style={styles.grid}>
                {dates.map(date => (
                  <TouchableOpacity
                    key={date}
                    style={[
                      styles.dateButton,
                      selectedDate === date && styles.dateButtonSelected,
                    ]}
                    onPress={() => {
                      onSelect(date);
                      onClose();
                    }}
                    activeOpacity={0.7}>
                    <Text
                      style={[
                        styles.dateText,
                        selectedDate === date && styles.dateTextSelected,
                      ]}>
                      {date}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.hint}>
                Salary cycle starts on this day every month
              </Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  content: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray[900],
    textAlign: 'center',
    marginBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  dateButton: {
    width: '17%',
    aspectRatio: 1,
    backgroundColor: colors.blue[50],
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateButtonSelected: {
    backgroundColor: colors.blue[600],
    shadowColor: colors.blue[600],
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.blue[900],
  },
  dateTextSelected: {
    color: colors.white,
  },
  hint: {
    fontSize: 12,
    color: colors.gray[400],
    textAlign: 'center',
    marginTop: 16,
  },
});
