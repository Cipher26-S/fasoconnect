import '../core/services/api_client.dart';
import '../models/user.dart';

class AuthResult {
  const AuthResult({required this.accessToken, required this.refreshToken, required this.user});

  final String accessToken;
  final String refreshToken;
  final User user;
}

class AuthService {
  const AuthService(this._apiClient);

  final ApiClient _apiClient;

  Future<AuthResult> login({required String email, required String password}) async {
    final response = await _apiClient.dio.post('/api/auth/login', data: {'email': email, 'password': password});
    return _authResultFromJson(response.data as Map<String, dynamic>);
  }

  Future<AuthResult> register({
    required String fullName,
    required String email,
    required String password,
    String? phone,
    String role = 'CUSTOMER',
  }) async {
    final response = await _apiClient.dio.post(
      '/api/auth/register',
      data: {
        'fullName': fullName,
        'email': email,
        'password': password,
        if (phone != null && phone.isNotEmpty) 'phone': phone,
        'role': role,
      },
    );
    return _authResultFromJson(response.data as Map<String, dynamic>);
  }

  Future<User> me() async {
    final response = await _apiClient.dio.get('/api/auth/me');
    final data = response.data as Map<String, dynamic>;
    return User.fromJson(data['user'] as Map<String, dynamic>);
  }

  Future<void> logout() async {
    await _apiClient.dio.post('/api/auth/logout');
  }

  AuthResult _authResultFromJson(Map<String, dynamic> json) {
    return AuthResult(
      accessToken: json['accessToken'] as String,
      refreshToken: json['refreshToken'] as String,
      user: User.fromJson(json['user'] as Map<String, dynamic>),
    );
  }
}
