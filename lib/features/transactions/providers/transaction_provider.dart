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
      _isLoading = true;
      _error = null;
      notifyListeners();

      _transactions = await _service.getTransactions(
        category: category,
        type: type,
        startDate: startDate,
        endDate: endDate,
      );

      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
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
