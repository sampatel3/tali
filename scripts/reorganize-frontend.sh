#!/bin/bash

# Frontend Feature Reorganization Script

echo "🔄 Reorganizing frontend into feature modules..."

cd /home/user/tali/frontend/src

# Create feature directories
mkdir -p features/{auth,transactions,subscriptions,statements,loyalty,analytics,dashboard,settings}/{pages,components,hooks,services}
mkdir -p shared/{components,hooks,utils,services}

# Move AUTH feature files
echo "📁 Moving AUTH files..."
mv pages/Onboarding.jsx features/auth/pages/Onboarding.jsx 2>/dev/null || true
mv pages/UAEPassCallback.jsx features/auth/pages/UAEPassCallback.jsx 2>/dev/null || true

# Move TRANSACTIONS feature files
echo "📁 Moving TRANSACTIONS files..."
mv pages/Transactions.jsx features/transactions/pages/Transactions.jsx 2>/dev/null || true

# Move SUBSCRIPTIONS feature files
echo "📁 Moving SUBSCRIPTIONS files..."
mv pages/Subscriptions.jsx features/subscriptions/pages/Subscriptions.jsx 2>/dev/null || true
mv pages/SubscriptionDetail.jsx features/subscriptions/pages/SubscriptionDetail.jsx 2>/dev/null || true

# Move STATEMENTS feature files (upload)
echo "📁 Moving STATEMENTS files..."
mv pages/Upload.jsx features/statements/pages/Upload.jsx 2>/dev/null || true

# Move LOYALTY feature files
echo "📁 Moving LOYALTY files..."
mv pages/Loyalty.jsx features/loyalty/pages/Loyalty.jsx 2>/dev/null || true
mv pages/LoyaltyDetail.jsx features/loyalty/pages/LoyaltyDetail.jsx 2>/dev/null || true

# Move ANALYTICS feature files
echo "📁 Moving ANALYTICS files..."
mv pages/Analytics.jsx features/analytics/pages/Analytics.jsx 2>/dev/null || true

# Move DASHBOARD feature files
echo "📁 Moving DASHBOARD files..."
mv pages/Dashboard.jsx features/dashboard/pages/Dashboard.jsx 2>/dev/null || true

# Move SETTINGS feature files
echo "📁 Moving SETTINGS files..."
mv pages/Settings.jsx features/settings/pages/Settings.jsx 2>/dev/null || true

# Move shared components
echo "📁 Moving SHARED components..."
mv components/Layout.jsx shared/components/Layout.jsx 2>/dev/null || true
mv components/PrivateRoute.jsx shared/components/PrivateRoute.jsx 2>/dev/null || true

# Move shared services
echo "📁 Moving SHARED services..."
mv services/api.js shared/services/api.js 2>/dev/null || true

# Move shared store
echo "📁 Moving SHARED store..."
mkdir -p shared/store
mv store/authStore.js shared/store/authStore.js 2>/dev/null || true

echo "✅ Frontend reorganization complete!"
echo ""
echo "New structure:"
echo "frontend/src/"
echo "├── features/"
echo "│   ├── auth/           # Login, UAE Pass, Onboarding"
echo "│   ├── transactions/   # Transactions list & details"
echo "│   ├── subscriptions/  # Subscriptions management"
echo "│   ├── statements/     # Statement upload"
echo "│   ├── loyalty/        # Loyalty cards & programs"
echo "│   ├── analytics/      # Charts & spending insights"
echo "│   ├── dashboard/      # Main dashboard"
echo "│   └── settings/       # User settings"
echo "├── shared/"
echo "│   ├── components/     # Layout, PrivateRoute, etc."
echo "│   ├── services/       # API client"
echo "│   ├── store/          # Zustand stores"
echo "│   └── hooks/          # Custom hooks"
echo "└── App.jsx             # Main app component"
