import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../providers/auth_provider.dart';

class UAEPassCallbackScreen extends StatefulWidget {
  final String code;
  final String state;

  const UAEPassCallbackScreen({
    super.key,
    required this.code,
    required this.state,
  });

  @override
  State<UAEPassCallbackScreen> createState() => _UAEPassCallbackScreenState();
}

class _UAEPassCallbackScreenState extends State<UAEPassCallbackScreen> {
  @override
  void initState() {
    super.initState();
    _handleCallback();
  }

  Future<void> _handleCallback() async {
    final authProvider = context.read<AuthProvider>();
    final success = await authProvider.completeLogin(widget.code, widget.state);

    if (mounted) {
      if (success) {
        context.go('/dashboard');
      } else {
        // Show error and go back to onboarding
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(authProvider.error ?? 'Login failed'),
            backgroundColor: Colors.red,
          ),
        );
        context.go('/');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(),
            SizedBox(height: 16),
            Text('Completing login...'),
          ],
        ),
      ),
    );
  }
}
