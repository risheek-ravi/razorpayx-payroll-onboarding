# Employee Business Association Fix

## Issue Description

Employees are being added to different businesses, but when viewing the Dashboard, employees from ALL businesses are shown instead of only the employees belonging to the current business.

## Root Cause

The `getEmployees()` function in `dbService.ts` accepts an optional `businessId` parameter to filter employees by business. However, in multiple places throughout the app, this function is being called **without passing the businessId**, causing all employees to be fetched regardless of which business the user is viewing.

### Affected Files:

1. **src/screens/DashboardScreen.tsx** (Line 47)

   - Calls `getEmployees()` without businessId
   - Should pass `businessId` from route params

2. **src/screens/FinalizePayrollScreen.tsx** (Line 126)

   - Calls `getEmployees()` without businessId
   - Should pass `businessId` from business details

3. **src/screens/AssignShiftScreen.tsx** (Line 42)
   - Calls `getEmployees()` without businessId
   - Should pass `businessId` from shift data or route params

## Backend Implementation (Already Correct)

The backend correctly implements filtering by businessId:

```typescript
// backend/src/routes/employee.ts (Line 78-79)
const employees = await prisma.employee.findMany({
  where: businessId ? {businessId: String(businessId)} : undefined,
  orderBy: {createdAt: 'desc'},
});
```

## Required Fixes

### 1. Fix DashboardScreen.tsx

**Current Code (Lines 43-57):**

```typescript
const loadData = useCallback(async () => {
  setLoading(true);
  try {
    const [empData, shiftData] = await Promise.all([
      getEmployees(), // ❌ Missing businessId
      getShifts(),
    ]);
    setEmployees(empData);
    setShifts(shiftData);
  } catch (e) {
    console.error(e);
  } finally {
    setLoading(false);
  }
}, []); // ❌ Missing businessId dependency
```

**Fixed Code:**

```typescript
const loadData = useCallback(async () => {
  setLoading(true);
  try {
    const [empData, shiftData] = await Promise.all([
      getEmployees(businessId), // ✅ Pass businessId
      getShifts(),
    ]);
    setEmployees(empData);
    setShifts(shiftData);
  } catch (e) {
    console.error(e);
  } finally {
    setLoading(false);
  }
}, [businessId]); // ✅ Add businessId dependency
```

### 2. Fix FinalizePayrollScreen.tsx

**Current Code (Lines 124-129):**

```typescript
const init = async () => {
  try {
    const empData = await getEmployees();  // ❌ Missing businessId
    const bizData = await getLatestBusinessDetails();
    setEmployees(empData);
    setBusinessDetails(bizData);
```

**Fixed Code:**

```typescript
const init = async () => {
  try {
    const bizData = await getLatestBusinessDetails();
    const empData = await getEmployees(bizData?.id);  // ✅ Pass businessId
    setEmployees(empData);
    setBusinessDetails(bizData);
```

### 3. Fix AssignShiftScreen.tsx

**Current Code (Lines 40-57):**

```typescript
const loadEmployees = useCallback(async () => {
  try {
    const data = await getEmployees();  // ❌ Missing businessId
    setEmployees(data);
```

**Fixed Code:**
This screen needs additional investigation to determine where to get the businessId from. Options:

- Add businessId to route params when navigating to this screen
- Get businessId from the shift data if available
- Fetch latest business details first

**Recommended approach:**

```typescript
const loadEmployees = useCallback(async () => {
  try {
    // Get business details first
    const bizData = await getLatestBusinessDetails();
    const data = await getEmployees(bizData?.id);  // ✅ Pass businessId
    setEmployees(data);
```

## Testing Steps

After applying these fixes:

1. **Create Multiple Businesses:**

   - Register Business A
   - Add Employee 1 to Business A
   - Register Business B
   - Add Employee 2 to Business B

2. **Verify Isolation:**

   - Navigate to Business A Dashboard
   - Verify only Employee 1 is shown
   - Navigate to Business B Dashboard
   - Verify only Employee 2 is shown

3. **Test Other Screens:**
   - Test Finalize Payroll screen shows only current business employees
   - Test Assign Shift screen shows only current business employees

## Implementation Priority

1. **High Priority:** DashboardScreen.tsx - Most visible to users
2. **High Priority:** FinalizePayrollScreen.tsx - Critical for payroll operations
3. **Medium Priority:** AssignShiftScreen.tsx - Important for shift management

## Additional Recommendations

1. **Add TypeScript Strictness:**

   - Make `businessId` a required parameter in `getEmployees()` to prevent this issue in the future
   - Update the function signature: `getEmployees(businessId: string): Promise<Employee[]>`

2. **Add Validation:**

   - Add checks to ensure businessId is always available before fetching employees
   - Show appropriate error messages if businessId is missing

3. **Consistent Pattern:**
   - Establish a pattern where businessId is always passed through route params or fetched from business details
   - Document this pattern for future development
