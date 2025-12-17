import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import {Employee} from '../types';

interface EmployeeDetailViewProps {
  employee: Employee;
  onBack: () => void;
}

type ViewMode = 'activity' | 'insights';

export const EmployeeDetailView: React.FC<EmployeeDetailViewProps> = ({
  employee,
  onBack,
}) => {
  const [mode, setMode] = useState<ViewMode>('activity');

  if (mode === 'insights') {
    return (
      <InsightsView employee={employee} onBack={() => setMode('activity')} />
    );
  }

  return (
    <ActivityView
      employee={employee}
      onBack={onBack}
      onOpenInsights={() => setMode('insights')}
    />
  );
};

// --- ACTIVITY VIEW ---

const ActivityView: React.FC<{
  employee: Employee;
  onBack: () => void;
  onOpenInsights: () => void;
}> = ({employee, onBack, onOpenInsights}) => {
  const today = '16 Dec 2025';
  const yesterday = '15 Dec 2025';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Regularization</Text>
          <Text style={styles.headerSubtitle}>
            {employee.fullName} | ID: {employee.companyId || '001'}
          </Text>
        </View>
        <View style={styles.dateChip}>
          <Text style={styles.dateChipText}>{today}</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Status Banner */}
        <View style={styles.statusBanner}>
          <Text style={styles.statusBannerText}>
            Full day <Text style={styles.statusDot}>●</Text> has been marked
          </Text>
        </View>

        {/* Dark Card */}
        <View style={styles.darkCardWrapper}>
          <View style={styles.darkCard}>
            <Text style={styles.darkCardTitle}>Working Hours</Text>

            {/* Digital Clock */}
            <View style={styles.clockContainer}>
              <ClockDigit value="08" label="Hour" />
              <Text style={styles.clockSeparator}>:</Text>
              <ClockDigit value="31" label="Min" />
              <Text style={styles.clockSeparator}>:</Text>
              <ClockDigit value="12" label="Sec" />
            </View>

            {/* Break Time */}
            <View style={styles.breakTimeChip}>
              <Text style={styles.breakTimeText}>Total Break Time 0h:00m</Text>
            </View>

            {/* Attendance & More Button */}
            <TouchableOpacity
              onPress={onOpenInsights}
              style={styles.attendanceButton}>
              <Text style={styles.attendanceButtonText}>
                Attendance & More →
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Activity Timeline */}
        <View style={styles.activitySection}>
          <View style={styles.activityHeader}>
            <Text style={styles.activityTitle}>Your Activity</Text>
            <TouchableOpacity style={styles.addPunchButton}>
              <Text style={styles.addPunchButtonText}>Add Punch</Text>
            </TouchableOpacity>
          </View>

          {/* Timeline Items */}
          <View style={styles.timelineContainer}>
            {/* Day 1 */}
            <Text style={styles.dayLabel}>{yesterday}</Text>
            <View style={styles.timelineGroup}>
              <TimelineItem type="in" label="Punch In" time="09:54 am" />
              <TimelineItem type="out" label="Punch Out" time="06:14 pm" />
            </View>

            {/* Day 2 */}
            <Text style={[styles.dayLabel, {marginTop: 24}]}>{today}</Text>
            <View style={styles.timelineGroup}>
              <TimelineItem type="in" label="Punch In" time="10:07 am" />
              <TimelineItem type="out" label="Punch Out" time="06:38 pm" />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const ClockDigit: React.FC<{value: string; label: string}> = ({
  value,
  label,
}) => (
  <View style={styles.clockDigitContainer}>
    <View style={styles.clockDigit}>
      <Text style={styles.clockDigitText}>{value}</Text>
    </View>
    <Text style={styles.clockDigitLabel}>{label}</Text>
  </View>
);

const TimelineItem: React.FC<{
  type: 'in' | 'out';
  label: string;
  time: string;
}> = ({type, label, time}) => (
  <View style={styles.timelineItem}>
    <View
      style={[
        styles.timelineIcon,
        type === 'in' ? styles.timelineIconIn : styles.timelineIconOut,
      ]}>
      <Text
        style={[
          styles.timelineIconText,
          type === 'in' ? {color: '#16A34A'} : {color: '#EF4444'},
        ]}>
        {type === 'in' ? '↓' : '↑'}
      </Text>
    </View>
    <Text style={styles.timelineLabel}>{label}</Text>
    <Text style={styles.timelineTime}>{time}</Text>
  </View>
);

// --- INSIGHTS VIEW ---

export const InsightsView: React.FC<{
  employee: Employee;
  onBack: () => void;
  hideHeader?: boolean;
}> = ({employee, onBack, hideHeader}) => {
  // Generate Month Days
  const days = Array.from({length: 31}, (_, i) => i + 1);

  // Mock status generator
  const getStatus = (day: number) => {
    if ([7, 14, 21, 28].includes(day)) {
      return 'week_off';
    } // Sundays
    if ([12, 13].includes(day)) {
      return 'half_day';
    }
    if ([16].includes(day)) {
      return 'holiday';
    }
    if ([25].includes(day)) {
      return 'absent';
    }
    if ([4].includes(day)) {
      return 'on_leave';
    }
    if (day > 16) {
      return 'future';
    }
    return 'present';
  };

  const statusColors: Record<string, {bg: string; text: string}> = {
    present: {bg: '#16A34A', text: '#FFFFFF'},
    week_off: {bg: '#E5E7EB', text: '#6B7280'},
    half_day: {bg: '#FEF3C7', text: '#92400E'},
    holiday: {bg: '#CFFAFE', text: '#0E7490'},
    absent: {bg: '#EF4444', text: '#FFFFFF'},
    on_leave: {bg: '#D8B4FE', text: '#581C87'},
    future: {bg: '#FFFFFF', text: '#D1D5DB'},
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      {!hideHeader && (
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Insights</Text>
        </View>
      )}

      <ScrollView style={styles.scrollView}>
        {/* Calendar Section */}
        <View style={styles.calendarSection}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity style={styles.calendarNav}>
              <Text style={styles.calendarNavText}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.calendarMonth}>December 2025</Text>
            <TouchableOpacity style={styles.calendarNav}>
              <Text style={styles.calendarNavText}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {days.map(day => {
              const status = getStatus(day);
              const colors = statusColors[status];
              return (
                <View
                  key={day}
                  style={[
                    styles.calendarDay,
                    {backgroundColor: colors.bg},
                    status === 'holiday' && styles.calendarDayHighlight,
                  ]}>
                  <Text style={[styles.calendarDayText, {color: colors.text}]}>
                    {day}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <LegendItem color="#D8B4FE" label="On Leave" />
            <LegendItem color="#16A34A" label="Present" />
            <LegendItem color="#EF4444" label="Absent" />
            <LegendItem color="#FEF3C7" label="Half Day" />
            <LegendItem color="#E5E7EB" label="Week Off" />
            <LegendItem color="#CFFAFE" label="Holiday" />
          </View>
        </View>

        <View style={styles.divider} />

        {/* More Details Grid */}
        <View style={styles.detailsSection}>
          <Text style={styles.detailsSectionTitle}>More Details</Text>

          <View style={styles.detailsGrid}>
            <DetailIcon label="Basic Details" icon="👤" />
            <DetailIcon label="Manage Leave" icon="📋" />
            <DetailIcon label="Manage Shift" icon="🕐" />
            <DetailIcon label="Loan & Advances" icon="💰" />
            <DetailIcon label="Document Library" icon="📄" />
            <DetailIcon label="Perk & Penalties" icon="⚠️" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const LegendItem: React.FC<{color: string; label: string}> = ({
  color,
  label,
}) => (
  <View style={styles.legendItem}>
    <View style={[styles.legendDot, {backgroundColor: color}]} />
    <Text style={styles.legendLabel}>{label}</Text>
  </View>
);

const DetailIcon: React.FC<{label: string; icon: string}> = ({label, icon}) => (
  <TouchableOpacity style={styles.detailIconContainer}>
    <View style={styles.detailIconCircle}>
      <Text style={styles.detailIconEmoji}>{icon}</Text>
    </View>
    <Text style={styles.detailIconLabel}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#111827',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  dateChip: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  dateChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  statusBanner: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  statusBannerText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  statusDot: {
    color: '#3B82F6',
    fontWeight: '700',
  },
  darkCardWrapper: {
    padding: 16,
  },
  darkCard: {
    backgroundColor: '#0B1120',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  darkCardTitle: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 16,
  },
  clockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  clockDigitContainer: {
    alignItems: 'center',
  },
  clockDigit: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clockDigitText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  clockDigitLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 8,
  },
  clockSeparator: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginHorizontal: 8,
    marginBottom: 24,
  },
  breakTimeChip: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginTop: 16,
    marginBottom: 24,
  },
  breakTimeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FDE68A',
  },
  attendanceButton: {
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingTop: 16,
    width: '100%',
    alignItems: 'center',
  },
  attendanceButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  activitySection: {
    paddingHorizontal: 16,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  addPunchButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  addPunchButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  timelineContainer: {
    marginBottom: 100,
  },
  dayLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
    marginBottom: 16,
  },
  timelineGroup: {
    paddingLeft: 16,
    borderLeftWidth: 2,
    borderLeftColor: '#E5E7EB',
    borderStyle: 'dashed',
    marginLeft: 8,
    gap: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  timelineIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -28,
    marginRight: 12,
  },
  timelineIconIn: {
    backgroundColor: '#DCFCE7',
  },
  timelineIconOut: {
    backgroundColor: '#FEE2E2',
  },
  timelineIconText: {
    fontSize: 18,
  },
  timelineLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  timelineTime: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#3B82F6',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  calendarSection: {
    padding: 16,
    paddingTop: 24,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  calendarNav: {
    padding: 4,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 20,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarNavText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },
  calendarMonth: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  calendarDay: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarDayHighlight: {
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  calendarDayText: {
    fontSize: 14,
    fontWeight: '500',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    rowGap: 12,
    paddingHorizontal: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '30%',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4B5563',
  },
  divider: {
    height: 8,
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
    marginVertical: 24,
  },
  detailsSection: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  detailsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 24,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  detailIconContainer: {
    alignItems: 'center',
    width: '22%',
  },
  detailIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  detailIconEmoji: {
    fontSize: 24,
  },
  detailIconLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
    height: 32,
  },
});
