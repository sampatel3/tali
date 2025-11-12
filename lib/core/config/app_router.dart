import 'package:go_router/go_router.dart';
import '../../features/auth/screens/onboarding_screen.dart';
import '../../features/auth/screens/uae_pass_callback_screen.dart';
import '../../features/dashboard/screens/dashboard_screen.dart';
import '../../features/subscriptions/screens/subscriptions_screen.dart';
import '../../features/subscriptions/screens/subscription_detail_screen.dart';
import '../../features/transactions/screens/transactions_screen.dart';

class AppRouter {
  static final GoRouter router = GoRouter(
    initialLocation: '/',
    routes: [
      GoRoute(
        path: '/',
        name: 'onboarding',
        builder: (context, state) => const OnboardingScreen(),
      ),
      GoRoute(
        path: '/auth/uaepass/callback',
        name: 'uae-pass-callback',
        builder: (context, state) {
          final code = state.uri.queryParameters['code'];
          final stateParam = state.uri.queryParameters['state'];
          return UAEPassCallbackScreen(
            code: code ?? '',
            state: stateParam ?? '',
          );
        },
      ),
      GoRoute(
        path: '/dashboard',
        name: 'dashboard',
        builder: (context, state) => const DashboardScreen(),
      ),
      GoRoute(
        path: '/subscriptions',
        name: 'subscriptions',
        builder: (context, state) => const SubscriptionsScreen(),
        routes: [
          GoRoute(
            path: ':id',
            name: 'subscription-detail',
            builder: (context, state) {
              final id = state.pathParameters['id']!;
              return SubscriptionDetailScreen(subscriptionId: id);
            },
          ),
        ],
      ),
      GoRoute(
        path: '/transactions',
        name: 'transactions',
        builder: (context, state) => const TransactionsScreen(),
      ),
    ],
  );
}
