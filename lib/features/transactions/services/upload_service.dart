import 'package:dio/dio.dart';
import '../../../core/config/api_config.dart';
import '../../../core/utils/api_client.dart';
import 'package:flutter/foundation.dart' show kIsWeb;

class UploadService {
  final ApiClient _apiClient = ApiClient();

  // Upload bank statement - supports both file path (mobile) and bytes (web)
  Future<Map<String, dynamic>> uploadStatement(dynamic fileData, {String? filename}) async {
    try {
      MultipartFile multipartFile;
      
      if (kIsWeb) {
        // For web, fileData is List<int> bytes
        if (fileData is! List<int>) {
          throw Exception('Invalid file data for web upload');
        }
        multipartFile = MultipartFile.fromBytes(
          fileData,
          filename: filename ?? 'statement.pdf',
        );
      } else {
        // For mobile, fileData is String filePath
        if (fileData is! String) {
          throw Exception('Invalid file path for mobile upload');
        }
        multipartFile = await MultipartFile.fromFile(fileData);
      }

      final formData = FormData.fromMap({
        'statement': multipartFile,
      });

      final response = await _apiClient.dio.post(
        ApiConfig.uploadStatement,
        data: formData,
        options: Options(
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        ),
      );

      return response.data as Map<String, dynamic>;
    } catch (e) {
      if (e is DioException) {
        final errorMessage = e.response?.data?['error'] ?? e.message ?? 'Upload failed';
        throw Exception('Failed to upload statement: $errorMessage');
      }
      throw Exception('Failed to upload statement: $e');
    }
  }

  // Get statement processing status
  Future<Map<String, dynamic>> getStatementStatus(String statementId) async {
    try {
      final response = await _apiClient.get(
        '/upload/statements/$statementId',
      );
      return response.data as Map<String, dynamic>;
    } catch (e) {
      throw Exception('Failed to get statement status: $e');
    }
  }
}

