import '../../../core/config/api_config.dart';
import '../../../core/utils/api_client.dart';
import '../../../data/models/subscription_model.dart';

class SubscriptionService {
  final ApiClient _apiClient = ApiClient();

  // Get all subscriptions
  Future<Map<String, dynamic>> getSubscriptions({String? status}) async {
    try {
      final queryParams =
          status != null ? {'status': status} : <String, dynamic>{};
      final response =
          await _apiClient.get(ApiConfig.subscriptions, queryParameters: queryParams);

      final data = response.data as Map<String, dynamic>;
      final subscriptions = (data['subscriptions'] as List)
          .map((json) => SubscriptionModel.fromJson(json))
          .toList();

      return {
        'subscriptions': subscriptions,
        'totals': data['totals'],
      };
    } catch (e) {
      throw Exception('Failed to fetch subscriptions: $e');
    }
  }

  // Get subscription by ID
  Future<SubscriptionModel> getSubscriptionById(String id) async {
    try {
      final response =
          await _apiClient.get(ApiConfig.subscriptionById(id));
      return SubscriptionModel.fromJson(response.data);
    } catch (e) {
      throw Exception('Failed to fetch subscription: $e');
    }
  }

  // Create subscription
  Future<SubscriptionModel> createSubscription(
      Map<String, dynamic> data) async {
    try {
      final response = await _apiClient.post(ApiConfig.subscriptions, data: data);
      return SubscriptionModel.fromJson(response.data);
    } catch (e) {
      throw Exception('Failed to create subscription: $e');
    }
  }

  // Update subscription
  Future<SubscriptionModel> updateSubscription(
      String id, Map<String, dynamic> data) async {
    try {
      final response =
          await _apiClient.put(ApiConfig.subscriptionById(id), data: data);
      return SubscriptionModel.fromJson(response.data);
    } catch (e) {
      throw Exception('Failed to update subscription: $e');
    }
  }

  // Delete subscription
  Future<void> deleteSubscription(String id) async {
    try {
      await _apiClient.delete(ApiConfig.subscriptionById(id));
    } catch (e) {
      throw Exception('Failed to delete subscription: $e');
    }
  }
}
