#!/bin/bash

# Migration script to add Payment schema to the database
# This script will generate and apply Prisma migrations

echo "🔄 Starting Payment schema migration..."

# Navigate to backend directory
cd "$(dirname "$0")"

# Generate Prisma migration
echo "📝 Generating Prisma migration..."
npx prisma migrate dev --name add_payment_model

# Generate Prisma Client
echo "🔨 Generating Prisma Client..."
npx prisma generate

echo "✅ Migration completed successfully!"
echo ""
echo "📊 Payment schema has been added with the following features:"
echo "  - Payment tracking for employees"
echo "  - Support for one-time, advance, and salary payments"
echo "  - Payment modes: Cash, UPI, Bank Transfer"
echo "  - Payment status tracking"
echo "  - Phone number field for UPI/Bank Transfer"
echo ""
echo "🚀 You can now restart your backend server to use the new Payment API"

