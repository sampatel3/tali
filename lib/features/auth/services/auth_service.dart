import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../../core/config/api_config.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/utils/api_client.dart';
import '../../../data/models/user_model.dart';

class AuthService {
  final ApiClient _apiClient = ApiClient();
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  // Login with username and password
  Future<UserModel> login(String username, String password) async {
    try {
      final response = await _apiClient.post(
        ApiConfig.login,
        data: {
          'username': username,
          'password': password,
        },
      );

      final data = response.data as Map<String, dynamic>;

      // Store tokens
      await _storage.write(
        key: AppConstants.keyAccessToken,
        value: data['accessToken'],
      );
      await _storage.write(
        key: AppConstants.keyRefreshToken,
        value: data['refreshToken'],
      );

      // Store user info
      final user = UserModel.fromJson(data['user']);
      await _storage.write(key: AppConstants.keyUserId, value: user.id);
      await _storage.write(key: AppConstants.keyUserEmail, value: user.email);
      await _storage.write(
          key: AppConstants.keyUserName, value: user.fullName ?? '');

      return user;
    } catch (e) {
      throw Exception('Failed to login: $e');
    }
  }

  // Initiate UAE Pass login
  Future<Map<String, dynamic>> initiateUAEPassLogin() async {
    try {
      final response = await _apiClient.post(ApiConfig.uaePassLogin);
      return response.data as Map<String, dynamic>;
    } catch (e) {
      throw Exception('Failed to initiate UAE Pass login: $e');
    }
  }

  // Handle UAE Pass callback
  Future<UserModel> handleUAEPassCallback(String code, String state) async {
    try {
      final response = await _apiClient.post(
        ApiConfig.uaePassCallback,
        data: {
          'code': code,
          'state': state,
        },
      );

      final data = response.data as Map<String, dynamic>;

      // Store tokens
      await _storage.write(
        key: AppConstants.keyAccessToken,
        value: data['accessToken'],
      );
      await _storage.write(
        key: AppConstants.keyRefreshToken,
        value: data['refreshToken'],
      );

      // Store user info
      final user = UserModel.fromJson(data['user']);
      await _storage.write(key: AppConstants.keyUserId, value: user.id);
      await _storage.write(key: AppConstants.keyUserEmail, value: user.email);
      await _storage.write(
          key: AppConstants.keyUserName, value: user.fullName ?? '');

      return user;
    } catch (e) {
      throw Exception('Failed to complete UAE Pass login: $e');
    }
  }

  // Refresh access token
  Future<void> refreshToken() async {
    try {
      final refreshToken =
          await _storage.read(key: AppConstants.keyRefreshToken);
      if (refreshToken == null) {
        throw Exception('No refresh token found');
      }

      final response = await _apiClient.post(
        ApiConfig.refreshToken,
        data: {'refreshToken': refreshToken},
      );

      final data = response.data as Map<String, dynamic>;
      await _storage.write(
        key: AppConstants.keyAccessToken,
        value: data['accessToken'],
      );
      await _storage.write(
        key: AppConstants.keyRefreshToken,
        value: data['refreshToken'],
      );
    } catch (e) {
      throw Exception('Failed to refresh token: $e');
    }
  }

  // Logout
  Future<void> logout() async {
    try {
      // Call logout API
      await _apiClient.post(ApiConfig.logout);
    } catch (e) {
      // Continue with local logout even if API call fails
    } finally {
      // Clear all stored data
      await _storage.delete(key: AppConstants.keyAccessToken);
      await _storage.delete(key: AppConstants.keyRefreshToken);
      await _storage.delete(key: AppConstants.keyUserId);
      await _storage.delete(key: AppConstants.keyUserEmail);
      await _storage.delete(key: AppConstants.keyUserName);
    }
  }

  // Check if user is logged in
  Future<bool> isLoggedIn() async {
    final token = await _storage.read(key: AppConstants.keyAccessToken);
    return token != null;
  }

  // Get stored user ID
  Future<String?> getUserId() async {
    return await _storage.read(key: AppConstants.keyUserId);
  }

  // Get stored access token
  Future<String?> getAccessToken() async {
    return await _storage.read(key: AppConstants.keyAccessToken);
  }
}
