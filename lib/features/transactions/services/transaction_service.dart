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
      final queryParams = <String, dynamic>{
        'limit': '1000', // Request more transactions by default
      };
      if (category != null) queryParams['category'] = category;
      if (type != null) queryParams['type'] = type;
      if (startDate != null) queryParams['startDate'] = startDate.toIso8601String();
      if (endDate != null) queryParams['endDate'] = endDate.toIso8601String();
      if (limit != null) queryParams['limit'] = limit.toString();

      final response =
          await _apiClient.get(ApiConfig.transactions, queryParameters: queryParams);

      final data = response.data as Map<String, dynamic>;
      
      // Debug: log response structure
      print('API Response keys: ${data.keys}');
      print('Transactions count in response: ${data['transactions']?.length ?? 'null'}');
      
      if (data['transactions'] == null) {
        throw Exception('Invalid response: transactions field missing. Response keys: ${data.keys}');
      }
      
      final transactionsList = data['transactions'] as List;
      print('Parsing ${transactionsList.length} transactions...');
      
      int successCount = 0;
      int errorCount = 0;
      final transactions = transactionsList
          .map((json) {
            try {
              final txn = TransactionModel.fromJson(json as Map<String, dynamic>);
              successCount++;
              return txn;
            } catch (e, stackTrace) {
              // Log parsing errors but continue
              errorCount++;
              print('❌ Error parsing transaction: $e');
              print('❌ Stack: $stackTrace');
              print('❌ JSON keys: ${(json as Map).keys}');
              if (json is Map && json.containsKey('amount')) {
                print('❌ Amount value: ${json['amount']} (type: ${json['amount'].runtimeType})');
              }
              if (json is Map && json.containsKey('date')) {
                print('❌ Date value: ${json['date']} (type: ${json['date'].runtimeType})');
              }
              return null;
            }
          })
          .whereType<TransactionModel>()
          .toList();
      
      print('✅ Successfully parsed $successCount transactions');
      if (errorCount > 0) {
        print('❌ Failed to parse $errorCount transactions');
      }

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
