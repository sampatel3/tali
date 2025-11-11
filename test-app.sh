#!/bin/bash

echo "=================================="
echo "  TALI - Service Status Check"
echo "=================================="
echo ""

echo "🔍 Checking Services..."
echo ""

# Check Frontend
echo "1. Frontend (React + Vite):"
if curl -s http://localhost:5173/ | grep -q "TALI"; then
    echo "   ✅ Running on http://localhost:5173"
    echo "   📱 Network: http://21.0.0.54:5173"
else
    echo "   ❌ Not responding"
fi
echo ""

# Check Backend
echo "2. Backend API:"
BACKEND_STATUS=$(curl -s http://localhost:3000/health)
if echo "$BACKEND_STATUS" | grep -q "ok"; then
    echo "   ✅ Running on http://localhost:3000"
    echo "   Response: $BACKEND_STATUS"
else
    echo "   ❌ Not responding"
fi
echo ""

# Check ML Service
echo "3. ML Service:"
ML_STATUS=$(curl -s http://localhost:8000/health)
if echo "$ML_STATUS" | grep -q "healthy"; then
    echo "   ✅ Running on http://localhost:8000"
    echo "   Response: $ML_STATUS"
else
    echo "   ❌ Not responding"
fi
echo ""

# Check Database
echo "4. PostgreSQL:"
if psql -U postgres -c "SELECT 1;" > /dev/null 2>&1; then
    echo "   ✅ Connected"
else
    echo "   ❌ Not connected"
fi
echo ""

# Check Redis
echo "5. Redis:"
if redis-cli ping > /dev/null 2>&1; then
    echo "   ✅ Connected"
else
    echo "   ❌ Not connected"
fi
echo ""

echo "=================================="
echo "  Access Instructions"
echo "=================================="
echo ""
echo "Since you're running this on a remote server,"
echo "you need to access it via port forwarding:"
echo ""
echo "1. In your IDE/terminal, forward these ports:"
echo "   - Port 5173 (Frontend)"
echo "   - Port 3000 (Backend)"
echo "   - Port 8000 (ML Service)"
echo ""
echo "2. Or use the network URL if accessible:"
echo "   http://21.0.0.54:5173"
echo ""
echo "=================================="
echo ""

# Test a simple API call
echo "🧪 Testing ML Service (Netflix detection):"
curl -s -X POST http://localhost:8000/detect \
  -H "Content-Type: application/json" \
  -d '{
    "transaction": {
      "merchant_name": "NETFLIX",
      "amount": 49.99,
      "date": "2025-11-11T00:00:00Z"
    },
    "history": []
  }' | python3 -m json.tool

echo ""
echo "✅ All core services are running!"
echo ""
