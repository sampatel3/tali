class ApiConfig {
  // Base URLs
  static const String baseUrl = String.fromEnvironment(
    'API_URL',
    defaultValue: 'http://localhost:3000/api/v1',
  );

  // Auth endpoints
  static const String login = '/auth/login';
  static const String uaePassLogin = '/auth/uae-pass/login';
  static const String uaePassCallback = '/auth/uae-pass/callback';
  static const String refreshToken = '/auth/refresh-token';
  static const String logout = '/auth/logout';

  // Subscriptions endpoints
  static const String subscriptions = '/subscriptions';
  static String subscriptionById(String id) => '/subscriptions/$id';

  // Transactions endpoints
  static const String transactions = '/transactions';
  static String transactionById(String id) => '/transactions/$id';

  // Accounts endpoints
  static const String accounts = '/accounts';
  static String accountById(String id) => '/accounts/$id';

  // Loyalty endpoints
  static const String loyalty = '/loyalty';
  static const String loyaltyPrograms = '/loyalty/programs';
  static String loyaltyProgramById(String id) => '/loyalty/programs/$id';

  // Analytics endpoints
  static const String analytics = '/analytics';
  static const String analyticsOverview = '/analytics/overview';
  static const String analyticsSpending = '/analytics/spending';

  // Upload endpoints
  static const String uploadStatement = '/upload/statement';

  // Settings endpoints
  static const String userSettings = '/users/settings';

  // Timeout duration
  static const Duration connectionTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);
}
