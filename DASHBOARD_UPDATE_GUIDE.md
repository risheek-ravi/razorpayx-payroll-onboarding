# Dashboard Update Guide - Add Load Wallet Button

## Quick Reference

You need to manually add the Load Wallet button to the DashboardScreen. Here's exactly what to do:

---

## Step 1: Add Navigation Handler

**File**: `src/screens/DashboardScreen.tsx`  
**Location**: After line 94 (after `handlePayrollClick` function)

Add this code:

```typescript
// Navigate to load wallet
const handleLoadWalletClick = () => {
  navigation.navigate('LoadWallet');
};
```

**Full context** (lines 91-100 should look like this):

```typescript
  // Navigate to finalize payroll
  const handlePayrollClick = () => {
    navigation.navigate('FinalizePayroll');
  };

  // Navigate to load wallet
  const handleLoadWalletClick = () => {
    navigation.navigate('LoadWallet');
  };

  return (
```

---

## Step 2: Add Load Wallet Button to UI

**File**: `src/screens/DashboardScreen.tsx`  
**Location**: Around line 152, inside the Quick Actions Card

Add this code block **between** the "Send salary slips" button and the "Finalize & Execute Payroll" button:

```typescript
<Box marginTop="spacing.4">
  <FeatureRow
    icon="dollar-sign"
    text="Load Wallet"
    onPress={handleLoadWalletClick}
  />
</Box>
```

**Full context** (lines 145-170 should look like this):

```typescript
                  <Box marginTop="spacing.4">
                    <FeatureRow
                      icon="file-text"
                      text="Send salary slips via whatsapp & sms"
                      onPress={() => {}}
                    />
                  </Box>
                  <Box marginTop="spacing.4">
                    <FeatureRow
                      icon="dollar-sign"
                      text="Load Wallet"
                      onPress={handleLoadWalletClick}
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
```

---

## Verification

After making these changes:

1. **No TypeScript errors** should appear
2. **The Load Wallet button** should appear in the Quick Actions section
3. **Clicking the button** should navigate to the Load Wallet screen
4. **The back button** on Load Wallet screen should return to Dashboard

---

## Visual Result

The Quick Actions section will show these buttons in order:

1. ✅ Mark daily attendance of your staff
2. ✅ Auto salary calculation based on attendance  
3. ✅ Send salary slips via whatsapp & sms
4. **💵 Load Wallet** ← NEW
5. ✅ Finalize & Execute Payroll (NEW badge)

---

## Troubleshooting

### Error: "Cannot find name 'handleLoadWalletClick'"
- **Solution**: Make sure you added Step 1 (the handler function)

### Error: "Property 'LoadWallet' does not exist on type..."
- **Solution**: The types.ts file should already be updated. If not, add `LoadWallet: undefined;` to RootStackParamList

### Button doesn't navigate
- **Solution**: Check that AppNavigator.tsx has the LoadWallet screen registered

### Button doesn't appear
- **Solution**: Make sure you added Step 2 (the UI code) in the correct location

---

## Alternative: Copy-Paste Ready Code

If you prefer, here's the complete section you can copy-paste (replace lines 132-160):

```typescript
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
                      icon="dollar-sign"
                      text="Load Wallet"
                      onPress={handleLoadWalletClick}
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
```

---

**That's it! The Load Wallet feature should now be fully functional. 🎉**

