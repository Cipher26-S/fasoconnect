import 'package:dio/dio.dart';

import '../config/app_config.dart';
import 'secure_token_storage.dart';

class ApiClient {
  ApiClient(this._tokenStorage) {
    dio = Dio(
      BaseOptions(
        baseUrl: AppConfig.apiBaseUrl,
        connectTimeout: const Duration(seconds: 20),
        receiveTimeout: const Duration(seconds: 20),
        headers: {'Content-Type': 'application/json'},
      ),
    );
    dio.interceptors.add(_authInterceptor());
  }

  final SecureTokenStorage _tokenStorage;
  late final Dio dio;
  Future<Response<dynamic>>? _refreshCall;
  void Function()? onUnauthorized;

  InterceptorsWrapper _authInterceptor() {
    return InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await _tokenStorage.getAccessToken();
        if (token != null && token.isNotEmpty) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
      onError: (error, handler) async {
        final status = error.response?.statusCode;
        final requestOptions = error.requestOptions;
        final alreadyRetried = requestOptions.extra['retried'] == true;

        if (status != 401 || alreadyRetried || requestOptions.path == '/api/auth/refresh') {
          handler.next(error);
          return;
        }

        final refreshToken = await _tokenStorage.getRefreshToken();
        if (refreshToken == null || refreshToken.isEmpty) {
          await _tokenStorage.clear();
          onUnauthorized?.call();
          handler.next(error);
          return;
        }

        try {
          _refreshCall ??= Dio(BaseOptions(baseUrl: AppConfig.apiBaseUrl)).post(
            '/api/auth/refresh',
            data: {'refreshToken': refreshToken},
          );
          final response = await _refreshCall!;
          _refreshCall = null;
          final data = response.data as Map<String, dynamic>;
          await _tokenStorage.saveTokens(
            accessToken: data['accessToken'] as String,
            refreshToken: data['refreshToken'] as String,
          );
          requestOptions.extra['retried'] = true;
          requestOptions.headers['Authorization'] = 'Bearer ${data['accessToken']}';
          final retry = await dio.fetch(requestOptions);
          handler.resolve(retry);
        } catch (_) {
          _refreshCall = null;
          await _tokenStorage.clear();
          onUnauthorized?.call();
          handler.next(error);
        }
      },
    );
  }
}
