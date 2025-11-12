import '../../../core/config/api_config.dart';
import '../../../core/utils/api_client.dart';
import '../../../data/models/transaction_model.dart';

class TransactionService {
  final ApiClient _apiClient = ApiClient();

  // Get all transactions
  Future<List<TransactionModel>> getTransactions({
    String? category,
    String? type,
    DateTime? startDate,
    DateTime? endDate,
    int? limit,
  }) async {
    try {
      final queryParams = <String, dynamic>{};
      if (category != null) queryParams['category'] = category;
      if (type != null) queryParams['type'] = type;
      if (startDate != null) queryParams['startDate'] = startDate.toIso8601String();
      if (endDate != null) queryParams['endDate'] = endDate.toIso8601String();
      if (limit != null) queryParams['limit'] = limit.toString();

      final response =
          await _apiClient.get(ApiConfig.transactions, queryParameters: queryParams);

      final data = response.data as Map<String, dynamic>;
      final transactions = (data['transactions'] as List)
          .map((json) => TransactionModel.fromJson(json))
          .toList();

      return transactions;
    } catch (e) {
      throw Exception('Failed to fetch transactions: $e');
    }
  }

  // Get transaction by ID
  Future<TransactionModel> getTransactionById(String id) async {
    try {
      final response =
          await _apiClient.get(ApiConfig.transactionById(id));
      return TransactionModel.fromJson(response.data);
    } catch (e) {
      throw Exception('Failed to fetch transaction: $e');
    }
  }
}
