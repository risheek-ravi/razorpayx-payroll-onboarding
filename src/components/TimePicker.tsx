import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import {colors} from '../theme/colors';

interface TimePickerProps {
  initialHours: number;
  initialMinutes: number;
  onSave: (hours: number, minutes: number) => void;
  onCancel: () => void;
  visible: boolean;
}

const HOURS = Array.from({length: 24}, (_, i) => i);
const MINUTES = Array.from({length: 60}, (_, i) => i);
const ITEM_HEIGHT = 48;
const VISIBLE_ITEMS = 3;

export const TimePicker = ({
  initialHours,
  initialMinutes,
  onSave,
  onCancel,
  visible,
}: TimePickerProps) => {
  const [selectedHour, setSelectedHour] = useState(initialHours);
  const [selectedMinute, setSelectedMinute] = useState(initialMinutes);

  const format = (val: number) => val.toString().padStart(2, '0');

  return (
    <Modal transparent visible={visible} animationType="slide">
      <View style={styles.overlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={onCancel}
          activeOpacity={1}
        />
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Shift Hours</Text>
            <Text style={styles.subtitle}>
              Enter the number of hours in a shift
            </Text>
          </View>

          <View style={styles.pickersContainer}>
            <View style={styles.selectionBar} />

            <Text style={styles.labelText}>Hrs</Text>

            <ScrollPicker
              data={HOURS}
              value={selectedHour}
              onValueChange={setSelectedHour}
              format={format}
            />

            <Text style={styles.separator}>:</Text>

            <ScrollPicker
              data={MINUTES}
              value={selectedMinute}
              onValueChange={setSelectedMinute}
              format={format}
            />

            <Text style={styles.labelText}>Mins</Text>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => onSave(selectedHour, selectedMinute)}
              activeOpacity={0.8}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

interface ScrollPickerProps {
  data: number[];
  value: number;
  onValueChange: (value: number) => void;
  format: (val: number) => string;
}

const ScrollPicker = ({
  data,
  value,
  onValueChange,
  format,
}: ScrollPickerProps) => {
  const flatListRef = useRef<FlatList>(null);

  const handleMomentumScrollEnd = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, data.length - 1));
    onValueChange(data[clampedIndex]);
  };

  const getItemLayout = (_: any, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  });

  const renderItem = ({item}: {item: number}) => {
    const isSelected = item === value;
    return (
      <View style={styles.pickerItem}>
        <Text
          style={[
            styles.pickerItemText,
            isSelected && styles.pickerItemTextSelected,
          ]}>
          {format(item)}
        </Text>
      </View>
    );
  };

  return (
    <FlatList
      ref={flatListRef}
      data={data}
      renderItem={renderItem}
      keyExtractor={item => item.toString()}
      showsVerticalScrollIndicator={false}
      snapToInterval={ITEM_HEIGHT}
      decelerationRate="fast"
      onMomentumScrollEnd={handleMomentumScrollEnd}
      getItemLayout={getItemLayout}
      initialScrollIndex={value}
      style={styles.picker}
      contentContainerStyle={{
        paddingVertical: ITEM_HEIGHT,
      }}
    />
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  header: {
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray[900],
  },
  subtitle: {
    fontSize: 14,
    color: colors.gray[500],
    marginTop: 4,
  },
  pickersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    marginVertical: 8,
  },
  selectionBar: {
    position: 'absolute',
    top: ITEM_HEIGHT,
    left: 32,
    right: 32,
    height: ITEM_HEIGHT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.gray[200],
  },
  labelText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray[900],
    marginHorizontal: 8,
  },
  separator: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gray[400],
    marginHorizontal: 4,
  },
  picker: {
    width: 64,
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
  },
  pickerItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerItemText: {
    fontSize: 20,
    color: colors.gray[400],
  },
  pickerItemTextSelected: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.gray[900],
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  saveButton: {
    backgroundColor: colors.blue[600],
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

