# 🚀 TALI - Quick Start Guide

Get TALI running on your local machine in **5 minutes**!

---

## 📥 Step 1: Clone the Repository

```bash
git clone <your-repository-url>
cd tali
```

---

## ⚡ Step 2: Quick Install

### Option A: Automated Install (Recommended)

```bash
./scripts/quick-install.sh
```

This will:
- ✅ Set up environment files
- ✅ Install all dependencies (Backend, Frontend, ML Service)
- ✅ Create database and user
- ✅ Initialize database schema

### Option B: Manual Install

```bash
# 1. Setup environment
cp .env.example .env
echo "VITE_API_URL=http://localhost:3000/api/v1" > frontend/.env

# 2. Install dependencies
cd backend && npm install
cd ../frontend && npm install
cd ../ml-service && pip install -r requirements.txt

# 3. Setup database
./scripts/setup-db.sh

# 4. Initialize schema
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

---

## 🎯 Step 3: Start Services

### Option A: Start All at Once

```bash
./scripts/start-all.sh
```

### Option B: Start Manually (3 terminals)

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

## ✅ Step 4: Access the App

Open your browser and go to:

**http://localhost:5173**

You should see the TALI onboarding page! 🎉

---

## 🧪 Quick Test

Run the test script to verify everything:

```bash
./test-app.sh
```

---

## 🛑 Stop Services

```bash
./scripts/stop-all.sh
```

---

## 🐛 Troubleshooting

### "Port already in use"
```bash
# Kill processes on ports 3000, 5173, 8000
./scripts/stop-all.sh
```

### "Database connection error"
```bash
# Check PostgreSQL is running
pg_isready

# Start PostgreSQL
# macOS: brew services start postgresql
# Ubuntu: sudo service postgresql start
```

### "Redis connection error"
```bash
# Check Redis
redis-cli ping

# Start Redis
# macOS: brew services start redis
# Ubuntu: sudo service redis-server start
```

### "Module not found"
```bash
# Reinstall dependencies
cd backend && npm install
cd frontend && npm install
cd ml-service && pip install -r requirements.txt
```

---

## 📚 Full Documentation

For detailed setup and configuration:
- **Complete Setup**: See `LOCAL_SETUP.md`
- **Deployment**: See `DEPLOYMENT_STATUS.md`
- **API Docs**: See `README.md`

---

## 🎨 What You'll See

1. **Onboarding Page** - Purple gradient with UAE Pass login
2. **Dashboard** - Stats, upcoming renewals, quick actions
3. **Subscriptions** - Auto-detect and manage subscriptions
4. **Loyalty** - Track SHARE, Shukran, Smiles, Skywards
5. **Analytics** - Spending insights
6. **Upload** - Bank statement upload

---

## 🔒 Before Production

- [ ] Update JWT secrets in `.env`
- [ ] Get real UAE Pass credentials
- [ ] Get real Nebras API key
- [ ] Configure production database
- [ ] Set up HTTPS
- [ ] Enable monitoring

See `LOCAL_SETUP.md` for security checklist.

---

## ✨ Quick Commands

```bash
# Install everything
./scripts/quick-install.sh

# Start all services
./scripts/start-all.sh

# Stop all services
./scripts/stop-all.sh

# Test services
./test-app.sh

# View database
cd backend && npx prisma studio

# View logs
tail -f logs/backend.log
tail -f logs/frontend.log
tail -f logs/ml-service.log
```

---

**That's it! You're ready to test TALI! 🎉**

Open **http://localhost:5173** and start exploring!
