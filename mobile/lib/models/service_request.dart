import 'category.dart';
import 'user.dart';

/// Minimal artisan reference embedded in a service request (the request
/// endpoint nests the artisan's user record without its category/rating).
class RequestArtisan {
  const RequestArtisan({required this.id, required this.user});

  final String id;
  final User user;

  factory RequestArtisan.fromJson(Map<String, dynamic> json) {
    return RequestArtisan(id: json['id'] as String, user: User.fromJson(json['user'] as Map<String, dynamic>));
  }
}

class ServiceRequest {
  const ServiceRequest({
    required this.id,
    required this.title,
    required this.description,
    required this.status,
    this.location,
    this.budget,
    this.category,
    this.artisan,
    this.createdAt,
  });

  final String id;
  final String title;
  final String description;
  final String status;
  final String? location;
  final num? budget;
  final Category? category;
  final RequestArtisan? artisan;
  final DateTime? createdAt;

  static const _activeStatuses = {'PENDING', 'ASSIGNED', 'ACCEPTED', 'IN_PROGRESS'};

  bool get isActive => _activeStatuses.contains(status);
  bool get isCompleted => status == 'COMPLETED';
  bool get isCancelled => status == 'CANCELLED';

  factory ServiceRequest.fromJson(Map<String, dynamic> json) {
    return ServiceRequest(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String,
      status: json['status'] as String,
      location: json['location'] as String?,
      budget: json['budget'] as num?,
      category: json['category'] == null ? null : Category.fromJson(json['category'] as Map<String, dynamic>),
      artisan: json['artisan'] == null ? null : RequestArtisan.fromJson(json['artisan'] as Map<String, dynamic>),
      createdAt: json['createdAt'] == null ? null : DateTime.tryParse(json['createdAt'] as String),
    );
  }
}
