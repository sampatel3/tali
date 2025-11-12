import 'package:flutter/foundation.dart';
import '../../../data/models/user_model.dart';
import '../services/auth_service.dart';

enum AuthStatus {
  initial,
  authenticated,
  unauthenticated,
  loading,
}

class AuthProvider with ChangeNotifier {
  final AuthService _authService = AuthService();

  AuthStatus _status = AuthStatus.initial;
  UserModel? _user;
  String? _error;

  AuthStatus get status => _status;
  UserModel? get user => _user;
  String? get error => _error;
  bool get isAuthenticated => _status == AuthStatus.authenticated;

  // Initialize - check if user is already logged in
  Future<void> initialize() async {
    try {
      _status = AuthStatus.loading;
      notifyListeners();

      final isLoggedIn = await _authService.isLoggedIn();
      if (isLoggedIn) {
        _status = AuthStatus.authenticated;
        // In a real app, you'd fetch user details here
      } else {
        _status = AuthStatus.unauthenticated;
      }
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _status = AuthStatus.unauthenticated;
      notifyListeners();
    }
  }

  // Initiate UAE Pass login
  Future<String?> initiateLogin() async {
    try {
      _status = AuthStatus.loading;
      _error = null;
      notifyListeners();

      final response = await _authService.initiateUAEPassLogin();
      return response['authUrl'] as String?;
    } catch (e) {
      _error = e.toString();
      _status = AuthStatus.unauthenticated;
      notifyListeners();
      return null;
    }
  }

  // Complete login with callback
  Future<bool> completeLogin(String code, String state) async {
    try {
      _status = AuthStatus.loading;
      _error = null;
      notifyListeners();

      _user = await _authService.handleUAEPassCallback(code, state);
      _status = AuthStatus.authenticated;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _status = AuthStatus.unauthenticated;
      notifyListeners();
      return false;
    }
  }

  // Logout
  Future<void> logout() async {
    try {
      _status = AuthStatus.loading;
      notifyListeners();

      await _authService.logout();
      _user = null;
      _status = AuthStatus.unauthenticated;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  // Clear error
  void clearError() {
    _error = null;
    notifyListeners();
  }
}
