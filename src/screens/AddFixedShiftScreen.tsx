import React, {useState, useMemo} from 'react';
import {SafeAreaView, StyleSheet, ScrollView} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  Box,
  Text,
  Heading,
  Button,
  TextInput,
  IconButton,
  ArrowLeftIcon,
  Dropdown,
  DropdownOverlay,
  SelectInput,
  ActionList,
  ActionListItem,
  InfoIcon,
  Tooltip,
  TooltipInteractiveWrapper,
} from '@razorpay/blade/components';
import {updateShift} from '../services/dbService';
import {RootStackParamList, Shift} from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'AddFixedShift'>;

// Generate time options (every 30 mins)
const generateTimeOptions = () => {
  const options: string[] = [];
  for (let i = 0; i < 24; i++) {
    for (let j = 0; j < 60; j += 30) {
      const hours = i % 12 || 12;
      const minutes = j.toString().padStart(2, '0');
      const period = i < 12 ? 'AM' : 'PM';
      options.push(`${hours.toString().padStart(2, '0')}:${minutes} ${period}`);
    }
  }
  return options;
};

const TIME_OPTIONS = generateTimeOptions();

export const AddFixedShiftScreen = ({navigation, route}: Props) => {
  const editingShift = route.params?.editingShift;

  const [shiftName, setShiftName] = useState(editingShift?.name || '');
  const [startTime, setStartTime] = useState(
    editingShift?.startTime || '10:00 AM',
  );
  const [endTime, setEndTime] = useState(editingShift?.endTime || '06:00 PM');
  const [breakMinutes, setBreakMinutes] = useState(
    editingShift?.breakMinutes ? String(editingShift.breakMinutes) : '',
  );
  const [isSaving, setIsSaving] = useState(false);

  const payableHours = useMemo(() => {
    const parseTime = (timeStr: string) => {
      const parts = timeStr.split(' ');
      const time = parts[0];
      const modifier = parts[1];
      const timeParts = time.split(':');
      let hours = parseInt(timeParts[0], 10);
      const minutes = parseInt(timeParts[1], 10);
      if (hours === 12) {
        hours = 0;
      }
      if (modifier === 'PM') {
        hours += 12;
      }
      return hours * 60 + minutes;
    };

    let start = parseTime(startTime);
    let end = parseTime(endTime);

    // Handle overnight shifts (e.g., 10 PM to 6 AM)
    if (end < start) {
      end += 24 * 60;
    }

    let diffMinutes = end - start;

    // Subtract break
    const breakMins = parseInt(breakMinutes, 10);
    if (!isNaN(breakMins)) {
      diffMinutes -= breakMins;
    }

    if (diffMinutes < 0) {
      diffMinutes = 0;
    }

    const h = Math.floor(diffMinutes / 60);
    const m = diffMinutes % 60;

    if (m > 0) {
      return `${h} hr ${m} min`;
    }
    return `${h} hr`;
  }, [startTime, endTime, breakMinutes]);

  const isFormValid = shiftName.trim() !== '';

  const handleContinue = async () => {
    if (!isFormValid) {
      return;
    }

    const shiftData: Omit<Shift, 'id'> = {
      name: shiftName,
      type: 'fixed',
      startTime,
      endTime,
      breakMinutes: parseInt(breakMinutes, 10) || 0,
    };

    if (editingShift) {
      // Update Mode
      setIsSaving(true);
      try {
        await updateShift({...shiftData, id: editingShift.id});
        navigation.goBack();
      } catch (e) {
        console.error('Failed to update shift:', e);
      } finally {
        setIsSaving(false);
      }
    } else {
      // Create Mode - Navigate to AssignShift
      navigation.navigate('AssignShift', {shiftData});
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Box
        backgroundColor="surface.background.gray.intense"
        paddingX="spacing.5"
        paddingY="spacing.4"
        flexDirection="row"
        alignItems="center">
        <IconButton
          icon={ArrowLeftIcon}
          accessibilityLabel="Go back"
          onClick={() => navigation.goBack()}
          size="medium"
        />
        <Heading size="medium" marginLeft="spacing.3">
          {editingShift ? 'Update Fixed Shift' : 'Add Fixed Shift'}
        </Heading>
      </Box>

      {/* Content */}
      <ScrollView style={styles.scrollView}>
        <Box padding="spacing.6" gap="spacing.6">
          {/* Shift Name */}
          <TextInput
            label="Shift Name"
            placeholder="e.g. General Shift"
            value={shiftName}
            onChange={({value}) => setShiftName(value || '')}
            necessityIndicator="required"
          />

          {/* Time Selectors */}
          <Box gap="spacing.4">
            <Dropdown selectionType="single">
              <SelectInput
                label="Start Time"
                value={startTime}
                onChange={({values}) => setStartTime(values[0] || startTime)}
              />
              <DropdownOverlay>
                <ActionList>
                  {TIME_OPTIONS.map(time => (
                    <ActionListItem key={time} title={time} value={time} />
                  ))}
                </ActionList>
              </DropdownOverlay>
            </Dropdown>

            <Dropdown selectionType="single">
              <SelectInput
                label="End Time"
                value={endTime}
                onChange={({values}) => setEndTime(values[0] || endTime)}
              />
              <DropdownOverlay>
                <ActionList>
                  {TIME_OPTIONS.map(time => (
                    <ActionListItem key={time} title={time} value={time} />
                  ))}
                </ActionList>
              </DropdownOverlay>
            </Dropdown>
          </Box>

          {/* Unpaid Break */}
          <Box
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between">
            <Box flexDirection="row" alignItems="center" gap="spacing.2">
              <Text weight="medium">Unpaid Break</Text>
              <Tooltip content="Unpaid break time will be deducted from total shift hours">
                <TooltipInteractiveWrapper>
                  <InfoIcon size="small" color="surface.icon.gray.muted" />
                </TooltipInteractiveWrapper>
              </Tooltip>
            </Box>
            <Box flexDirection="row" alignItems="center" gap="spacing.2">
              <Box width="80px">
                <TextInput
                  accessibilityLabel="Break minutes"
                  placeholder="0"
                  value={breakMinutes}
                  onChange={({value}) => setBreakMinutes(value || '')}
                  type="number"
                  textAlign="center"
                />
              </Box>
              <Text color="surface.text.gray.muted">min</Text>
            </Box>
          </Box>

          {/* Net Payable Hours */}
          <Box
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            paddingTop="spacing.4"
            borderTopWidth="thin"
            borderTopColor="surface.border.gray.muted">
            <Text weight="semibold">Net Payable Hours</Text>
            <Text weight="semibold" color="surface.text.gray.muted">
              {payableHours}
            </Text>
          </Box>
        </Box>
      </ScrollView>

      {/* Footer */}
      <Box
        backgroundColor="surface.background.gray.intense"
        padding="spacing.4"
        borderTopWidth="thin"
        borderTopColor="surface.border.gray.muted">
        <Button
          variant="primary"
          isFullWidth
          isDisabled={!isFormValid || isSaving}
          isLoading={isSaving}
          onClick={handleContinue}>
          {isSaving ? 'Saving...' : editingShift ? 'Update Shift' : 'Continue'}
        </Button>
      </Box>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
});
