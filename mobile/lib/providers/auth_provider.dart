import 'package:flutter/foundation.dart';

import '../core/services/api_client.dart';
import '../core/services/secure_token_storage.dart';
import '../models/user.dart';
import '../services/auth_service.dart';
import '../utils/api_error.dart';

class AuthProvider extends ChangeNotifier {
  AuthProvider() {
    _apiClient.onUnauthorized = _clearSession;
  }

  final SecureTokenStorage _tokenStorage = SecureTokenStorage();
  late final ApiClient _apiClient = ApiClient(_tokenStorage);
  late final AuthService _authService = AuthService(_apiClient);

  User? user;
  bool bootstrapping = true;
  bool loading = false;
  String? error;

  bool get isAuthenticated => user != null;

  Future<void> bootstrap() async {
    final token = await _tokenStorage.getAccessToken();
    if (token == null || token.isEmpty) {
      bootstrapping = false;
      notifyListeners();
      return;
    }

    try {
      user = await _authService.me();
    } catch (_) {
      await _tokenStorage.clear();
      user = null;
    } finally {
      bootstrapping = false;
      notifyListeners();
    }
  }

  Future<bool> login({required String email, required String password}) async {
    return _runAuthAction(() => _authService.login(email: email, password: password));
  }

  Future<bool> register({
    required String fullName,
    required String email,
    required String password,
    String? phone,
    String role = 'CUSTOMER',
  }) async {
    return _runAuthAction(
      () => _authService.register(fullName: fullName, email: email, password: password, phone: phone, role: role),
    );
  }

  Future<void> logout() async {
    try {
      await _authService.logout();
    } catch (_) {
      // Local logout remains valid if the API token has already expired.
    } finally {
      await _clearSession();
    }
  }

  Future<void> clearSession() => _clearSession();

  Future<bool> _runAuthAction(Future<AuthResult> Function() action) async {
    loading = true;
    error = null;
    notifyListeners();
    try {
      final result = await action();
      await _tokenStorage.saveTokens(accessToken: result.accessToken, refreshToken: result.refreshToken);
      user = result.user;
      return true;
    } catch (exception) {
      error = apiErrorMessage(exception);
      return false;
    } finally {
      loading = false;
      notifyListeners();
    }
  }

  Future<void> _clearSession() async {
    await _tokenStorage.clear();
    user = null;
    notifyListeners();
  }
}
