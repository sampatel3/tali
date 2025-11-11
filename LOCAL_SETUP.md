# 🚀 TALI - Local Development Setup Guide

Complete guide to run TALI on your local machine for testing before AWS deployment.

---

## 📋 Prerequisites

Before you begin, ensure you have these installed:

- **Node.js 20+** - [Download](https://nodejs.org/)
- **Python 3.11+** - [Download](https://www.python.org/)
- **PostgreSQL 15+** - [Download](https://www.postgresql.org/)
- **Redis** - [Download](https://redis.io/)
- **Git** - [Download](https://git-scm.com/)

### Quick Install (macOS with Homebrew)
```bash
brew install node python postgresql redis git
```

### Quick Install (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install nodejs npm python3 python3-pip postgresql redis-server git
```

### Quick Install (Windows)
Use [Chocolatey](https://chocolatey.org/):
```powershell
choco install nodejs python postgresql redis git
```

---

## 📦 Step 1: Clone the Repository

```bash
git clone <your-repository-url>
cd tali
```

---

## 🔧 Step 2: Setup Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and update these values:

```env
# Database
DATABASE_URL=postgresql://taliuser:talipass123@localhost:5432/tali

# JWT Secrets (CHANGE THESE!)
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this

# Encryption Key (Generate a new one: openssl rand -hex 32)
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef

# Ports
PORT=3000
FRONTEND_URL=http://localhost:5173

# UAE Pass (optional for demo)
UAE_PASS_ENV=staging
UAE_PASS_CLIENT_ID=demo_client_id
UAE_PASS_CLIENT_SECRET=demo_client_secret

# Nebras API (optional for demo)
NEBRAS_API_KEY=demo_nebras_api_key
```

Also create frontend environment:

```bash
echo "VITE_API_URL=http://localhost:3000/api/v1" > frontend/.env
```

---

## 🗄️ Step 3: Setup PostgreSQL Database

### Option A: Using PostgreSQL CLI

```bash
# Start PostgreSQL
# macOS: brew services start postgresql
# Ubuntu: sudo service postgresql start
# Windows: Start from Services

# Create user and database
psql -U postgres

# In psql:
CREATE USER taliuser WITH PASSWORD 'talipass123';
CREATE DATABASE tali OWNER taliuser;
ALTER USER taliuser CREATEDB;
\q
```

### Option B: Using Script

```bash
./scripts/setup-db.sh
```

---

## 🔴 Step 4: Start Redis

```bash
# macOS
brew services start redis

# Ubuntu/Debian
sudo service redis-server start

# Or run in foreground
redis-server
```

---

## 📥 Step 5: Install Dependencies

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

### ML Service
```bash
cd ml-service
pip install -r requirements.txt
# or use virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

---

## 🗃️ Step 6: Initialize Database

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

This will create all necessary tables.

---

## 🎯 Step 7: Start All Services

### Quick Start (Recommended)

Use the provided startup script:

```bash
# Make scripts executable (Unix/Mac)
chmod +x scripts/*.sh

# Start all services
./scripts/start-all.sh
```

### Manual Start

Open **three separate terminal windows**:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 3 - ML Service:**
```bash
cd ml-service
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

---

## ✅ Step 8: Verify Installation

### Check Services

```bash
# Test backend
curl http://localhost:3000/health

# Test ML service
curl http://localhost:8000/health

# Test frontend
curl http://localhost:5173/
```

Or run the test script:

```bash
./test-app.sh
```

### Access the Application

Open your browser and navigate to:

**http://localhost:5173**

You should see the TALI onboarding page! 🎉

---

## 🧪 Testing the Application

### 1. Test ML Subscription Detection

```bash
curl -X POST http://localhost:8000/detect \
  -H "Content-Type: application/json" \
  -d '{
    "transaction": {
      "merchant_name": "NETFLIX",
      "amount": 49.99,
      "date": "2025-11-11T00:00:00Z"
    },
    "history": []
  }'
```

### 2. Test Backend API

```bash
# Health check
curl http://localhost:3000/health

# Check available endpoints
curl http://localhost:3000/api/v1/
```

### 3. Test Frontend

1. Open http://localhost:5173
2. You should see the onboarding page
3. Click "Sign in with UAE Pass" (demo mode)
4. Explore the dashboard, subscriptions, and loyalty pages

---

## 📊 Database Access

### View Data with Prisma Studio

```bash
cd backend
npx prisma studio
```

This opens a GUI at http://localhost:5555 to view/edit database records.

### Direct PostgreSQL Access

```bash
psql -U taliuser -d tali

# List tables
\dt

# Query users
SELECT * FROM "User";

# Exit
\q
```

---

## 🐛 Troubleshooting

### Port Already in Use

If ports 3000, 5173, or 8000 are in use:

```bash
# Find process using port 3000
lsof -ti:3000 | xargs kill -9

# Or change ports in .env and frontend/.env
```

### Database Connection Error

```bash
# Check PostgreSQL is running
pg_isready

# Check credentials in .env
# Verify user exists:
psql -U postgres -c "\du"
```

### Redis Connection Error

```bash
# Check Redis is running
redis-cli ping
# Should return: PONG

# Start Redis if not running
redis-server
```

### Module Not Found Errors

```bash
# Reinstall dependencies
cd backend && npm install
cd frontend && npm install
cd ml-service && pip install -r requirements.txt
```

### Prisma Errors

```bash
cd backend

# Regenerate Prisma client
npx prisma generate

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Create fresh migration
npx prisma migrate dev
```

---

## 🛑 Stopping Services

### If using startup script:
```bash
./scripts/stop-all.sh
```

### Manual stop:
```bash
# Stop Node processes
pkill -f "node"
pkill -f "vite"

# Stop Python
pkill -f "uvicorn"

# Stop Redis (if running in foreground)
redis-cli shutdown

# Stop PostgreSQL
# macOS: brew services stop postgresql
# Ubuntu: sudo service postgresql stop
```

---

## 📦 Building for Production

### Frontend Build
```bash
cd frontend
npm run build
# Output in frontend/dist/
```

### Backend Build
```bash
cd backend
# Already production-ready (Node.js)
# Just set NODE_ENV=production
```

### Docker Build (Recommended)
```bash
# Build all services
docker-compose build

# Run in production mode
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🔒 Security Checklist (Before Production)

- [ ] Generate new JWT secrets
- [ ] Generate new encryption key
- [ ] Update database credentials
- [ ] Get real UAE Pass credentials
- [ ] Get real Nebras API key
- [ ] Enable HTTPS
- [ ] Set up firewalls
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Set up monitoring (Sentry)
- [ ] Configure backups

---

## 📝 Development Workflow

### Making Changes

1. **Backend changes**: Edit files in `backend/src/`, server auto-reloads
2. **Frontend changes**: Edit files in `frontend/src/`, hot-reload enabled
3. **ML Service changes**: Edit `ml-service/app.py`, restart service
4. **Database changes**:
   ```bash
   # Edit backend/prisma/schema.prisma
   npx prisma migrate dev --name your_change_name
   ```

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# Integration tests
./scripts/run-tests.sh
```

---

## 🚀 Next Steps After Testing

Once you've tested locally and everything works:

1. **Prepare for AWS Deployment**
   - See `AWS_DEPLOYMENT.md` (will be created)
   - Set up AWS account and credentials
   - Configure production environment variables

2. **Set up CI/CD**
   - GitHub Actions workflows included
   - Automatic testing and deployment

3. **Get Production Credentials**
   - UAE Pass: https://developer.uaepass.ae/
   - Nebras API: https://nebrasfinance.com/

---

## 📞 Need Help?

- **Documentation**: Check README.md and other docs
- **Issues**: Create a GitHub issue
- **Database**: Use `npx prisma studio` to inspect data
- **Logs**: Check `logs/` directory for error logs

---

## ✅ Quick Reference

| Service | URL | Command |
|---------|-----|---------|
| Frontend | http://localhost:5173 | `cd frontend && npm run dev` |
| Backend | http://localhost:3000 | `cd backend && npm run dev` |
| ML Service | http://localhost:8000 | `cd ml-service && uvicorn app:app --reload` |
| Prisma Studio | http://localhost:5555 | `cd backend && npx prisma studio` |
| Database | localhost:5432 | `psql -U taliuser -d tali` |
| Redis | localhost:6379 | `redis-cli` |

---

**You're all set! 🎉**

Start all services and access the app at **http://localhost:5173**
