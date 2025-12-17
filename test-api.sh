#!/bin/bash

# API Endpoint Testing Script
# Tests all endpoints of the Railway-deployed backend

API_BASE="https://laudable-sparkle-production-8104.up.railway.app"

echo "🧪 Testing RazorpayX Payroll API"
echo "================================"
echo ""
echo "API Base: $API_BASE"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo "1️⃣  Testing Health Endpoint..."
HEALTH_RESPONSE=$(curl -s "$API_BASE/health")
if echo "$HEALTH_RESPONSE" | grep -q '"status":"ok"'; then
    echo -e "${GREEN}✅ Health check passed${NC}"
    echo "   Response: $HEALTH_RESPONSE"
else
    echo -e "${RED}❌ Health check failed${NC}"
    echo "   Response: $HEALTH_RESPONSE"
fi
echo ""

# Test 2: Create Business
echo "2️⃣  Testing Create Business..."
BUSINESS_RESPONSE=$(curl -s -X POST "$API_BASE/api/v1/businesses" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "businessName": "Test Company Ltd",
    "businessEmail": "test'$(date +%s)'@testcompany.com"
  }')

if echo "$BUSINESS_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Create business passed${NC}"
    BUSINESS_ID=$(echo "$BUSINESS_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo "   Business ID: $BUSINESS_ID"
else
    echo -e "${RED}❌ Create business failed${NC}"
    echo "   Response: $BUSINESS_RESPONSE"
fi
echo ""

# Test 3: Get Latest Business
echo "3️⃣  Testing Get Latest Business..."
LATEST_RESPONSE=$(curl -s "$API_BASE/api/v1/businesses/latest/one")
if echo "$LATEST_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Get latest business passed${NC}"
else
    echo -e "${RED}❌ Get latest business failed${NC}"
    echo "   Response: $LATEST_RESPONSE"
fi
echo ""

# Test 4: Create Employee (if we have a business ID)
if [ ! -z "$BUSINESS_ID" ]; then
    echo "4️⃣  Testing Create Employee..."
    EMPLOYEE_RESPONSE=$(curl -s -X POST "$API_BASE/api/v1/employees" \
      -H "Content-Type: application/json" \
      -d '{
        "type": "full_time",
        "fullName": "John Doe",
        "companyId": "EMP001",
        "phoneNumber": "+919876543210",
        "dob": "1990-01-01",
        "gender": "male",
        "salaryCycleDate": 1,
        "salaryAccess": "full",
        "wageType": "Monthly",
        "salaryAmount": "50000",
        "weeklyOffs": "[]",
        "businessId": "'$BUSINESS_ID'"
      }')
    
    if echo "$EMPLOYEE_RESPONSE" | grep -q '"success":true'; then
        echo -e "${GREEN}✅ Create employee passed${NC}"
        EMPLOYEE_ID=$(echo "$EMPLOYEE_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
        echo "   Employee ID: $EMPLOYEE_ID"
    else
        echo -e "${RED}❌ Create employee failed${NC}"
        echo "   Response: $EMPLOYEE_RESPONSE"
    fi
    echo ""
fi

# Test 5: List Employees
echo "5️⃣  Testing List Employees..."
EMPLOYEES_RESPONSE=$(curl -s "$API_BASE/api/v1/employees")
if echo "$EMPLOYEES_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ List employees passed${NC}"
    EMPLOYEE_COUNT=$(echo "$EMPLOYEES_RESPONSE" | grep -o '"id"' | wc -l)
    echo "   Found $EMPLOYEE_COUNT employee(s)"
else
    echo -e "${RED}❌ List employees failed${NC}"
    echo "   Response: $EMPLOYEES_RESPONSE"
fi
echo ""

# Test 6: Create Shift
echo "6️⃣  Testing Create Shift..."
SHIFT_RESPONSE=$(curl -s -X POST "$API_BASE/api/v1/shifts" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Morning Shift",
    "type": "fixed",
    "startTime": "09:00",
    "endTime": "18:00",
    "breakMinutes": 60
  }')

if echo "$SHIFT_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Create shift passed${NC}"
    SHIFT_ID=$(echo "$SHIFT_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo "   Shift ID: $SHIFT_ID"
else
    echo -e "${RED}❌ Create shift failed${NC}"
    echo "   Response: $SHIFT_RESPONSE"
fi
echo ""

# Test 7: List Shifts
echo "7️⃣  Testing List Shifts..."
SHIFTS_RESPONSE=$(curl -s "$API_BASE/api/v1/shifts")
if echo "$SHIFTS_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ List shifts passed${NC}"
    SHIFT_COUNT=$(echo "$SHIFTS_RESPONSE" | grep -o '"id"' | wc -l)
    echo "   Found $SHIFT_COUNT shift(s)"
else
    echo -e "${RED}❌ List shifts failed${NC}"
    echo "   Response: $SHIFTS_RESPONSE"
fi
echo ""

# Summary
echo "================================"
echo "🎉 API Testing Complete!"
echo ""
echo -e "${YELLOW}Note: Wait 1-2 minutes after deployment before running this test${NC}"
echo ""
echo "To run this test again:"
echo "  bash test-api.sh"

