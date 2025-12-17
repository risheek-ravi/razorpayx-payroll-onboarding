import React, {useState, useCallback} from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useFocusEffect} from '@react-navigation/native';
import {
  Box,
  Text,
  Heading,
  Button,
  Card,
  CardBody,
  Spinner,
  IconButton,
  ArrowLeftIcon,
  ClockIcon,
} from '@razorpay/blade/components';
import {ShiftTypeModal} from '../components/ShiftTypeModal';
import {getShifts} from '../services/dbService';
import {
  RootStackParamList,
  ShiftWithStaffCount,
  ShiftType,
  Shift,
} from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'ShiftList'>;

export const ShiftListScreen = ({navigation}: Props) => {
  const [shifts, setShifts] = useState<ShiftWithStaffCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showShiftTypeModal, setShowShiftTypeModal] = useState(false);

  const loadShifts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getShifts();
      setShifts(data);
    } catch (e) {
      console.error('Failed to load shifts:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Reload shifts when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadShifts();
    }, [loadShifts]),
  );

  const handleShiftTypeSelected = (type: ShiftType) => {
    setShowShiftTypeModal(false);
    if (type === 'fixed') {
      navigation.navigate('AddFixedShift', {});
    } else {
      // TODO: Handle other shift types
      console.log(`${type} shift coming soon`);
    }
  };

  const handleManageShift = (shift: Shift) => {
    navigation.navigate('AddFixedShift', {editingShift: shift});
  };

  const handleManageStaff = (shift: Shift) => {
    navigation.navigate('AssignShift', {
      shiftData: shift,
      existingShiftId: shift.id,
    });
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
          Shift Settings
        </Heading>
      </Box>

      {/* Content */}
      <Box
        flex={1}
        backgroundColor="surface.background.gray.moderate"
        padding="spacing.4">
        {loading ? (
          <Box
            flex={1}
            alignItems="center"
            justifyContent="center"
            paddingY="spacing.10">
            <Spinner
              accessibilityLabel="Loading shifts"
              color="primary"
              size="large"
            />
            <Text marginTop="spacing.4" color="surface.text.gray.muted">
              Loading shifts...
            </Text>
          </Box>
        ) : shifts.length === 0 ? (
          <Box flex={1}>
            <Heading size="small" marginBottom="spacing.2">
              Assign Morning/Evening/Night Shift to your staff
            </Heading>
            <Box
              flexDirection="row"
              alignItems="center"
              gap="spacing.2"
              marginBottom="spacing.6">
              <Text color="feedback.text.positive.intense" weight="semibold">
                ✓
              </Text>
              <Text color="surface.text.gray.muted">
                Create shifts for your staff
              </Text>
            </Box>
            <Box
              flex={1}
              borderWidth="thin"
              borderStyle="dashed"
              borderColor="surface.border.gray.muted"
              borderRadius="medium"
              alignItems="center"
              justifyContent="center"
              minHeight="200px">
              <Text color="surface.text.gray.muted" weight="medium">
                No Shifts Added
              </Text>
            </Box>
          </Box>
        ) : (
          <Box flex={1}>
            <Heading size="small" marginBottom="spacing.4">
              Fixed Shift
            </Heading>
            <Box gap="spacing.4">
              {shifts.map(shift => (
                <ShiftCard
                  key={shift.id}
                  shift={shift}
                  onManageShift={() => handleManageShift(shift)}
                  onManageStaff={() => handleManageStaff(shift)}
                />
              ))}
            </Box>
          </Box>
        )}
      </Box>

      {/* Footer */}
      <Box
        backgroundColor="surface.background.gray.intense"
        padding="spacing.4"
        borderTopWidth="thin"
        borderTopColor="surface.border.gray.muted">
        <Button
          variant="primary"
          isFullWidth
          onClick={() => setShowShiftTypeModal(true)}>
          {shifts.length === 0 ? 'Add Shift' : 'Create Shift'}
        </Button>
      </Box>

      {/* Shift Type Modal - only render when needed to avoid Reanimated issues */}
      {showShiftTypeModal && (
        <ShiftTypeModal
          isOpen={showShiftTypeModal}
          onClose={() => setShowShiftTypeModal(false)}
          onContinue={handleShiftTypeSelected}
        />
      )}
    </SafeAreaView>
  );
};

// ShiftCard Component
type ShiftCardProps = {
  shift: ShiftWithStaffCount;
  onManageShift: () => void;
  onManageStaff: () => void;
};

const ShiftCard = ({shift, onManageShift, onManageStaff}: ShiftCardProps) => {
  return (
    <Card>
      <CardBody>
        <Box
          flexDirection="row"
          justifyContent="space-between"
          alignItems="flex-start"
          marginBottom="spacing.4">
          <Box>
            <Heading size="medium">{shift.name}</Heading>
            <Box
              flexDirection="row"
              alignItems="center"
              gap="spacing.2"
              marginTop="spacing.2">
              <ClockIcon size="small" color="surface.icon.gray.muted" />
              <Text size="small" color="surface.text.gray.muted">
                {shift.startTime} - {shift.endTime}
              </Text>
            </Box>
          </Box>
          <Text size="small" color="surface.text.gray.muted">
            Assigned to {shift.staffCount} Staffs
          </Text>
        </Box>

        <Box flexDirection="row" gap="spacing.3">
          <Box flex={1}>
            <Button variant="tertiary" size="medium" onClick={onManageShift}>
              Manage
            </Button>
          </Box>
          <Box flex={1}>
            <Button variant="tertiary" size="medium" onClick={onManageStaff}>
              Assigned Staff List
            </Button>
          </Box>
        </Box>
      </CardBody>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
