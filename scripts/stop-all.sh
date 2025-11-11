#!/bin/bash

echo "=========================================="
echo "  🛑 Stopping TALI Services"
echo "=========================================="
echo ""

# Stop processes
echo "Stopping services..."

# Stop ML Service
pkill -f "uvicorn app:app" && echo "✅ ML Service stopped" || echo "⚠️  ML Service not running"

# Stop Backend
pkill -f "node.*server.js" && echo "✅ Backend stopped" || echo "⚠️  Backend not running"
pkill -f "nodemon" && echo "✅ Nodemon stopped" || true

# Stop Frontend
pkill -f "vite" && echo "✅ Frontend stopped" || echo "⚠️  Frontend not running"

echo ""
echo "All services stopped."
echo ""
