import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../config/api_config.dart';
import '../constants/app_constants.dart';

class ApiClient {
  static final ApiClient _instance = ApiClient._internal();
  factory ApiClient() => _instance;

  late Dio _dio;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  ApiClient._internal() {
    _dio = Dio(BaseOptions(
      baseUrl: ApiConfig.baseUrl,
      connectTimeout: ApiConfig.connectionTimeout,
      receiveTimeout: ApiConfig.receiveTimeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));

    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        // Add auth token to requests
        final token = await _storage.read(key: AppConstants.keyAccessToken);
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
      onError: (error, handler) async {
        // Handle 401 errors and refresh token
        if (error.response?.statusCode == 401) {
          try {
            await _refreshToken();
            // Retry the request
            final opts = error.requestOptions;
            final token = await _storage.read(key: AppConstants.keyAccessToken);
            opts.headers['Authorization'] = 'Bearer $token';
            final response = await _dio.fetch(opts);
            return handler.resolve(response);
          } catch (e) {
            // If refresh fails, clear tokens and redirect to login
            await _storage.delete(key: AppConstants.keyAccessToken);
            await _storage.delete(key: AppConstants.keyRefreshToken);
            return handler.next(error);
          }
        }
        return handler.next(error);
      },
    ));
  }

  Future<void> _refreshToken() async {
    final refreshToken =
        await _storage.read(key: AppConstants.keyRefreshToken);
    if (refreshToken == null) throw Exception('No refresh token');

    final response = await _dio.post(ApiConfig.refreshToken, data: {
      'refreshToken': refreshToken,
    });

    if (response.statusCode == 200) {
      final newAccessToken = response.data['accessToken'];
      final newRefreshToken = response.data['refreshToken'];
      await _storage.write(
          key: AppConstants.keyAccessToken, value: newAccessToken);
      await _storage.write(
          key: AppConstants.keyRefreshToken, value: newRefreshToken);
    }
  }

  Dio get dio => _dio;

  // GET request
  Future<Response> get(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    return await _dio.get(
      path,
      queryParameters: queryParameters,
      options: options,
    );
  }

  // POST request
  Future<Response> post(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    return await _dio.post(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
    );
  }

  // PUT request
  Future<Response> put(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    return await _dio.put(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
    );
  }

  // DELETE request
  Future<Response> delete(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    return await _dio.delete(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
    );
  }

  // PATCH request
  Future<Response> patch(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    return await _dio.patch(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
    );
  }
}
