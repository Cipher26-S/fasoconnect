import '../core/services/api_client.dart';
import '../models/artisan.dart';
import '../models/category.dart';
import '../models/review.dart';

class CatalogService {
  const CatalogService(this._apiClient);

  final ApiClient _apiClient;

  Future<List<Category>> categories() async {
    final response = await _apiClient.dio.get('/api/categories');
    final data = response.data as Map<String, dynamic>;
    return (data['data'] as List<dynamic>).map((item) => Category.fromJson(item as Map<String, dynamic>)).toList();
  }

  Future<Artisan> artisan(String id) async {
    final response = await _apiClient.dio.get('/api/artisans/$id');
    final data = response.data as Map<String, dynamic>;
    return Artisan.fromJson(data['data'] as Map<String, dynamic>);
  }

  Future<List<Review>> reviewsForUser(String userId) async {
    final response = await _apiClient.dio.get('/api/reviews', queryParameters: {'reviewee': userId, 'limit': 20});
    final data = response.data as Map<String, dynamic>;
    return (data['data'] as List<dynamic>).map((item) => Review.fromJson(item as Map<String, dynamic>)).toList();
  }

  Future<List<Artisan>> artisans({String? search}) async {
    final response = await _apiClient.dio.get('/api/artisans', queryParameters: {'limit': 30, if (search != null && search.isNotEmpty) 'search': search});
    final data = response.data as Map<String, dynamic>;
    return (data['data'] as List<dynamic>).map((item) => Artisan.fromJson(item as Map<String, dynamic>)).toList();
  }

  Future<List<Artisan>> recommendations({required String category}) async {
    final response = await _apiClient.dio.get('/api/recommendations/artisans', queryParameters: {'category': category, 'limit': 10});
    final data = response.data as Map<String, dynamic>;
    return (data['data'] as List<dynamic>).map((item) => Artisan.fromJson(item as Map<String, dynamic>)).toList();
  }

  Future<List<Artisan>> favorites() async {
    final response = await _apiClient.dio.get('/api/favorites/artisans', queryParameters: {'limit': 50});
    final data = response.data as Map<String, dynamic>;
    return (data['data'] as List<dynamic>).map((item) {
      final map = item as Map<String, dynamic>;
      return Artisan.fromJson((map['artisan'] as Map<String, dynamic>?) ?? map);
    }).toList();
  }

  Future<void> addFavorite(String artisanId) async {
    await _apiClient.dio.post('/api/favorites/artisans/$artisanId');
  }

  Future<void> removeFavorite(String artisanId) async {
    await _apiClient.dio.delete('/api/favorites/artisans/$artisanId');
  }
}
