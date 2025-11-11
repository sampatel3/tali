#!/bin/bash

echo "=========================================="
echo "  📦 TALI Quick Install Script"
echo "=========================================="
echo ""

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$PROJECT_ROOT"

# Step 1: Create .env file
echo "Step 1: Setting up environment variables..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file (please review and update)"
else
    echo "✅ .env file already exists"
fi

if [ ! -f frontend/.env ]; then
    echo "VITE_API_URL=http://localhost:3000/api/v1" > frontend/.env
    echo "✅ Created frontend/.env file"
else
    echo "✅ frontend/.env already exists"
fi

echo ""

# Step 2: Install Backend Dependencies
echo "Step 2: Installing backend dependencies..."
cd "$PROJECT_ROOT/backend"
if [ -d "node_modules" ]; then
    echo "⏭️  Backend dependencies already installed"
else
    npm install
    echo "✅ Backend dependencies installed"
fi

echo ""

# Step 3: Install Frontend Dependencies
echo "Step 3: Installing frontend dependencies..."
cd "$PROJECT_ROOT/frontend"
if [ -d "node_modules" ]; then
    echo "⏭️  Frontend dependencies already installed"
else
    npm install
    echo "✅ Frontend dependencies installed"
fi

echo ""

# Step 4: Install ML Service Dependencies
echo "Step 4: Installing ML service dependencies..."
cd "$PROJECT_ROOT/ml-service"

# Check if in virtual environment
if [ -z "$VIRTUAL_ENV" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    echo "✅ Virtual environment created"
fi

pip install -r requirements.txt
echo "✅ ML service dependencies installed"

echo ""

# Step 5: Setup Database
echo "Step 5: Setting up database..."
echo "Would you like to set up the database now? (y/n)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    "$PROJECT_ROOT/scripts/setup-db.sh"
else
    echo "⏭️  Skipping database setup"
    echo "   Run ./scripts/setup-db.sh manually when ready"
fi

echo ""

# Step 6: Initialize Database Schema
echo "Step 6: Initializing database schema..."
echo "Would you like to initialize the database schema? (y/n)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    cd "$PROJECT_ROOT/backend"
    npx prisma generate
    npx prisma migrate dev --name init
    echo "✅ Database schema initialized"
else
    echo "⏭️  Skipping schema initialization"
    echo "   Run 'cd backend && npx prisma migrate dev' manually when ready"
fi

echo ""
echo "=========================================="
echo "  ✅ Installation Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  1. Review and update .env file if needed"
echo "  2. Start services: ./scripts/start-all.sh"
echo "  3. Open http://localhost:5173 in your browser"
echo ""
echo "Useful commands:"
echo "  Start all:    ./scripts/start-all.sh"
echo "  Stop all:     ./scripts/stop-all.sh"
echo "  Run tests:    ./test-app.sh"
echo ""
