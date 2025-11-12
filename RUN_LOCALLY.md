# 🚀 Running TALI Locally - Quick Start Guide

## ✅ Prerequisites Check

Your environment is ready! Here's what's running:

- ✅ **Flutter SDK**: 3.35.7 (installed at `/tmp/flutter/bin/flutter`)
- ✅ **Backend API**: Running on `http://localhost:3000`
- ✅ **PostgreSQL**: Running on port 5432
- ✅ **Redis**: Running on port 6379
- ✅ **ML Service**: Running on `http://localhost:8000`

## 🎯 Run the Flutter Web App

### Option 1: Development Mode (Hot Reload)

```bash
# Navigate to the project
cd /home/user/tali

# Run Flutter web app with hot reload
/tmp/flutter/bin/flutter run -d web-server --web-port 5173
```

Then open your browser to: **http://localhost:5173**

### Option 2: Build and Serve (Production-like)

```bash
# Build the production web app
/tmp/flutter/bin/flutter build web --release

# Serve the built app
cd build/web
python3 -m http.server 5173
```

Then open: **http://localhost:5173**

## 🌐 Access the App

Once running, you can:

1. **Open the app**: http://localhost:5173
2. **Login with UAE Pass**: Click "Login with UAE Pass" (Demo mode enabled)
3. **Explore features**:
   - Dashboard
   - Subscriptions
   - Transactions
   - Analytics

## 🔧 Useful Commands

### Check Services Status
```bash
# Backend health
curl http://localhost:3000/health

# ML Service health
curl http://localhost:8000/health

# Redis
redis-cli ping

# PostgreSQL
psql -h 127.0.0.1 -U taliuser -d tali -c "SELECT 1;"
```

### Flutter Commands
```bash
# Check Flutter installation
/tmp/flutter/bin/flutter doctor

# Install dependencies
/tmp/flutter/bin/flutter pub get

# Run on Chrome (interactive)
/tmp/flutter/bin/flutter run -d chrome

# Analyze code
/tmp/flutter/bin/flutter analyze

# Run tests
/tmp/flutter/bin/flutter test

# Clean build
/tmp/flutter/bin/flutter clean
```

### Backend Commands
```bash
# View backend logs
tail -f logs/backend.log

# View ML service logs
tail -f logs/ml-service.log

# Restart backend
pkill -f "npm run dev"
cd backend && npm run dev
```

## 📱 Run on Other Platforms

### Chrome Browser (Interactive with DevTools)
```bash
/tmp/flutter/bin/flutter run -d chrome
```

### iOS Simulator (macOS only)
```bash
# List available simulators
/tmp/flutter/bin/flutter devices

# Run on iOS
/tmp/flutter/bin/flutter run -d ios
```

### Android Emulator
```bash
# Start emulator first, then:
/tmp/flutter/bin/flutter run -d android
```

## 🐛 Troubleshooting

### "Cannot find Flutter"
```bash
# Use full path
/tmp/flutter/bin/flutter --version

# Or add to PATH
export PATH="/tmp/flutter/bin:$PATH"
flutter --version
```

### Backend Not Responding
```bash
# Check if services are running
./test-app.sh

# Restart all services
./scripts/start-all.sh
```

### Port Already in Use
```bash
# Find process using port 5173
lsof -i :5173

# Kill it
kill -9 <PID>

# Or use different port
/tmp/flutter/bin/flutter run -d web-server --web-port 8080
```

### Database Connection Issues
```bash
# Check PostgreSQL
psql -h 127.0.0.1 -U taliuser -d tali -c "SELECT 1;"

# If not running, start it
./scripts/start-all.sh
```

## 🎨 Development Tips

### Hot Reload
When running in dev mode, press:
- **`r`** - Hot reload
- **`R`** - Hot restart
- **`q`** - Quit
- **`h`** - Help

### API Configuration
The app connects to `http://localhost:3000/api/v1` by default.

To change:
```bash
# Edit lib/core/config/api_config.dart
# Or use environment variable
flutter run -d chrome --dart-define=API_URL=https://your-api.com/api/v1
```

### Demo Login
The app uses demo UAE Pass authentication by default:
- Email: `demo@tali.app`
- Auto-logged in on callback

## 📊 Test Data

The demo user already has:
- Sample subscriptions
- Transaction history
- Dashboard data

All from the backend's demo mode!

## 🚀 Quick Start (One Command)

```bash
# Make sure you're in the project directory
cd /home/user/tali

# Run Flutter web app
/tmp/flutter/bin/flutter run -d web-server --web-port 5173
```

**That's it!** Open http://localhost:5173 and start testing! 🎉

## 📝 Next Steps

1. **Test Authentication**: Click "Login with UAE Pass"
2. **Explore Dashboard**: See subscription overview
3. **View Subscriptions**: Browse and filter
4. **Check Transactions**: View transaction history
5. **Test Filters**: Try different category filters

## 🆘 Need Help?

- View logs: `tail -f logs/backend.log`
- Check service status: `./test-app.sh`
- Flutter help: `/tmp/flutter/bin/flutter --help`
- Backend API docs: http://localhost:3000/health

---

**Happy Testing! 🚀**
