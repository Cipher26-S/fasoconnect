import 'package:flutter/foundation.dart';

import '../core/services/api_client.dart';
import '../core/services/secure_token_storage.dart';
import '../models/artisan.dart';
import '../models/category.dart' as model;
import '../models/review.dart';
import '../services/catalog_service.dart';
import '../utils/api_error.dart';
import 'auth_provider.dart';

class CatalogProvider extends ChangeNotifier {
  CatalogProvider(AuthProvider authProvider) : _apiClient = ApiClient(SecureTokenStorage()) {
    _apiClient.onUnauthorized = () {
      authProvider.clearSession();
    };
    _service = CatalogService(_apiClient);
  }

  final ApiClient _apiClient;
  late final CatalogService _service;
  List<model.Category> categories = [];
  List<Artisan> artisans = [];
  List<Artisan> recommendations = [];
  List<Artisan> favorites = [];
  bool loading = false;
  String? error;

  Future<void> load({String? search}) async {
    loading = true;
    error = null;
    notifyListeners();
    try {
      categories = await _service.categories();
      artisans = await _service.artisans(search: search);
      recommendations = categories.isEmpty ? [] : await _service.recommendations(category: categories.first.name);
      favorites = await _service.favorites();
    } catch (exception) {
      error = apiErrorMessage(exception);
    } finally {
      loading = false;
      notifyListeners();
    }
  }

  Future<List<Artisan>> findRecommendations({required String category}) {
    return _service.recommendations(category: category);
  }

  Future<Artisan> artisanDetail(String id) => _service.artisan(id);

  Future<List<Review>> reviewsForUser(String userId) => _service.reviewsForUser(userId);

  Future<void> toggleFavorite(String artisanId) async {
    try {
      await _service.addFavorite(artisanId);
    } catch (_) {
      await _service.removeFavorite(artisanId);
    }
    await load();
  }
}
