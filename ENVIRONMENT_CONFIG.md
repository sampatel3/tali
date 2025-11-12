# Environment Configuration Guide

This guide explains how to configure TALI for local development and production deployments.

## Local Development

### 1. Create `.env` file

Copy the example and update values:

```bash
cp .env.example .env
```

### 2. Required Environment Variables

```env
# Environment
NODE_ENV=development

# Database
DATABASE_URL=postgresql://taliuser:talipass123@localhost:5432/tali

# Redis
REDIS_URL=redis://localhost:6379

# Server
PORT=3000
FRONTEND_URL=http://localhost:5173

# File Uploads (local)
UPLOAD_DIR=uploads/statements

# JWT Secrets (change these!)
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this

# Encryption Key (generate with: openssl rand -hex 32)
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef

# UAE Pass (demo mode)
UAE_PASS_ENV=staging
UAE_PASS_CLIENT_ID=demo_client_id
UAE_PASS_CLIENT_SECRET=demo_client_secret

# ML Service
ML_SERVICE_URL=http://localhost:8000
```

### 3. Frontend Environment

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000/api/v1
```

## Production Deployment

### 1. Environment Variables

Production requires secure values:

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@prod-db-host:5432/tali_prod
REDIS_URL=redis://prod-redis-host:6379
FRONTEND_URL=https://tali.app
UPLOAD_DIR=/app/uploads/statements

# Generate secure secrets:
# JWT_SECRET: openssl rand -base64 32
# JWT_REFRESH_SECRET: openssl rand -base64 32
# ENCRYPTION_KEY: openssl rand -hex 32

UAE_PASS_ENV=production
UAE_PASS_CLIENT_ID=your_production_client_id
UAE_PASS_CLIENT_SECRET=your_production_client_secret
```

### 2. Docker Compose Production

Use environment-specific compose file:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 3. Security Checklist

- [ ] Change all JWT secrets
- [ ] Generate new encryption key
- [ ] Use production database credentials
- [ ] Configure real UAE Pass credentials
- [ ] Set up SSL certificates
- [ ] Configure CORS for production domain
- [ ] Set up file storage (S3 recommended)
- [ ] Enable rate limiting
- [ ] Configure monitoring

## Key Differences: Local vs Production

| Setting | Local | Production |
|---------|-------|------------|
| `NODE_ENV` | `development` | `production` |
| `UPLOAD_DIR` | `uploads/statements` | `/app/uploads/statements` |
| `FRONTEND_URL` | `http://localhost:5173` | `https://tali.app` |
| `UAE_PASS_ENV` | `staging` | `production` |
| Workers | Auto-start | Separate process |
| Logging | Verbose | Warnings only |

## File Upload Configuration

### Local Development
- Files stored in `uploads/statements/` directory
- No size limits (handled by multer: 10MB)

### Production
- Files stored in `/app/uploads/statements/` (Docker)
- Consider using S3 or similar for scalability
- Set `AWS_S3_BUCKET` environment variable if using S3

## Database Migrations

### Local
```bash
cd backend
npx prisma migrate dev
```

### Production
```bash
cd backend
npx prisma migrate deploy
```

## Workers

### Local
Workers auto-start with backend server (development mode)

### Production
Run workers as separate process:
```bash
npm run worker
```

Or use process manager (PM2, systemd, etc.)

