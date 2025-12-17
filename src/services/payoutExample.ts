/**
 * Example usage of Razorpay Payout API
 * 
 * This file demonstrates how to use the payout functions created in dbService.ts
 */

import {createUPIPayout, createBankPayout} from './dbService';

// Your Razorpay credentials
const RAZORPAY_API_KEY = 'rzp_live_Rsfw3YyUA3HgRo';
const RAZORPAY_API_SECRET = 'YOUR_SECRET_KEY'; // Replace with your actual secret

/**
 * Example: Create a UPI payout
 */
export const exampleUPIPayout = async () => {
  try {
    const response = await createUPIPayout(
      RAZORPAY_API_KEY,
      RAZORPAY_API_SECRET,
      {
        accountNumber: '7878780080316316', // Your Razorpay account number
        amount: 1000, // Amount in INR (will be converted to paise automatically)
        upiId: '9876543210@paytm', // Employee's UPI ID
        accountHolderName: 'Gaurav Kumar',
        contactName: 'Gaurav Kumar',
        contactEmail: 'gaurav.kumar@example.com',
        contactPhone: '9000090000',
        referenceId: 'Acme Transaction ID 12345',
        narration: 'Acme Corp Fund Transfer',
        notes: {
          notes_key_1: 'Beam me up Scotty',
          notes_key_2: 'Engage',
        },
      },
    );

    console.log('Payout successful:', response);
    return response;
  } catch (error) {
    console.error('Payout failed:', error);
    throw error;
  }
};

/**
 * Example: Create a Bank Transfer payout
 */
export const exampleBankPayout = async () => {
  try {
    const response = await createBankPayout(
      RAZORPAY_API_KEY,
      RAZORPAY_API_SECRET,
      {
        accountNumber: '7878780080316316', // Your Razorpay account number
        amount: 5000, // Amount in INR
        beneficiaryName: 'John Doe',
        beneficiaryAccountNumber: '1234567890123456',
        ifscCode: 'HDFC0000123',
        contactName: 'John Doe',
        contactEmail: 'john.doe@example.com',
        contactPhone: '9876543210',
        mode: 'IMPS', // or 'NEFT' or 'RTGS'
        referenceId: 'SALARY-001',
        narration: 'Salary Payment - January 2024',
        notes: {
          employee_id: 'EMP001',
          month: 'January',
        },
      },
    );

    console.log('Bank payout successful:', response);
    return response;
  } catch (error) {
    console.error('Bank payout failed:', error);
    throw error;
  }
};

/**
 * Example: Process payroll payouts for multiple employees
 */
export const processPayrollPayouts = async (employees: Array<{
  id: string;
  name: string;
  email: string;
  phone: string;
  amount: number;
  paymentMode: 'UPI' | 'Bank';
  upiId?: string;
  accountNumber?: string;
  ifscCode?: string;
}>) => {
  const results = [];

  for (const employee of employees) {
    try {
      let response;

      if (employee.paymentMode === 'UPI' && employee.upiId) {
        response = await createUPIPayout(
          RAZORPAY_API_KEY,
          RAZORPAY_API_SECRET,
          {
            accountNumber: '7878780080316316',
            amount: employee.amount,
            upiId: employee.upiId,
            accountHolderName: employee.name,
            contactName: employee.name,
            contactEmail: employee.email,
            contactPhone: employee.phone,
            referenceId: `PAYROLL-${employee.id}`,
            narration: 'Salary Payment',
            notes: {
              employee_id: employee.id,
            },
          },
        );
      } else if (
        employee.paymentMode === 'Bank' &&
        employee.accountNumber &&
        employee.ifscCode
      ) {
        response = await createBankPayout(
          RAZORPAY_API_KEY,
          RAZORPAY_API_SECRET,
          {
            accountNumber: '7878780080316316',
            amount: employee.amount,
            beneficiaryName: employee.name,
            beneficiaryAccountNumber: employee.accountNumber,
            ifscCode: employee.ifscCode,
            contactName: employee.name,
            contactEmail: employee.email,
            contactPhone: employee.phone,
            mode: 'IMPS',
            referenceId: `PAYROLL-${employee.id}`,
            narration: 'Salary Payment',
            notes: {
              employee_id: employee.id,
            },
          },
        );
      } else {
        throw new Error('Invalid payment details');
      }

      results.push({
        employeeId: employee.id,
        status: 'success',
        payoutId: response.id,
        response,
      });
    } catch (error) {
      results.push({
        employeeId: employee.id,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return results;
};

