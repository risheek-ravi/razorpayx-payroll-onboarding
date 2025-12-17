import React, {useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useFocusEffect} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import {
  Box,
  Text,
  Heading,
  Button,
  Card,
  CardBody,
  Spinner,
} from '@razorpay/blade/components';
import {StaffTypeModal} from '../components/StaffTypeModal';
import {AttendanceTab} from '../components/AttendanceTab';
import {colors} from '../theme/colors';
import {RootStackParamList, StaffType, Employee, Shift} from '../types';
import {
  logStaffSelection,
  getEmployees,
  getShifts,
} from '../services/dbService';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

type Tab = 'home' | 'staff' | 'attendance' | 'payroll' | 'settings';

export const DashboardScreen = ({navigation, route}: Props) => {
  const {businessName, businessId} = route.params;
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<(Shift & {staffCount: number})[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [empData, shiftData] = await Promise.all([
        getEmployees(),
        getShifts(),
      ]);
      setEmployees(empData);
      setShifts(shiftData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Reload data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const handleAddStaffClick = () => {
    setShowStaffModal(true);
  };

  const handleStaffTypeSelected = async (type: StaffType) => {
    await logStaffSelection(type);
    setShowStaffModal(false);
    navigation.navigate('AddStaff', {
      staffType: type,
      businessId: businessId,
    });
  };

  // Group employees by Wage Type
  const groupedEmployees = {
    Monthly: employees.filter(e => e.wageType === 'Monthly'),
    Daily: employees.filter(e => e.wageType === 'Daily'),
    Hourly: employees.filter(e => e.wageType === 'Hourly'),
  };

  // Navigate to staff profile
  const handleStaffSelect = (employee: Employee) => {
    navigation.navigate('StaffProfile', {employee});
  };

  // Navigate to finalize payroll
  const handlePayrollClick = () => {
    navigation.navigate('FinalizePayroll');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text size="large" weight="semibold" truncateAfterLines={1}>
            {businessName}
          </Text>
          <Icon name="chevron-down" size={20} color={colors.gray[500]} />
        </View>
        <TouchableOpacity style={styles.helpButton}>
          <Text size="small" color="interactive.text.primary.normal">
            Help
          </Text>
          <Icon name="message-circle" size={20} color={colors.blue[600]} />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        {/* Home Tab */}
        {activeTab === 'home' && (
          <Box>
            {/* Quick Actions Card */}
            <Card marginBottom="spacing.5">
              <CardBody>
                <Text
                  size="small"
                  weight="semibold"
                  color="surface.text.gray.muted"
                  marginBottom="spacing.5">
                  QUICK ACTIONS
                </Text>
                <Box marginBottom="spacing.6">
                  <FeatureRow
                    icon="calendar"
                    text="Mark daily attendance of your staff"
                    onPress={() => setActiveTab('attendance')}
                  />
                  <Box marginTop="spacing.4">
                    <FeatureRow
                      icon="clock"
                      text="Auto salary calculation based on attendance"
                      onPress={() => {}}
                    />
                  </Box>
                  <Box marginTop="spacing.4">
                    <FeatureRow
                      icon="file-text"
                      text="Send salary slips via whatsapp & sms"
                      onPress={() => {}}
                    />
                  </Box>
                  <Box marginTop="spacing.4">
                    <FeatureRow
                      icon="play-circle"
                      text="Finalize & Execute Payroll"
                      onPress={handlePayrollClick}
                      isNew
                    />
                  </Box>
                </Box>

                <Button onClick={handleAddStaffClick} isFullWidth>
                  Add Staff
                </Button>
              </CardBody>
            </Card>

            {/* Premium Card */}
            <View style={styles.premiumCard}>
              <View style={styles.premiumBadge}>
                <Text size="small" weight="semibold">
                  RazorpayX Payroll Premium
                </Text>
              </View>

              <View style={styles.premiumContent}>
                <View style={styles.premiumTextContainer}>
                  <Heading size="small">
                    Ask staff to mark selfie attendance
                  </Heading>
                </View>
                <View style={styles.phoneGraphic}>
                  <Icon name="smartphone" size={32} color={colors.white} />
                </View>
              </View>

              <TouchableOpacity style={styles.unlockButton} activeOpacity={0.8}>
                <Text
                  size="small"
                  weight="semibold"
                  color="surface.text.staticWhite.normal">
                  Unlock RazorpayX Payroll Premium
                </Text>
              </TouchableOpacity>
            </View>
          </Box>
        )}

        {/* Staff Tab */}
        {activeTab === 'staff' && (
          <Box>
            <Button
              onClick={handleAddStaffClick}
              isFullWidth
              marginBottom="spacing.5">
              Add Staff
            </Button>

            {loading ? (
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                paddingY="spacing.10">
                <Spinner size="large" accessibilityLabel="Loading staff" />
                <Text color="surface.text.gray.muted" marginTop="spacing.4">
                  Loading staff...
                </Text>
              </Box>
            ) : employees.length === 0 ? (
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                paddingY="spacing.10">
                <View style={styles.emptyIcon}>
                  <Icon name="users" size={32} color={colors.gray[400]} />
                </View>
                <Text
                  color="surface.text.gray.muted"
                  weight="medium"
                  marginTop="spacing.4">
                  No staff added yet.
                </Text>
              </Box>
            ) : (
              <Box>
                <StaffGroup
                  title="Monthly"
                  list={groupedEmployees.Monthly}
                  onSelect={handleStaffSelect}
                />
                <StaffGroup
                  title="Daily"
                  list={groupedEmployees.Daily}
                  onSelect={handleStaffSelect}
                />
                <StaffGroup
                  title="Hourly"
                  list={groupedEmployees.Hourly}
                  onSelect={handleStaffSelect}
                />
              </Box>
            )}
          </Box>
        )}

        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <AttendanceTab employees={employees} shifts={shifts} />
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <Card>
            <CardBody>
              <Text
                size="small"
                weight="semibold"
                color="surface.text.gray.muted"
                marginBottom="spacing.5">
                SETTINGS
              </Text>
              <FeatureRow
                icon="clock"
                text="Manage shift timings for your staff"
                onPress={() => navigation.navigate('ShiftList')}
              />
              <Box marginTop="spacing.4">
                <FeatureRow
                  icon="users"
                  text="Manage staff roles and permissions"
                  onPress={() => {}}
                />
              </Box>
              <Box marginTop="spacing.4">
                <FeatureRow
                  icon="bell"
                  text="Configure notification preferences"
                  onPress={() => {}}
                />
              </Box>
            </CardBody>
          </Card>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <NavItem
          icon="home"
          label="Home"
          active={activeTab === 'home'}
          onPress={() => setActiveTab('home')}
        />
        <NavItem
          icon="users"
          label="Staff"
          active={activeTab === 'staff'}
          onPress={() => setActiveTab('staff')}
        />
        <NavItem
          icon="calendar"
          label="Attendance"
          active={activeTab === 'attendance'}
          onPress={() => setActiveTab('attendance')}
        />
        <NavItem
          icon="dollar-sign"
          label="Payroll"
          active={activeTab === 'payroll'}
          onPress={handlePayrollClick}
        />
        <NavItem
          icon="settings"
          label="Settings"
          active={activeTab === 'settings'}
          onPress={() => setActiveTab('settings')}
        />
      </View>

      <StaffTypeModal
        isOpen={showStaffModal}
        onClose={() => setShowStaffModal(false)}
        onContinue={handleStaffTypeSelected}
      />
    </SafeAreaView>
  );
};

// Helper Components

interface StaffGroupProps {
  title: string;
  list: Employee[];
  onSelect: (employee: Employee) => void;
}

const StaffGroup = ({title, list, onSelect}: StaffGroupProps) => {
  if (list.length === 0) {
    return null;
  }
  return (
    <Box marginBottom="spacing.5">
      <Text
        size="small"
        color="surface.text.gray.muted"
        weight="medium"
        marginBottom="spacing.3">
        {title} ({list.length})
      </Text>
      {list.map(employee => (
        <Box key={employee.id} marginBottom="spacing.3">
          <StaffCard employee={employee} onPress={() => onSelect(employee)} />
        </Box>
      ))}
    </Box>
  );
};

interface StaffCardProps {
  employee: Employee;
  onPress?: () => void;
}

const getInitials = (name: string): string => {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const StaffCard = ({employee, onPress}: StaffCardProps) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
    <Card padding="spacing.4">
      <CardBody>
        <View style={styles.staffCardContent}>
          <View style={styles.avatar}>
            <Text
              size="small"
              weight="semibold"
              color="surface.text.gray.subtle">
              {getInitials(employee.fullName)}
            </Text>
          </View>
          <View style={styles.staffInfo}>
            <Text weight="semibold" truncateAfterLines={1}>
              {employee.fullName}
            </Text>
            <Text size="small" color="surface.text.gray.muted">
              Present
            </Text>
          </View>
          <Icon name="chevron-right" size={20} color={colors.gray[300]} />
        </View>
      </CardBody>
    </Card>
  </TouchableOpacity>
);

interface FeatureRowProps {
  icon: string;
  text: string;
  onPress: () => void;
  isNew?: boolean;
}

const FeatureRow = ({icon, text, onPress, isNew}: FeatureRowProps) => (
  <TouchableOpacity
    style={styles.featureRow}
    onPress={onPress}
    activeOpacity={0.7}>
    <View style={styles.featureIconContainer}>
      <Icon name={icon} size={24} color={colors.teal[600]} />
    </View>
    <View style={styles.featureTextContainer}>
      <View style={styles.featureTextRow}>
        <Text weight="medium">{text}</Text>
        {isNew && (
          <View style={styles.newBadge}>
            <Text
              size="xsmall"
              weight="semibold"
              color="surface.text.staticWhite.normal">
              NEW
            </Text>
          </View>
        )}
      </View>
    </View>
    <Icon name="chevron-right" size={20} color={colors.gray[300]} />
  </TouchableOpacity>
);

interface NavItemProps {
  icon: string;
  label: string;
  active?: boolean;
  onPress: () => void;
}

const NavItem = ({icon, label, active, onPress}: NavItemProps) => (
  <TouchableOpacity
    style={styles.navItem}
    onPress={onPress}
    activeOpacity={0.7}>
    <Icon
      name={icon}
      size={24}
      color={active ? colors.blue[600] : colors.gray[500]}
    />
    <Text
      size="xsmall"
      weight="medium"
      color={
        active ? 'interactive.text.primary.normal' : 'surface.text.gray.muted'
      }
      marginTop="spacing.1">
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  header: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  premiumCard: {
    backgroundColor: colors.blue[50],
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.blue[100],
  },
  premiumBadge: {
    position: 'absolute',
    top: 16,
    left: 0,
    backgroundColor: colors.amber[400],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    zIndex: 1,
  },
  premiumContent: {
    padding: 20,
    paddingTop: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  premiumTextContainer: {
    flex: 1,
    paddingRight: 16,
  },
  phoneGraphic: {
    width: 64,
    height: 96,
    backgroundColor: colors.teal[700],
    borderRadius: 12,
    borderWidth: 4,
    borderColor: colors.gray[800],
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{rotate: '6deg'}],
  },
  unlockButton: {
    backgroundColor: colors.black,
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  attendanceIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.teal[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  staffCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  staffInfo: {
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 8,
    marginHorizontal: -8,
    borderRadius: 12,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.teal[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  newBadge: {
    backgroundColor: colors.blue[600],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
});
