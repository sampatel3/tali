#!/bin/bash

echo "🔧 Fixing all import paths after reorganization..."

cd /home/user/tali

# Fix backend imports
echo "📦 Fixing backend imports..."

# Fix all files that import from services/api or shared services
find backend/src/features -name "*.js" -type f -exec sed -i \
  -e "s|from '../services/api'|from '../../../shared/services/api'|g" \
  -e "s|from '../../services/api'|from '../../../shared/services/api'|g" \
  -e "s|from '../../../services/api'|from '../../../shared/services/api'|g" \
  -e "s|from '../server.js'|from '../../../server.js'|g" \
  -e "s|from '../../server.js'|from '../../../server.js'|g" \
  {} \;

# Fix frontend imports
echo "📦 Fixing frontend imports..."

# Fix all component imports to use shared
find frontend/src/features -name "*.jsx" -type f -exec sed -i \
  -e "s|from '../services/api'|from '../../../shared/services/api'|g" \
  -e "s|from '../../services/api'|from '../../../shared/services/api'|g" \
  -e "s|from '../../../services/api'|from '../../../shared/services/api'|g" \
  -e "s|from '../store/authStore'|from '../../../shared/store/authStore'|g" \
  -e "s|from '../../store/authStore'|from '../../../shared/store/authStore'|g" \
  -e "s|from '../../../store/authStore'|from '../../../shared/store/authStore'|g" \
  {} \;

# Fix PrivateRoute import in shared/components
sed -i "s|from '../store/authStore'|from '../store/authStore'|g" frontend/src/shared/components/PrivateRoute.jsx 2>/dev/null || true

echo "✅ Import paths fixed!"
echo ""
echo "⚠️  Note: Some files may need manual review if they have complex imports"
