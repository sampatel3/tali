# TALI Deployment Guide

## Overview

TALI supports both **local development** and **production** deployments with different authentication methods:

- **Local Development**: Username/Password login (demo/demo) + UAE Pass demo mode
- **Production**: UAE Pass authentication + Username/Password for registered users

## Local Development Setup

### Prerequisites

- Flutter SDK 3.9.2+
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Python 3.10+ (for ML service)

### Quick Start

1. **Clone and Install**
   ```bash
   git clone <repo-url>
   cd tali
   npm install -g npm@latest
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Flutter Setup**
   ```bash
   export PATH="/path/to/flutter/bin:$PATH"
   flutter pub get
   ```

4. **Database Setup**
   ```bash
   # Ensure PostgreSQL is running
   brew services start postgresql@15  # macOS
   # or
   sudo service postgresql start      # Linux

   # Create database (if not exists)
   psql -U postgres -c "CREATE USER taliuser WITH PASSWORD 'talipass123';"
   psql -U postgres -c "CREATE DATABASE tali OWNER taliuser;"
   psql -U postgres -c "ALTER USER taliuser CREATEDB;"

   # Run migrations
   cd backend
   export DATABASE_URL="postgresql://taliuser:talipass123@localhost:5432/tali"
   npx prisma migrate deploy
   ```

5. **Environment Variables**
   
   Create `.env` in project root:
   ```env
   # Database
   DATABASE_URL=postgresql://taliuser:talipass123@localhost:5432/tali
   
   # Redis
   REDIS_URL=redis://localhost:6379
   
   # JWT Secrets
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
   
   # Server
   NODE_ENV=development
   PORT=3000
   FRONTEND_URL=http://localhost:5173
   
   # UAE Pass (Demo Mode)
   UAE_PASS_CLIENT_ID=your_uaepass_client_id
   UAE_PASS_CLIENT_SECRET=your_uaepass_client_secret
   UAE_PASS_REDIRECT_URI=http://localhost:5173/auth/uaepass/callback
   ```

6. **Start Services**
   ```bash
   # Start all services
   ./scripts/start-all.sh
   
   # Or manually:
   # Terminal 1: Backend
   cd backend && npm run dev
   
   # Terminal 2: ML Service
   cd ml-service && python3 -m venv venv && source venv/bin/activate
   pip install -r requirements.txt
   python app.py
   
   # Terminal 3: Flutter Web
   export PATH="/path/to/flutter/bin:$PATH"
   flutter run -d web-server --web-port 5173
   ```

### Local Login Credentials

- **Username/Password**: `demo` / `demo`
- **UAE Pass**: Demo mode (auto-creates demo user)

## Production Deployment

### Environment Variables

Create `.env` in project root with production values:

```env
# Database (Production)
DATABASE_URL=postgresql://user:password@host:5432/tali_prod

# Redis (Production)
REDIS_URL=redis://host:6379

# JWT Secrets (CHANGE THESE!)
JWT_SECRET=<strong-random-secret-64-chars>
JWT_REFRESH_SECRET=<strong-random-secret-64-chars>

# Server
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-domain.com

# UAE Pass (Production)
UAE_PASS_ENV=production
UAE_PASS_CLIENT_ID=<real-client-id>
UAE_PASS_CLIENT_SECRET=<real-client-secret>
UAE_PASS_REDIRECT_URI=https://your-domain.com/auth/uaepass/callback
```

### Docker Deployment

1. **Build Images**
   ```bash
   docker-compose -f docker-compose.prod.yml build
   ```

2. **Start Services**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Run Migrations**
   ```bash
   docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
   ```

### Authentication Methods

#### Production UAE Pass
- Requires valid UAE Pass credentials
- Users authenticate via UAE Pass OAuth flow
- Auto-creates user accounts on first login

#### Production Username/Password
- Users must register first (registration endpoint to be implemented)
- Passwords are hashed with bcrypt
- Supports email or username login

## Key Differences: Local vs Production

| Feature | Local Development | Production |
|---------|------------------|------------|
| **UAE Pass** | Demo mode (auto-login) | Real OAuth flow |
| **Username/Password** | `demo`/`demo` works | Requires registration |
| **Database** | Local PostgreSQL | Production PostgreSQL |
| **JWT Secrets** | Default values | Strong random secrets |
| **Frontend URL** | `http://localhost:5173` | Production domain |
| **Environment** | `development` | `production` |

## Troubleshooting

### Flutter App Not Showing Both Login Buttons

1. **Hard refresh browser**: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
2. **Clear Flutter cache**: `flutter clean && flutter pub get`
3. **Restart Flutter**: Kill process and restart
4. **Check browser console**: F12 → Console for errors

### Backend Not Loading .env

- Ensure `.env` is in project root (not `backend/`)
- Backend loads `.env` from `backend/src/` → `../../.env`
- Restart backend after changing `.env`

### Database Connection Issues

```bash
# Check PostgreSQL is running
pg_isready

# Test connection
psql -h localhost -U taliuser -d tali -c "SELECT 1;"

# Check DATABASE_URL format
echo $DATABASE_URL
```

### UAE Pass Login Issues

**Local**: Should use demo mode automatically if `UAE_PASS_CLIENT_ID` is placeholder
**Production**: Requires valid UAE Pass credentials

Check backend logs:
```bash
tail -f logs/backend.log | grep -i "uae\|auth"
```

## Security Checklist

- [ ] Change default JWT secrets in production
- [ ] Use strong database passwords
- [ ] Enable HTTPS in production
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable Redis password authentication
- [ ] Use environment-specific .env files
- [ ] Never commit .env files to git

## Support

For issues:
1. Check logs: `logs/backend.log`, `logs/ml-service.log`
2. Verify services: `curl http://localhost:3000/health`
3. Check Flutter: Browser console (F12)

