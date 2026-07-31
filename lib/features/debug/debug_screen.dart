import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/utils/api_client.dart';
import '../../core/config/api_config.dart';
import '../../features/auth/providers/auth_provider.dart';
import '../../features/transactions/providers/transaction_provider.dart';
import '../../features/subscriptions/providers/subscription_provider.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../core/constants/app_constants.dart';

class DebugScreen extends StatefulWidget {
  const DebugScreen({super.key});

  @override
  State<DebugScreen> createState() => _DebugScreenState();
}

class _DebugScreenState extends State<DebugScreen> {
  final List<String> _logs = [];
  bool _isLoading = false;

  void _addLog(String message) {
    setState(() {
      _logs.add('${DateTime.now().toString().substring(11, 19)}: $message');
    });
    print(message);
  }

  Future<void> _testToken() async {
    _addLog('🔍 Testing token storage...');
    final storage = const FlutterSecureStorage();
    final token = await storage.read(key: AppConstants.keyAccessToken);
    if (token != null) {
      _addLog('✅ Token found: ${token.substring(0, 30)}...');
    } else {
      _addLog('❌ NO TOKEN FOUND!');
    }
  }

  Future<void> _testDirectAPI() async {
    _addLog('🔍 Testing direct API call...');
    setState(() => _isLoading = true);
    
    try {
      final storage = const FlutterSecureStorage();
      final token = await storage.read(key: AppConstants.keyAccessToken);
      
      if (token == null) {
        _addLog('❌ Cannot test API - no token');
        return;
      }
      
      final apiClient = ApiClient();
      final response = await apiClient.get(ApiConfig.transactions, queryParameters: {'limit': '5'});
      
      _addLog('✅ API Response Status: ${response.statusCode}');
      _addLog('✅ Response keys: ${(response.data as Map).keys}');
      _addLog('✅ Transactions count: ${(response.data as Map)['transactions']?.length ?? 'null'}');
      
      if ((response.data as Map)['transactions'] != null) {
        final txs = (response.data as Map)['transactions'] as List;
        if (txs.isNotEmpty) {
          _addLog('✅ First transaction: ${txs[0]}');
        }
      }
    } catch (e) {
      _addLog('❌ API Error: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _testProvider() async {
    _addLog('🔍 Testing TransactionProvider...');
    setState(() => _isLoading = true);
    
    try {
      final provider = context.read<TransactionProvider>();
      await provider.loadTransactions();
      
      _addLog('✅ Provider transactions count: ${provider.transactions.length}');
      _addLog('✅ Provider isLoading: ${provider.isLoading}');
      _addLog('✅ Provider error: ${provider.error ?? 'none'}');
      
      if (provider.transactions.isNotEmpty) {
        _addLog('✅ First transaction: ${provider.transactions[0].merchantName} - ${provider.transactions[0].amount}');
      }
    } catch (e) {
      _addLog('❌ Provider Error: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _testSubscriptions() async {
    _addLog('🔍 Testing SubscriptionProvider...');
    setState(() => _isLoading = true);
    
    try {
      final provider = context.read<SubscriptionProvider>();
      await provider.loadSubscriptions();
      
      _addLog('✅ Provider subscriptions count: ${provider.subscriptions.length}');
      _addLog('✅ Provider isLoading: ${provider.isLoading}');
      _addLog('✅ Provider error: ${provider.error ?? 'none'}');
    } catch (e) {
      _addLog('❌ Provider Error: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Debug Screen'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                ElevatedButton(
                  onPressed: _isLoading ? null : _testToken,
                  child: const Text('Test Token'),
                ),
                ElevatedButton(
                  onPressed: _isLoading ? null : _testDirectAPI,
                  child: const Text('Test Direct API'),
                ),
                ElevatedButton(
                  onPressed: _isLoading ? null : _testProvider,
                  child: const Text('Test Provider'),
                ),
                ElevatedButton(
                  onPressed: _isLoading ? null : _testSubscriptions,
                  child: const Text('Test Subscriptions'),
                ),
                Consumer<AuthProvider>(
                  builder: (context, auth, _) => ElevatedButton(
                    onPressed: () {
                      _addLog('🔍 Auth Status: ${auth.status}');
                      _addLog('🔍 Auth User: ${auth.user?.email ?? 'null'}');
                      _addLog('🔍 Auth Error: ${auth.error ?? 'none'}');
                    },
                    child: const Text('Check Auth'),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: Container(
              margin: const EdgeInsets.all(16),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.grey[900],
                borderRadius: BorderRadius.circular(8),
              ),
              child: ListView.builder(
                itemCount: _logs.length,
                itemBuilder: (context, index) {
                  return Padding(
                    padding: const EdgeInsets.symmetric(vertical: 2),
                    child: Text(
                      _logs[index],
                      style: const TextStyle(
                        color: Colors.green,
                        fontFamily: 'monospace',
                        fontSize: 12,
                      ),
                    ),
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }
}

