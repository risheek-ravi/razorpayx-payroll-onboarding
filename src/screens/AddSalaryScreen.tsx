import React, {useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  Box,
  Text,
  Heading,
  TextInput,
  Button,
  Card,
  CardBody,
  Divider,
  Amount,
  BottomSheet,
  BottomSheetHeader,
  BottomSheetBody,
  BottomSheetFooter,
  ActionList,
  ActionListItem,
  ActionListItemIcon,
  ArrowLeftIcon,
  ChevronDownIcon,
  CheckIcon,
} from '@razorpay/blade/components';
import {RootStackParamList} from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'AddSalary'>;

type WageType = 'Monthly' | 'Daily' | 'Per Hour Basis';

const WAGE_TYPES: WageType[] = ['Monthly', 'Daily', 'Per Hour Basis'];

export const AddSalaryScreen = ({navigation, route}: Props) => {
  const {staffData} = route.params;

  const [wageType, setWageType] = useState<WageType>('Monthly');
  const [salaryAmount, setSalaryAmount] = useState('0');
  const [isWageTypeSheetOpen, setIsWageTypeSheetOpen] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const isValid =
    salaryAmount.trim() !== '' &&
    !isNaN(Number(salaryAmount)) &&
    Number(salaryAmount) > 0;

  const handlePreviewClick = () => {
    if (isValid) {
      setShowPreviewModal(true);
    }
  };

  const handleContinue = () => {
    setShowPreviewModal(false);
    // Map 'Per Hour Basis' to 'Hourly' for navigation
    const mappedWageType = wageType === 'Per Hour Basis' ? 'Hourly' : wageType;
    navigation.navigate('AddGeneralInfo', {
      staffData: {
        ...staffData,
        wageType: mappedWageType,
        salaryAmount,
      },
    });
  };

  const calculateSystemBasic = (amount: number, type: WageType) => {
    if (!amount || !Number.isFinite(amount)) {
      return 0;
    }
    switch (type) {
      case 'Monthly':
        return amount;
      case 'Daily':
        return amount / 30;
      case 'Per Hour Basis':
        return amount / 240;
      default:
        return amount;
    }
  };

  const parsedSalary = Number(salaryAmount);
  const safeSalary = Number.isFinite(parsedSalary) ? parsedSalary : 0;
  const currentSystemBasic = calculateSystemBasic(safeSalary, wageType);

  const getWageTypeDisplayName = (type: WageType) => {
    return type === 'Per Hour Basis' ? 'Hourly' : type;
  };

  const getSalaryLabel = (type: WageType) => {
    switch (type) {
      case 'Monthly':
        return 'Monthly salary';
      case 'Daily':
        return 'Daily salary';
      case 'Per Hour Basis':
        return 'Hourly rate';
      default:
        return 'Salary';
    }
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#FFFFFF'}}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}>
        {/* Header */}
        <Box
          paddingX="spacing.5"
          paddingY="spacing.4"
          flexDirection="row"
          alignItems="center"
          backgroundColor="surface.background.gray.intense">
          <Button
            variant="tertiary"
            icon={ArrowLeftIcon}
            accessibilityLabel="Go back"
            onClick={() => navigation.goBack()}
          />
          <Heading size="medium" marginLeft="spacing.3">
            Add staff's salary
          </Heading>
        </Box>

        <ScrollView
          style={{flex: 1, backgroundColor: '#F8FAFC'}}
          contentContainerStyle={{padding: 16}}
          showsVerticalScrollIndicator={false}>
          {/* Main Card */}
          <Card padding="spacing.5">
            <CardBody>
              {/* Wage Type */}
              <Box marginBottom="spacing.5">
                <Text
                  size="small"
                  color="surface.text.gray.muted"
                  marginBottom="spacing.2">
                  Wage Type
                </Text>
                <Button
                  variant="tertiary"
                  onClick={() => setIsWageTypeSheetOpen(true)}
                  icon={ChevronDownIcon}
                  iconPosition="right">
                  {getWageTypeDisplayName(wageType)}
                </Button>
              </Box>

              {/* Salary Template */}
              <Box marginBottom="spacing.5">
                <Text
                  size="small"
                  color="surface.text.gray.muted"
                  marginBottom="spacing.2">
                  Salary Template
                </Text>
                <Box
                  padding="spacing.4"
                  backgroundColor="surface.background.gray.moderate"
                  borderRadius="medium"
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="space-between">
                  <Text color="surface.text.gray.muted">
                    Default ({getWageTypeDisplayName(wageType)})
                  </Text>
                  <ChevronDownIcon
                    size="medium"
                    color="surface.icon.gray.muted"
                  />
                </Box>
              </Box>

              {/* Salary Input Section */}
              <Box
                padding="spacing.4"
                backgroundColor="surface.background.gray.moderate"
                borderRadius="medium">
                <TextInput
                  label={getSalaryLabel(wageType)}
                  prefix="₹"
                  value={salaryAmount}
                  onChange={({value}) => setSalaryAmount(value ?? '0')}
                  placeholder="0"
                  type="number"
                />

                {/* Earnings Section */}
                <Box marginTop="spacing.5" marginBottom="spacing.3">
                  <Text weight="semibold" color="surface.text.gray.normal">
                    Earnings
                  </Text>
                </Box>

                {/* System Basic */}
                <Box>
                  <Text
                    size="small"
                    color="surface.text.gray.muted"
                    marginBottom="spacing.2">
                    System Basic
                  </Text>
                  <Box
                    padding="spacing.3"
                    backgroundColor="surface.background.gray.intense"
                    borderRadius="medium"
                    flexDirection="row"
                    alignItems="center">
                    <Amount
                      value={currentSystemBasic}
                      currency="INR"
                      type="body"
                      size="medium"
                      color="surface.text.gray.muted"
                    />
                  </Box>
                </Box>
              </Box>
            </CardBody>
          </Card>
        </ScrollView>

        {/* Footer */}
        <Box
          padding="spacing.4"
          borderTopWidth="thin"
          borderColor="surface.border.gray.muted"
          backgroundColor="surface.background.gray.intense">
          <Button
            variant="secondary"
            isFullWidth
            isDisabled={!isValid}
            onClick={handlePreviewClick}>
            Preview
          </Button>
        </Box>
      </KeyboardAvoidingView>

      {/* Wage Type Bottom Sheet */}
      <BottomSheet
        isOpen={isWageTypeSheetOpen}
        onDismiss={() => setIsWageTypeSheetOpen(false)}>
        <BottomSheetHeader title="Select Wage Type" />
        <BottomSheetBody>
          <ActionList>
            {WAGE_TYPES.map(type => (
              <ActionListItem
                key={type}
                title={getWageTypeDisplayName(type)}
                value={type}
                isSelected={wageType === type}
                trailing={
                  wageType === type ? (
                    <ActionListItemIcon icon={CheckIcon} />
                  ) : undefined
                }
                onClick={() => {
                  setWageType(type);
                  setIsWageTypeSheetOpen(false);
                }}
              />
            ))}
          </ActionList>
        </BottomSheetBody>
      </BottomSheet>

      {/* Preview Modal */}
      <PreviewBottomSheet
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        onContinue={handleContinue}
        amount={safeSalary}
        systemBasic={currentSystemBasic}
        wageType={wageType}
      />
    </SafeAreaView>
  );
};

interface PreviewBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  amount: number;
  systemBasic: number;
  wageType: WageType;
}

const PreviewBottomSheet = ({
  isOpen,
  onClose,
  onContinue,
  amount,
  systemBasic,
  wageType,
}: PreviewBottomSheetProps) => {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  const safeSystemBasic = Number.isFinite(systemBasic) ? systemBasic : 0;

  const getPeriodLabel = (type: WageType) => {
    switch (type) {
      case 'Monthly':
        return 'MONTHLY';
      case 'Daily':
        return 'DAILY';
      case 'Per Hour Basis':
        return 'HOURLY';
      default:
        return 'MONTHLY';
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onDismiss={onClose}>
      <BottomSheetHeader title="Calculation Preview" />
      <BottomSheetBody>
        {/* Table Header */}
        <Box
          flexDirection="row"
          justifyContent="space-between"
          paddingY="spacing.3"
          backgroundColor="surface.background.gray.moderate"
          paddingX="spacing.4"
          marginBottom="spacing.4"
          borderRadius="medium">
          <Text size="small" weight="semibold" color="surface.text.gray.muted">
            COMPONENTS
          </Text>
          <Text
            size="small"
            weight="semibold"
            color="interactive.text.primary.normal">
            {getPeriodLabel(wageType)}
          </Text>
        </Box>

        {/* Earnings Section */}
        <Text
          size="small"
          weight="semibold"
          color="surface.text.gray.muted"
          marginBottom="spacing.3">
          EARNINGS
        </Text>

        {/* System Basic Row */}
        <Box
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          marginBottom="spacing.3">
          <Text color="surface.text.gray.subtle">System Basic</Text>
          <Amount
            value={safeSystemBasic}
            currency="INR"
            type="body"
            size="medium"
            suffix="none"
          />
        </Box>

        <Divider marginY="spacing.3" />

        {/* Total Row */}
        <Box
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          marginBottom="spacing.4">
          <Text weight="semibold">Total</Text>
          <Amount
            value={safeAmount}
            currency="INR"
            type="body"
            size="medium"
            weight="semibold"
            suffix="none"
          />
        </Box>

        {/* CTC Row */}
        <Box
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          padding="spacing.4"
          backgroundColor="surface.background.gray.moderate"
          borderRadius="medium">
          <Text weight="semibold">CTC</Text>
          <Amount
            value={safeAmount}
            currency="INR"
            type="body"
            size="medium"
            weight="semibold"
            suffix="none"
          />
        </Box>
      </BottomSheetBody>
      <BottomSheetFooter>
        <Button variant="primary" isFullWidth onClick={onContinue}>
          Continue
        </Button>
      </BottomSheetFooter>
    </BottomSheet>
  );
};
