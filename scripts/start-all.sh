#!/bin/bash

echo "=========================================="
echo "  🚀 Starting TALI Services"
echo "=========================================="
echo ""

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Check if .env exists
if [ ! -f "$PROJECT_ROOT/.env" ]; then
    echo "❌ .env file not found!"
    echo "Please copy .env.example to .env and configure it"
    exit 1
fi

# Load environment variables
source "$PROJECT_ROOT/.env" 2>/dev/null || true

# Check prerequisites
echo "Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    exit 1
fi
echo "✅ Node.js: $(node --version)"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed!"
    exit 1
fi
echo "✅ Python: $(python3 --version)"

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed!"
    exit 1
fi
echo "✅ PostgreSQL installed"

# Check Redis
if ! command -v redis-cli &> /dev/null; then
    echo "❌ Redis is not installed!"
    exit 1
fi
echo "✅ Redis installed"

echo ""

# Start Redis if not running
echo "Starting Redis..."
if ! redis-cli ping &> /dev/null; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew services start redis
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo service redis-server start
    else
        redis-server --daemonize yes
    fi
    sleep 2
fi

if redis-cli ping &> /dev/null; then
    echo "✅ Redis running"
else
    echo "❌ Failed to start Redis"
    exit 1
fi

# Check PostgreSQL
echo "Checking PostgreSQL..."
if ! pg_isready -q; then
    echo "Starting PostgreSQL..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew services start postgresql
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo service postgresql start
    fi
    sleep 3
fi

if pg_isready -q; then
    echo "✅ PostgreSQL running"
else
    echo "❌ Failed to start PostgreSQL"
    exit 1
fi

echo ""
echo "=========================================="
echo "  Starting Services"
echo "=========================================="
echo ""

# Kill any existing processes
echo "Cleaning up old processes..."
pkill -f "uvicorn app:app" 2>/dev/null
pkill -f "node.*server.js" 2>/dev/null
pkill -f "vite" 2>/dev/null
sleep 2

# Create log directory
mkdir -p "$PROJECT_ROOT/logs"

# Start ML Service
echo "1. Starting ML Service..."
cd "$PROJECT_ROOT/ml-service"
nohup python3 -m uvicorn app:app --host 0.0.0.0 --port 8000 > "$PROJECT_ROOT/logs/ml-service.log" 2>&1 &
ML_PID=$!
echo "   PID: $ML_PID"
sleep 3

# Check ML Service
if curl -s http://localhost:8000/health > /dev/null; then
    echo "   ✅ ML Service running on http://localhost:8000"
else
    echo "   ❌ ML Service failed to start"
    cat "$PROJECT_ROOT/logs/ml-service.log"
    exit 1
fi

# Start Backend
echo ""
echo "2. Starting Backend API..."
cd "$PROJECT_ROOT/backend"

# Source environment variables
export $(cat "$PROJECT_ROOT/.env" | grep -v '^#' | xargs)

nohup npm run dev > "$PROJECT_ROOT/logs/backend.log" 2>&1 &
BACKEND_PID=$!
echo "   PID: $BACKEND_PID"
sleep 5

# Check Backend
if curl -s http://localhost:3000/health > /dev/null; then
    echo "   ✅ Backend API running on http://localhost:3000"
else
    echo "   ❌ Backend failed to start"
    tail -20 "$PROJECT_ROOT/logs/backend.log"
    exit 1
fi

# Start Frontend
echo ""
echo "3. Starting Frontend..."
cd "$PROJECT_ROOT/frontend"
nohup npm run dev > "$PROJECT_ROOT/logs/frontend.log" 2>&1 &
FRONTEND_PID=$!
echo "   PID: $FRONTEND_PID"
sleep 5

# Check Frontend
if curl -s http://localhost:5173/ > /dev/null; then
    echo "   ✅ Frontend running on http://localhost:5173"
else
    echo "   ❌ Frontend failed to start"
    tail -20 "$PROJECT_ROOT/logs/frontend.log"
    exit 1
fi

echo ""
echo "=========================================="
echo "  ✅ All Services Started Successfully!"
echo "=========================================="
echo ""
echo "Service URLs:"
echo "  Frontend:   http://localhost:5173"
echo "  Backend:    http://localhost:3000"
echo "  ML Service: http://localhost:8000"
echo ""
echo "Logs:"
echo "  Backend:    logs/backend.log"
echo "  Frontend:   logs/frontend.log"
echo "  ML Service: logs/ml-service.log"
echo ""
echo "To view logs:"
echo "  tail -f logs/backend.log"
echo "  tail -f logs/frontend.log"
echo "  tail -f logs/ml-service.log"
echo ""
echo "To stop services:"
echo "  ./scripts/stop-all.sh"
echo ""
echo "🎉 TALI is ready! Open http://localhost:5173 in your browser"
echo ""
