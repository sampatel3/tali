import 'package:flutter/foundation.dart';
import '../../../data/models/subscription_model.dart';
import '../services/subscription_service.dart';

class SubscriptionProvider with ChangeNotifier {
  final SubscriptionService _service = SubscriptionService();

  List<SubscriptionModel> _subscriptions = [];
  Map<String, dynamic>? _totals;
  bool _isLoading = false;
  String? _error;

  List<SubscriptionModel> get subscriptions => _subscriptions;
  Map<String, dynamic>? get totals => _totals;
  bool get isLoading => _isLoading;
  String? get error => _error;

  // Load subscriptions
  Future<void> loadSubscriptions({String? status}) async {
    try {
      print('🔄 SubscriptionProvider.loadSubscriptions() called');
      _isLoading = true;
      _error = null;
      notifyListeners();

      print('📞 Calling _service.getSubscriptions()...');
      final result = await _service.getSubscriptions(status: status);
      print('✅ Service returned: ${result.keys}');
      
      _subscriptions = result['subscriptions'] as List<SubscriptionModel>;
      _totals = result['totals'] as Map<String, dynamic>?;
      
      print('✅ Parsed ${_subscriptions.length} subscriptions');
      print('✅ Totals: $_totals');

      _isLoading = false;
      notifyListeners();
      print('✅ Notified listeners with ${_subscriptions.length} subscriptions');
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      print('❌ Error loading subscriptions: $e');
      print('❌ Stack trace: ${StackTrace.current}');
      notifyListeners();
    }
  }

  // Get active subscriptions
  List<SubscriptionModel> get activeSubscriptions =>
      _subscriptions.where((s) => s.status == 'active').toList();

  // Get paused subscriptions
  List<SubscriptionModel> get pausedSubscriptions =>
      _subscriptions.where((s) => s.status == 'paused').toList();

  // Get cancelled subscriptions
  List<SubscriptionModel> get cancelledSubscriptions =>
      _subscriptions.where((s) => s.status == 'cancelled').toList();

  // Delete subscription
  Future<bool> deleteSubscription(String id) async {
    try {
      await _service.deleteSubscription(id);
      _subscriptions.removeWhere((s) => s.id == id);
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  // Clear error
  void clearError() {
    _error = null;
    notifyListeners();
  }
}
