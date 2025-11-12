# TALI Flutter App

TALI (تالي) is a comprehensive subscription and loyalty management platform built with Flutter, supporting web, iOS, and Android from a single codebase.

## 🚀 Features

- **Multi-Platform Support**: Web, iOS, and Android
- **UAE Pass Authentication**: Secure login with UAE Pass integration
- **Subscription Management**: Track, manage, and analyze subscriptions
- **Transaction Tracking**: View and filter all your transactions
- **Interactive Charts**: Visualize payment history and spending patterns
- **Modern UI**: Material Design 3 with wio.io-inspired design
- **State Management**: Provider pattern for efficient state handling
- **API Integration**: Dio-based HTTP client with auto token refresh

## 📋 Prerequisites

- **Flutter SDK**: 3.9.2 or higher
- **Dart SDK**: Included with Flutter
- **For Web**: Chrome browser
- **For iOS**: macOS with Xcode 14+
- **For Android**: Android Studio with Android SDK

## 🛠 Installation

### 1. Install Flutter

**Linux/macOS**:
```bash
git clone https://github.com/flutter/flutter.git -b stable
export PATH="$PATH:`pwd`/flutter/bin"
```

**Windows**:
Download from https://docs.flutter.dev/get-started/install/windows

### 2. Verify Installation
```bash
flutter doctor
```

### 3. Install Dependencies
```bash
flutter pub get
```

## 🏃 Running the App

### Web
```bash
# Development mode
flutter run -d chrome

# Production build
flutter build web --release

# Serve the built web app
cd build/web
python3 -m http.server 8000
```

### iOS (macOS only)
```bash
# Open iOS project in Xcode
open ios/Runner.xcworkspace

# Or run from terminal
flutter run -d ios

# Build for release
flutter build ios --release
```

### Android
```bash
# Run on connected device/emulator
flutter run -d android

# Build APK
flutter build apk --release

# Build App Bundle
flutter build appbundle --release
```

## 🏗 Project Structure

```
lib/
├── core/
│   ├── config/              # API & Router configuration
│   │   ├── api_config.dart
│   │   └── app_router.dart
│   ├── constants/           # App-wide constants
│   │   └── app_constants.dart
│   ├── theme/              # Theme configuration
│   │   └── app_theme.dart
│   └── utils/              # Utilities & helpers
│       └── api_client.dart
├── data/
│   └── models/             # Data models
│       ├── user_model.dart
│       ├── subscription_model.dart
│       └── transaction_model.dart
├── features/
│   ├── auth/               # Authentication feature
│   │   ├── providers/
│   │   ├── screens/
│   │   └── services/
│   ├── subscriptions/      # Subscriptions feature
│   │   ├── providers/
│   │   ├── screens/
│   │   └── services/
│   ├── transactions/       # Transactions feature
│   │   ├── providers/
│   │   ├── screens/
│   │   └── services/
│   └── dashboard/          # Dashboard feature
│       └── screens/
└── main.dart               # App entry point
```

## 🔧 Configuration

### API Endpoint

Update the API URL in `lib/core/config/api_config.dart`:

```dart
static const String baseUrl = String.fromEnvironment(
  'API_URL',
  defaultValue: 'http://localhost:3000/api/v1',
);
```

Or set environment variable when running:
```bash
flutter run --dart-define=API_URL=https://api.yourserver.com/api/v1
```

### App Configuration

Key constants are in `lib/core/constants/app_constants.dart`:
- Currency settings
- Date formats
- Storage keys
- Subscription categories

## 📦 Key Dependencies

- **provider**: State management
- **go_router**: Navigation and routing
- **dio**: HTTP client
- **flutter_secure_storage**: Secure token storage
- **fl_chart**: Charts and data visualization
- **syncfusion_flutter_charts**: Advanced charts

## 🎨 Theming

The app uses Material Design 3 with a custom color scheme:
- Primary: Indigo (#6366F1)
- Secondary: Purple (#8B5CF6)
- Accent: Green (#10B981)

Customize in `lib/core/theme/app_theme.dart`

## 📱 Screens

### Authentication
- **Onboarding**: Welcome screen with login
- **UAE Pass Callback**: Handles authentication callback

### Main App
- **Dashboard**: Overview of subscriptions and spending
- **Subscriptions**: List and manage subscriptions
- **Subscription Detail**: Detailed view with charts
- **Transactions**: View and filter all transactions

## 🔐 Authentication Flow

1. User taps "Login with UAE Pass"
2. App initiates UAE Pass OAuth flow
3. User authenticates via UAE Pass
4. App receives callback with auth code
5. Backend exchanges code for tokens
6. Tokens stored securely
7. User redirected to dashboard

## 🧪 Testing

```bash
# Run all tests
flutter test

# Run with coverage
flutter test --coverage

# Widget tests
flutter test test/widget_test.dart
```

## 📊 Building for Production

### Web
```bash
flutter build web --release
# Output: build/web/
```

### iOS
```bash
flutter build ios --release
# Then archive in Xcode for App Store
```

### Android
```bash
# APK for direct distribution
flutter build apk --release

# App Bundle for Play Store
flutter build appbundle --release
```

## 🐛 Debugging

### Enable verbose logging
```bash
flutter run --verbose
```

### View device logs
```bash
flutter logs
```

### Inspect UI
```dart
# Add to your widget
debugPrint('Debug info: $variable');
```

## 🚢 Deployment

### Web
Deploy `build/web/` to any static hosting:
- Firebase Hosting
- Netlify
- Vercel
- GitHub Pages

### iOS App Store
1. Build in Xcode
2. Archive the app
3. Upload via Xcode Organizer

### Google Play Store
1. Build app bundle: `flutter build appbundle`
2. Upload to Play Console
3. Fill in store listing
4. Submit for review

## 🔄 Backend Integration

The Flutter app connects to a Node.js/Express backend:
- **Base URL**: Configured in `api_config.dart`
- **Auth**: JWT tokens with auto-refresh
- **Storage**: Secure storage for sensitive data

Ensure backend is running on `http://localhost:3000` or update the API URL.

## 📝 Environment Variables

```bash
# API URL
API_URL=https://api.yourserver.com/api/v1

# Build with env vars
flutter run --dart-define=API_URL=$API_URL
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Troubleshooting

### Flutter doctor issues
```bash
flutter doctor --verbose
flutter doctor --android-licenses  # Accept Android licenses
```

### Dependency conflicts
```bash
flutter pub cache clean
flutter pub get
```

### Build errors
```bash
flutter clean
flutter pub get
flutter run
```

### iOS CocoaPods issues
```bash
cd ios
pod install
cd ..
flutter run
```

## 📞 Support

For issues and questions:
- Check existing issues on GitHub
- Create a new issue with details
- Include Flutter doctor output

## 🎯 Roadmap

- [ ] Loyalty programs integration
- [ ] Analytics dashboard
- [ ] PDF statement upload
- [ ] Multi-currency support
- [ ] Notifications
- [ ] Offline mode
- [ ] Data export
- [ ] Dark mode toggle

---

**Made with ❤️ using Flutter**
