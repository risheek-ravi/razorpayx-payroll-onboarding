import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useFocusEffect} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import {StaffTypeModal} from '../components/StaffTypeModal';
import {colors} from '../theme/colors';
import {RootStackParamList, StaffType, Employee} from '../types';
import {logStaffSelection, getEmployees} from '../services/dbService';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

type Tab = 'home' | 'staff' | 'attendance' | 'settings';

export const DashboardScreen = ({navigation, route}: Props) => {
  const {businessName, businessId} = route.params;
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Reload employees when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadEmployees();
    }, [loadEmployees]),
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
    Hourly: employees.filter(e => e.wageType === 'Per Hour Basis'),
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.businessName} numberOfLines={1}>
            {businessName}
          </Text>
          <Icon name="chevron-down" size={20} color={colors.gray[500]} />
        </View>
        <TouchableOpacity style={styles.helpButton}>
          <Text style={styles.helpText}>Help</Text>
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
          <View>
            {/* Quick Actions Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Quick Actions</Text>
              <View style={styles.featuresContainer}>
                <FeatureRow
                  icon="hand"
                  text="Mark daily attendance of your staff"
                  onPress={() => setActiveTab('attendance')}
                />
                <FeatureRow
                  icon="calculator"
                  text="Auto salary calculation based on attendance"
                  onPress={() => {}}
                />
                <FeatureRow
                  icon="file-text"
                  text="Send salary slips via whatsapp & sms"
                  onPress={() => {}}
                />
              </View>

              <TouchableOpacity
                style={styles.addStaffButton}
                onPress={handleAddStaffClick}
                activeOpacity={0.8}>
                <Icon name="user-plus" size={20} color={colors.white} />
                <Text style={styles.addStaffButtonText}>Add Staff</Text>
              </TouchableOpacity>
            </View>

            {/* Premium Card */}
            <View style={styles.premiumCard}>
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumBadgeText}>
                  RazorpayX Payroll Premium
                </Text>
              </View>

              <View style={styles.premiumContent}>
                <View style={styles.premiumTextContainer}>
                  <Text style={styles.premiumTitle}>
                    Ask staff to mark selfie attendance
                  </Text>
                </View>
                <View style={styles.phoneGraphic}>
                  <Icon name="smartphone" size={32} color={colors.white} />
                </View>
              </View>

              <TouchableOpacity
                style={styles.unlockButton}
                activeOpacity={0.8}>
                <Text style={styles.unlockButtonText}>
                  Unlock RazorpayX Payroll Premium
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Staff Tab */}
        {activeTab === 'staff' && (
          <View>
            <TouchableOpacity
              style={styles.addStaffButtonAlt}
              onPress={handleAddStaffClick}
              activeOpacity={0.8}>
              <Icon name="user-plus" size={20} color={colors.white} />
              <Text style={styles.addStaffButtonText}>Add Staff</Text>
            </TouchableOpacity>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.blue[600]} />
                <Text style={styles.loadingText}>Loading staff...</Text>
              </View>
            ) : employees.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIcon}>
                  <Icon name="users" size={32} color={colors.gray[400]} />
                </View>
                <Text style={styles.emptyText}>No staff added yet.</Text>
              </View>
            ) : (
              <View style={styles.staffListContainer}>
                <StaffGroup title="Monthly" list={groupedEmployees.Monthly} />
                <StaffGroup title="Daily" list={groupedEmployees.Daily} />
                <StaffGroup title="Hourly" list={groupedEmployees.Hourly} />
              </View>
            )}
          </View>
        )}

        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <View style={styles.card}>
            <View style={styles.attendanceIconContainer}>
              <Icon name="calendar" size={32} color={colors.teal[600]} />
            </View>
            <Text style={styles.attendanceTitle}>Attendance</Text>
            <Text style={styles.attendanceSubtitle}>
              Mark attendance for your {employees.length} employees here.
            </Text>
            <TouchableOpacity
              style={styles.markAttendanceButton}
              activeOpacity={0.8}>
              <Text style={styles.markAttendanceButtonText}>
                Mark Today's Attendance
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <View style={styles.placeholderContainer}>
            <Icon name="settings" size={48} color={colors.gray[300]} />
            <Text style={styles.placeholderText}>Settings coming soon</Text>
          </View>
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
}

const StaffGroup = ({title, list}: StaffGroupProps) => {
  if (list.length === 0) {
    return null;
  }
  return (
    <View style={styles.staffGroup}>
      <Text style={styles.staffGroupTitle}>
        {title} ({list.length})
      </Text>
      {list.map(employee => (
        <StaffCard key={employee.id} employee={employee} />
      ))}
    </View>
  );
};

interface StaffCardProps {
  employee: Employee;
}

const StaffCard = ({employee}: StaffCardProps) => (
  <View style={styles.staffCard}>
    <View style={styles.staffAvatar}>
      <Icon name="user" size={24} color={colors.gray[400]} />
    </View>
    <View style={styles.staffInfo}>
      <Text style={styles.staffName} numberOfLines={1}>
        {employee.fullName}
      </Text>
      <Text style={styles.staffStatus}>Present</Text>
    </View>
  </View>
);

interface FeatureRowProps {
  icon: string;
  text: string;
  onPress: () => void;
}

const FeatureRow = ({icon, text, onPress}: FeatureRowProps) => (
  <TouchableOpacity
    style={styles.featureRow}
    onPress={onPress}
    activeOpacity={0.7}>
    <View style={styles.featureIconContainer}>
      <Icon name={icon as any} size={24} color={colors.teal[600]} />
    </View>
    <Text style={styles.featureText}>{text}</Text>
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
      name={icon as any}
      size={24}
      color={active ? colors.blue[600] : colors.gray[500]}
    />
    <Text style={[styles.navLabel, active && styles.navLabelActive]}>
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
  businessName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray[900],
    maxWidth: 200,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  helpText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.blue[600],
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.gray[400],
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  featuresContainer: {
    gap: 16,
    marginBottom: 24,
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
  featureText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: colors.gray[800],
  },
  addStaffButton: {
    backgroundColor: colors.blue[600],
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addStaffButtonAlt: {
    backgroundColor: colors.blue[600],
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  addStaffButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
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
  premiumBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.black,
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
  premiumTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray[900],
    lineHeight: 24,
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
  unlockButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.gray[400],
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.gray[500],
  },
  staffListContainer: {
    gap: 16,
  },
  staffGroup: {
    gap: 12,
  },
  staffGroupTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[500],
  },
  staffCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.gray[100],
  },
  staffAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.gray[900],
  },
  staffStatus: {
    fontSize: 12,
    color: colors.gray[400],
  },
  attendanceIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.teal[50],
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  attendanceTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray[900],
    textAlign: 'center',
    marginBottom: 8,
  },
  attendanceSubtitle: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
    marginBottom: 24,
  },
  markAttendanceButton: {
    backgroundColor: colors.teal[600],
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  markAttendanceButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  placeholderContainer: {
    paddingVertical: 64,
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 14,
    color: colors.gray[400],
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
  navLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.gray[500],
    marginTop: 4,
  },
  navLabelActive: {
    color: colors.blue[600],
  },
});

