import 'package:flutter/foundation.dart';
import '../../../data/models/transaction_model.dart';
import '../services/transaction_service.dart';

class TransactionProvider with ChangeNotifier {
  final TransactionService _service = TransactionService();

  List<TransactionModel> _transactions = [];
  bool _isLoading = false;
  String? _error;

  List<TransactionModel> get transactions => _transactions;
  bool get isLoading => _isLoading;
  String? get error => _error;

  // Load transactions
  Future<void> loadTransactions({
    String? category,
    String? type,
    DateTime? startDate,
    DateTime? endDate,
  }) async {
    try {
      print('🔄 TransactionProvider.loadTransactions() called');
      _isLoading = true;
      _error = null;
      notifyListeners();

      print('📞 Calling _service.getTransactions()...');
      print('📞 Parameters: category=$category, type=$type, startDate=$startDate, endDate=$endDate');
      
      final result = await _service.getTransactions(
        category: category,
        type: type,
        startDate: startDate,
        endDate: endDate,
      );
      
      print('📦 Service returned list with ${result.length} items');
      print('📦 First transaction (if any): ${result.isNotEmpty ? result[0].merchantName : 'none'}');
      
      _transactions = result;

      print('✅ Received ${_transactions.length} transactions from service');
      _isLoading = false;
      notifyListeners();
      print('✅ Notified listeners with ${_transactions.length} transactions');
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      print('❌ Error loading transactions: $e');
      print('❌ Stack trace: ${StackTrace.current}');
      notifyListeners();
    }
  }

  // Get transactions by category
  List<TransactionModel> getByCategory(String category) =>
      _transactions.where((t) => t.category == category).toList();

  // Get transactions by type
  List<TransactionModel> getByType(String type) =>
      _transactions.where((t) => t.type == type).toList();

  // Get subscription-related transactions
  List<TransactionModel> get subscriptionTransactions =>
      _transactions.where((t) => t.isSubscription == true).toList();

  // Calculate total spending
  double get totalSpending {
    return _transactions.fold(
        0.0, (sum, txn) => sum + (txn.type == 'debit' ? txn.amount : 0));
  }

  // Clear error
  void clearError() {
    _error = null;
    notifyListeners();
  }
}
