import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ActivityIndicator, View, StyleSheet} from 'react-native';
import {RootStackParamList} from '../types';
import {useAuth} from '../context/AuthContext';
import {colors} from '../theme/colors';

import {BusinessDetailsScreen} from '../screens/BusinessDetailsScreen';
import {SalaryScreen} from '../screens/SalaryScreen';
import {DashboardScreen} from '../screens/DashboardScreen';
import {AddStaffScreen} from '../screens/AddStaffScreen';
import {AddSalaryScreen} from '../screens/AddSalaryScreen';
import {AddGeneralInfoScreen} from '../screens/AddGeneralInfoScreen';
import {ShiftListScreen} from '../screens/ShiftListScreen';
import {AddFixedShiftScreen} from '../screens/AddFixedShiftScreen';
import {AssignShiftScreen} from '../screens/AssignShiftScreen';
import {UsageSelectionScreen} from '../screens/UsageSelectionScreen';
import {StaffProfileScreen} from '../screens/StaffProfileScreen';
import {FinalizePayrollScreen} from '../screens/FinalizePayrollScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      animation: 'slide_from_right',
    }}>
    <Stack.Screen name="BusinessDetails" component={BusinessDetailsScreen} />
    <Stack.Screen name="SalaryCalculation" component={SalaryScreen} />
    <Stack.Screen name="UsageSelection" component={UsageSelectionScreen} />
  </Stack.Navigator>
);

// Main stack - for authenticated users
const MainStack = () => {
  const {business} = useAuth();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        initialParams={{
          businessName: business?.businessName || '',
          businessId: business?.id || '',
        }}
      />
      <Stack.Screen name="AddStaff" component={AddStaffScreen} />
      <Stack.Screen name="AddSalary" component={AddSalaryScreen} />
      <Stack.Screen name="AddGeneralInfo" component={AddGeneralInfoScreen} />
      {/* Shift Management Screens */}
      <Stack.Screen name="ShiftList" component={ShiftListScreen} />
      <Stack.Screen name="AddFixedShift" component={AddFixedShiftScreen} />
      <Stack.Screen name="AssignShift" component={AssignShiftScreen} />
      {/* Staff & Payroll Screens */}
      <Stack.Screen name="StaffProfile" component={StaffProfileScreen} />
      <Stack.Screen name="FinalizePayroll" component={FinalizePayrollScreen} />
      <Stack.Screen name="UsageSelection" component={UsageSelectionScreen} />
      {/* Allow navigating back to these if needed */}
      <Stack.Screen name="BusinessDetails" component={BusinessDetailsScreen} />
      <Stack.Screen name="SalaryCalculation" component={SalaryScreen} />
    </Stack.Navigator>
  );
};

// Loading screen while checking auth state
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={colors.blue[600]} />
  </View>
);

export const AppNavigator = () => {
  const {isLoading, isLoggedIn} = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {isLoggedIn ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
});
