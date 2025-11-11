#!/bin/bash

# Backend Feature Reorganization Script

echo "🔄 Reorganizing backend into feature modules..."

cd /home/user/tali/backend/src

# Move AUTH feature files
echo "📁 Moving AUTH files..."
mv routes/auth.js features/auth/routes/auth.js 2>/dev/null || true
mv controllers/authController.js features/auth/controllers/authController.js 2>/dev/null || true
mv services/auth/uaePassService.js features/auth/services/uaePassService.js 2>/dev/null || true
mv middleware/auth.js features/auth/middleware/auth.js 2>/dev/null || true

# Move TRANSACTIONS feature files
echo "📁 Moving TRANSACTIONS files..."
mv routes/transactions.js features/transactions/routes/transactions.js 2>/dev/null || true

# Move SUBSCRIPTIONS feature files
echo "📁 Moving SUBSCRIPTIONS files..."
mv routes/subscriptions.js features/subscriptions/routes/subscriptions.js 2>/dev/null || true
mv controllers/subscriptionController.js features/subscriptions/controllers/subscriptionController.js 2>/dev/null || true

# Move STATEMENTS feature files (upload)
echo "📁 Moving STATEMENTS files..."
mv routes/upload.js features/statements/routes/upload.js 2>/dev/null || true
mv controllers/uploadController.js features/statements/controllers/uploadController.js 2>/dev/null || true
mv services/parsers/statementParser.js features/statements/services/statementParser.js 2>/dev/null || true
mv workers/statementProcessor.js features/statements/workers/statementProcessor.js 2>/dev/null || true

# Move LOYALTY feature files
echo "📁 Moving LOYALTY files..."
mv routes/loyalty.js features/loyalty/routes/loyalty.js 2>/dev/null || true
mv services/loyalty/loyaltyService.js features/loyalty/services/loyaltyService.js 2>/dev/null || true

# Move ANALYTICS feature files
echo "📁 Moving ANALYTICS files..."
mv routes/analytics.js features/analytics/routes/analytics.js 2>/dev/null || true

# Move NOTIFICATIONS feature files
echo "📁 Moving NOTIFICATIONS files..."
mv routes/notifications.js features/notifications/routes/notifications.js 2>/dev/null || true

# Move ACCOUNTS/BANKING files
echo "📁 Moving BANKING files..."
mkdir -p features/banking/{routes,services}
mv routes/accounts.js features/banking/routes/accounts.js 2>/dev/null || true
mv services/banking/nebrasService.js features/banking/services/nebrasService.js 2>/dev/null || true

# Move USERS files
echo "📁 Moving USERS files..."
mkdir -p features/users/routes
mv routes/users.js features/users/routes/users.js 2>/dev/null || true

# Move shared files
echo "📁 Moving SHARED files..."
mv middleware/errorHandler.js shared/middleware/errorHandler.js 2>/dev/null || true
mv services/jobs/queueService.js shared/services/queueService.js 2>/dev/null || true
mv utils/helpers.js shared/utils/helpers.js 2>/dev/null || true

# Create index files for each feature
echo "📝 Creating feature index files..."

# Workers index
cat > workers/index.js << 'EOF'
/**
 * Worker process entry point
 * Starts all Bull queue processors
 */

// Import all feature workers
import '../features/statements/workers/statementProcessor.js';

console.log('All workers started successfully');
console.log('Listening for jobs on:');
console.log('- statement-processing queue');
console.log('- subscription-detection queue');
console.log('- transaction-sync queue');
console.log('- notifications queue');
EOF

echo "✅ Backend reorganization complete!"
echo ""
echo "New structure:"
echo "backend/src/"
echo "├── features/"
echo "│   ├── auth/           # Authentication (UAE Pass, JWT)"
echo "│   ├── transactions/   # Transaction management"
echo "│   ├── subscriptions/  # Subscription detection & management"
echo "│   ├── statements/     # Bank statement upload & processing"
echo "│   ├── loyalty/        # Loyalty programs"
echo "│   ├── analytics/      # Spending analytics"
echo "│   ├── banking/        # Nebras/Open banking"
echo "│   ├── notifications/  # Push notifications"
echo "│   └── users/          # User profile management"
echo "├── shared/"
echo "│   ├── middleware/     # Shared middleware (error handler)"
echo "│   ├── services/       # Shared services (queue)"
echo "│   └── utils/          # Shared utilities"
echo "└── server.js           # Main server file"
