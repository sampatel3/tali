class AppConstants {
  // App info
  static const String appName = 'TALI';
  static const String appNameArabic = 'تالي';
  static const String appDescription =
      'Manage Subscriptions & Loyalty Programs across UAE & GCC';

  // Currencies
  static const String defaultCurrency = 'AED';
  static const Map<String, String> currencies = {
    'AED': 'د.إ',
    'SAR': 'ر.س',
    'USD': '\$',
  };

  // Date formats
  static const String dateFormat = 'MMM dd, yyyy';
  static const String shortDateFormat = 'MM/dd/yyyy';
  static const String timeFormat = 'hh:mm a';
  static const String dateTimeFormat = 'MMM dd, yyyy hh:mm a';

  // Pagination
  static const int defaultPageSize = 20;
  static const int maxPageSize = 100;

  // Subscription frequencies
  static const List<String> subscriptionFrequencies = [
    'daily',
    'weekly',
    'monthly',
    'quarterly',
    'yearly',
  ];

  // Subscription categories
  static const List<String> subscriptionCategories = [
    'entertainment',
    'utilities',
    'software',
    'fitness',
    'education',
    'food',
    'transport',
    'other',
  ];

  // Subscription statuses
  static const String statusActive = 'active';
  static const String statusPaused = 'paused';
  static const String statusCancelled = 'cancelled';

  // Storage keys
  static const String keyAccessToken = 'access_token';
  static const String keyRefreshToken = 'refresh_token';
  static const String keyUserId = 'user_id';
  static const String keyUserEmail = 'user_email';
  static const String keyUserName = 'user_name';
  static const String keyLanguage = 'language';
  static const String keyThemeMode = 'theme_mode';

  // Languages
  static const String languageEnglish = 'en';
  static const String languageArabic = 'ar';
}
