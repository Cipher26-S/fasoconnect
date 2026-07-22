import 'category.dart';
import 'user.dart';

class Artisan {
  const Artisan({
    required this.id,
    required this.user,
    this.category,
    this.verified = false,
    this.availability = true,
    this.experienceYears = 0,
    this.hourlyRate,
    this.averageRating,
    this.latitude,
    this.longitude,
  });

  final String id;
  final User user;
  final Category? category;
  final bool verified;
  final bool availability;
  final int experienceYears;
  final num? hourlyRate;
  final num? averageRating;
  final double? latitude;
  final double? longitude;

  bool get hasLocation => latitude != null && longitude != null;

  factory Artisan.fromJson(Map<String, dynamic> json) {
    return Artisan(
      id: json['id'] as String,
      user: User.fromJson(json['user'] as Map<String, dynamic>),
      category: json['category'] == null ? null : Category.fromJson(json['category'] as Map<String, dynamic>),
      verified: json['verified'] as bool? ?? false,
      availability: json['availability'] as bool? ?? true,
      experienceYears: json['experienceYears'] as int? ?? 0,
      hourlyRate: json['hourlyRate'] as num?,
      averageRating: json['averageRating'] as num?,
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
    );
  }
}
