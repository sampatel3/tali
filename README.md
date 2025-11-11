# TALI (تالي) - Subscription & Loyalty Management Platform

**Follow Your Money** - A comprehensive subscription tracking and loyalty program management platform for the UAE/GCC market.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)](https://www.postgresql.org/)

## 🌟 Features

### Subscription Management
- 🔍 **Auto-Detection**: ML-powered subscription detection from bank transactions
- 💳 **Bank Integration**: Connect UAE banks via Nebras API (Open Banking)
- 📊 **Smart Tracking**: Never miss a renewal with intelligent alerts
- 📄 **Statement Upload**: Import PDF/CSV bank statements for analysis

### Loyalty Programs
- 🎁 **UAE/GCC Programs**: Track SHARE, Shukran, Smiles, ENOC LINK, Skywards & more
- 💰 **Value Tracking**: See real AED value of all loyalty points
- 📈 **Points History**: Monitor points earned, redeemed, and expired
- 🔔 **Expiry Alerts**: Get notified before points expire

### Analytics
- 📊 **Spending Insights**: Visualize spending by category
- 💡 **Savings Opportunities**: Identify unused subscriptions
- 📈 **Trends**: Track subscription growth over time
- 🎯 **Budget Management**: Set and monitor spending limits

## 🏗️ Architecture

```
tali/
├── backend/          # Node.js + Express + Prisma
├── frontend/         # React + Vite + TailwindCSS
├── ml-service/       # Python + FastAPI (ML Detection)
└── docker-compose.yml
```

### Tech Stack

**Backend:**
- Node.js 20 + Express.js
- Prisma ORM + PostgreSQL 15
- Redis (caching & job queues)
- Bull (background jobs)
- JWT Authentication
- UAE Pass Integration

**Frontend:**
- React 18 + Vite
- TailwindCSS (Purple brand theme)
- Zustand (state management)
- React Router v6
- Axios (API client)
- Capacitor (iOS/Android)

**ML Service:**
- Python 3.11 + FastAPI
- scikit-learn (pattern detection)
- pandas + numpy

**Infrastructure:**
- Docker + Docker Compose
- PostgreSQL 15
- Redis 7

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local development)
- Python 3.11+ (for ML service development)

### 1. Clone & Setup

```bash
git clone <repository-url>
cd tali
```

### 2. Environment Configuration

Create `.env` file from example:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL=postgresql://taliuser:talipass123@localhost:5432/tali

# JWT Secrets (CHANGE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

# Encryption Key (64-char hex for AES-256)
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef

# UAE Pass
UAE_PASS_CLIENT_ID=your_client_id
UAE_PASS_CLIENT_SECRET=your_client_secret
UAE_PASS_REDIRECT_URI=http://localhost:5173/auth/uaepass/callback

# Nebras API (Open Banking)
NEBRAS_API_KEY=your_nebras_api_key
```

### 3. Start with Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Services will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **ML Service**: http://localhost:8000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

### 4. Database Setup

```bash
# Enter backend container
docker-compose exec backend sh

# Run Prisma migrations
npx prisma migrate dev

# Seed loyalty programs (optional)
npm run seed
```

### 5. Access the App

Open http://localhost:5173 in your browser

## 🛠️ Development Setup (Without Docker)

### Backend

```bash
cd backend

# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma migrate dev

# Start development server
npm run dev
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### ML Service

```bash
cd ml-service

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start service
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

## 📱 Mobile App (Capacitor)

### Build for iOS/Android

```bash
cd frontend

# Install Capacitor
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/android

# Initialize Capacitor (if not done)
npx cap init

# Build web assets
npm run build

# Add platforms
npx cap add ios
npx cap add android

# Sync assets
npx cap sync

# Open in Xcode (iOS)
npx cap open ios

# Open in Android Studio (Android)
npx cap open android
```

## 🔐 UAE Pass Integration

### Setup

1. Register your app at [UAE Pass Developer Portal](https://developer.uaepass.ae/)
2. Get `CLIENT_ID` and `CLIENT_SECRET`
3. Configure redirect URI: `http://localhost:5173/auth/uaepass/callback` (development)
4. Update `.env` file with credentials

### Testing

Use UAE Pass staging environment for development:
- Set `UAE_PASS_ENV=staging` in `.env`
- Use test credentials from UAE Pass portal

## 🏦 Nebras API (Open Banking)

### Setup

1. Sign up at [Nebras Finance](https://nebrasfinance.com/)
2. Get API key
3. Configure webhooks for transaction updates
4. Add `NEBRAS_API_KEY` to `.env`

### Supported UAE Banks

- Emirates NBD
- First Abu Dhabi Bank (FAB)
- ADCB
- Mashreq Bank
- Dubai Islamic Bank
- RAKBANK
- _More coming soon..._

## 📊 API Documentation

### Authentication

```bash
# Get UAE Pass login URL
POST /api/v1/auth/uae-pass/login

# Complete UAE Pass callback
POST /api/v1/auth/uae-pass/callback
Body: { "code": "...", "state": "..." }

# Refresh token
POST /api/v1/auth/refresh-token
Body: { "refreshToken": "..." }
```

### Subscriptions

```bash
# Get all subscriptions
GET /api/v1/subscriptions

# Auto-detect subscriptions
POST /api/v1/subscriptions/detect

# Create manual subscription
POST /api/v1/subscriptions
Body: { "merchantName": "...", "amount": 99.99, ... }

# Update subscription
PUT /api/v1/subscriptions/:id

# Delete subscription
DELETE /api/v1/subscriptions/:id
```

### Loyalty

```bash
# Get all loyalty programs
GET /api/v1/loyalty/programs

# Get user's loyalty cards
GET /api/v1/loyalty/cards

# Add loyalty card
POST /api/v1/loyalty/cards
Body: { "loyaltyProgramId": "...", "membershipNumber": "..." }

# Get suggestions based on spending
GET /api/v1/loyalty/suggestions
```

### Bank Accounts

```bash
# Create link token
POST /api/v1/accounts/link/token

# Exchange public token
POST /api/v1/accounts/link/exchange
Body: { "public_token": "..." }

# Get accounts
GET /api/v1/accounts

# Sync account
POST /api/v1/accounts/:id/sync
```

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test
npm run test:coverage
```

### Frontend Tests

```bash
cd frontend
npm test
```

### ML Service Tests

```bash
cd ml-service
pytest
```

## 🚀 Deployment

### Production Checklist

- [ ] Change all secrets in `.env`
- [ ] Generate new `ENCRYPTION_KEY` (64-char hex)
- [ ] Set `NODE_ENV=production`
- [ ] Configure UAE Pass production URLs
- [ ] Set up SSL certificates
- [ ] Configure CORS for production domain
- [ ] Set up database backups
- [ ] Configure error tracking (Sentry)
- [ ] Set up monitoring (CloudWatch)
- [ ] Enable rate limiting
- [ ] Configure CDN for frontend

### AWS Deployment

Recommended AWS architecture:

- **ECS Fargate**: Container orchestration
- **RDS PostgreSQL**: Managed database (me-south-1)
- **ElastiCache Redis**: Managed cache
- **S3**: File storage (statements, logos)
- **CloudFront**: CDN for frontend
- **ALB**: Load balancer
- **Route53**: DNS management
- **ACM**: SSL certificates
- **Secrets Manager**: API keys & secrets

### Docker Production Build

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

## 🔒 Security

- ✅ HTTPS everywhere
- ✅ JWT with refresh tokens
- ✅ Rate limiting on all endpoints
- ✅ SQL injection prevention (Prisma ORM)
- ✅ XSS protection
- ✅ CSRF protection
- ✅ Input validation (Joi/Zod)
- ✅ File upload restrictions
- ✅ Encryption for sensitive data
- ✅ Security headers (Helmet.js)
- ✅ GDPR compliance ready

## 📝 Known Loyalty Programs

Currently supporting:

- **SHARE** (Majid Al Futtaim) - Retail
- **Shukran** (Lulu) - Retail
- **Smiles** (Etisalat) - Telecom
- **ENOC LINK** - Fuel
- **ADNOC Rewards** - Fuel
- **Skywards** (Emirates) - Travel
- **Etihad Guest** - Travel

## 🗺️ Roadmap

### Phase 1 (MVP) ✅
- [x] UAE Pass authentication
- [x] Bank account linking (Nebras)
- [x] Subscription detection (ML)
- [x] Loyalty program tracking
- [x] Basic analytics

### Phase 2 (Q2 2024)
- [ ] Mobile app (iOS/Android)
- [ ] Push notifications
- [ ] Budget management
- [ ] Spending insights
- [ ] Family accounts

### Phase 3 (Q3 2024)
- [ ] Saudi Arabia expansion
- [ ] More loyalty programs
- [ ] Subscription marketplace
- [ ] Recommendations engine
- [ ] Bill negotiation

### Phase 4 (Q4 2024)
- [ ] Qatar, Kuwait, Bahrain support
- [ ] B2B features
- [ ] White-label solution
- [ ] API for third parties

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

Built with ❤️ for the UAE & GCC community

## 📧 Support

- **Email**: support@tali.app
- **Twitter**: [@TaliApp](https://twitter.com/taliapp)
- **Website**: https://tali.app

## 🙏 Acknowledgments

- UAE Pass for authentication infrastructure
- Nebras Finance for open banking API
- All the UAE/GCC loyalty programs
- The amazing fintech community

---

**TALI (تالي)** - Follow Your Money 💜
