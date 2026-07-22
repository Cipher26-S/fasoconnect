import 'package:dio/dio.dart';

String apiErrorMessage(Object error) {
  if (error is DioException) {
    final data = error.response?.data;
    if (data is Map<String, dynamic> && data['message'] is String) {
      return data['message'] as String;
    }
    return error.message ?? 'Une erreur est survenue.';
  }
  return 'Une erreur est survenue.';
}
