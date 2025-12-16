# RazorpayX Payroll - React Native Android App

A React Native Android application for managing payroll onboarding, employee management, and salary configuration.

## Features

- **Business Details Management**: Register business information including name and email
- **Salary Configuration**: Configure salary calculation methods (calendar month, fixed 30 days, exclude weekly offs)
- **Shift Hours**: Set working hours per shift
- **Employee Onboarding**: Add full-time and contract employees
- **Salary Setup**: Configure wage types (Monthly, Daily, Hourly)
- **Weekly Off Management**: Set weekly off days for employees
- **Dashboard**: View and manage all employees with navigation tabs

## Tech Stack

- **React Native** 0.73.2
- **React Navigation** 6.x (Native Stack)
- **TypeScript**
- **AsyncStorage** for local data persistence
- **React Native Vector Icons** (Feather icons)

## Project Structure

```
├── android/                  # Android native code
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── CycleDateModal.tsx
│   │   ├── InputField.tsx
│   │   ├── StaffTypeModal.tsx
│   │   ├── TimePicker.tsx
│   │   └── WelcomeFlash.tsx
│   ├── navigation/          # Navigation configuration
│   │   └── AppNavigator.tsx
│   ├── screens/             # Screen components
│   │   ├── AddGeneralInfoScreen.tsx
│   │   ├── AddSalaryScreen.tsx
│   │   ├── AddStaffScreen.tsx
│   │   ├── BusinessDetailsScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   └── SalaryScreen.tsx
│   ├── services/            # Data services
│   │   └── dbService.ts
│   ├── theme/               # Theme configuration
│   │   └── colors.ts
│   └── types.ts             # TypeScript type definitions
├── App.tsx                  # Root component
├── index.js                 # Entry point
└── package.json
```

## Prerequisites

- Node.js >= 18
- Java Development Kit (JDK) 17
- Android Studio with Android SDK
- Android SDK Build Tools 34.0.0
- Android SDK Platform 34

## Installation

1. **Clone the repository**
   ```bash
   cd razorpayx-payroll-onboarding
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Install native dependencies** (if using CocoaPods for iOS later)
   ```bash
   cd ios && pod install && cd ..
   ```

## Running the App

### Android

1. **Start Metro bundler**
   ```bash
   npm start
   # or
   yarn start
   ```

2. **Run on Android device/emulator**
   ```bash
   npm run android
   # or
   yarn android
   ```

   Make sure you have an Android emulator running or a physical device connected with USB debugging enabled.

### Building Release APK

```bash
cd android
./gradlew assembleRelease
```

The APK will be available at `android/app/build/outputs/apk/release/app-release.apk`

## App Flow

1. **Business Details** → Enter business name, owner name, and email
2. **Salary Configuration** → Choose salary calculation method and set shift hours
3. **Dashboard** → Main screen with tabs (Home, Staff, Attendance, Settings)
4. **Add Staff** → Select staff type (Full-time/Contract), enter employee details
5. **Add Salary** → Configure wage type and salary amount
6. **General Info** → Set weekly off days

## Data Storage

The app uses AsyncStorage for local data persistence:
- Business details stored with key `razorpayx_payroll_db`
- Employee data stored with key `razorpayx_payroll_staff_db`

## Color Theme

The app uses a custom color palette defined in `src/theme/colors.ts`:
- **Primary**: Blue (#2563EB)
- **Accent**: Teal (#0D9488)
- **Background**: White/Gray variants
- **Text**: Gray scale

## License

Private - Razorpay
