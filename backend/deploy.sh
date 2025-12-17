#!/bin/bash

# RazorpayX Payroll Backend - Vercel Deployment Script
# This script helps you deploy the backend to Vercel

set -e

echo "🚀 RazorpayX Payroll Backend - Vercel Deployment"
echo "================================================"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed."
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
    echo "✅ Vercel CLI installed successfully!"
    echo ""
fi

# Check if user is logged in
echo "🔐 Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    echo "Please login to Vercel:"
    vercel login
    echo ""
fi

# Check if DATABASE_URL is set
echo "🔍 Checking for DATABASE_URL..."
if [ -f .env ]; then
    if grep -q "DATABASE_URL" .env; then
        echo "✅ DATABASE_URL found in .env"
    else
        echo "⚠️  DATABASE_URL not found in .env"
        echo "You'll need to set it in Vercel after deployment"
    fi
else
    echo "⚠️  No .env file found"
    echo "You'll need to set DATABASE_URL in Vercel after deployment"
fi
echo ""

# Ask for deployment type
echo "Select deployment type:"
echo "1) Preview deployment (test before production)"
echo "2) Production deployment"
read -p "Enter choice (1 or 2): " choice
echo ""

case $choice in
    1)
        echo "🔨 Deploying to preview..."
        vercel
        ;;
    2)
        echo "🚀 Deploying to production..."
        vercel --prod
        ;;
    *)
        echo "❌ Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Set DATABASE_URL environment variable in Vercel dashboard"
echo "2. Test the health endpoint: curl https://your-project.vercel.app/health"
echo "3. Update your frontend with the production URL"
echo ""
echo "📚 For detailed instructions, see DEPLOYMENT.md"

