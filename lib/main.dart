import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/config/app_router.dart';
import 'core/theme/app_theme.dart';
import 'features/auth/providers/auth_provider.dart';
import 'features/subscriptions/providers/subscription_provider.dart';
import 'features/transactions/providers/transaction_provider.dart';

void main() {
  runApp(const TaliApp());
}

class TaliApp extends StatelessWidget {
  const TaliApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()..initialize()),
        ChangeNotifierProvider(create: (_) => SubscriptionProvider()),
        ChangeNotifierProvider(create: (_) => TransactionProvider()),
      ],
      child: MaterialApp.router(
        title: 'TALI - تالي',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        darkTheme: AppTheme.darkTheme,
        themeMode: ThemeMode.light,
        routerConfig: AppRouter.router,
      ),
    );
  }
}
