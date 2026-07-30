import 'category.dart';

/// Lightweight contact record embedded in a service request response
/// (customer or artisan.user). Unlike [User], the request endpoint never
/// includes `role`/`status` for these nested records, so it uses its own
/// all-optional parser instead of reusing `User.fromJson`.
class ContactInfo {
  const ContactInfo({
    required this.id,
    required this.fullName,
    this.phone,
    this.city,
    this.country,
    this.profilePicture,
  });

  final String id;
  final String fullName;
  final String? phone;
  final String? city;
  final String? country;
  final String? profilePicture;

  factory ContactInfo.fromJson(Map<String, dynamic> json) {
    return ContactInfo(
      id: json['id'] as String,
      fullName: json['fullName'] as String,
      phone: json['phone'] as String?,
      city: json['city'] as String?,
      country: json['country'] as String?,
      profilePicture: json['profilePicture'] as String?,
    );
  }
}

/// Minimal artisan reference embedded in a service request (the request
/// endpoint nests the artisan's user record without its category/rating).
class RequestArtisan {
  const RequestArtisan({required this.id, required this.user});

  final String id;
  final ContactInfo user;

  factory RequestArtisan.fromJson(Map<String, dynamic> json) {
    return RequestArtisan(id: json['id'] as String, user: ContactInfo.fromJson(json['user'] as Map<String, dynamic>));
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
    this.customer,
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
  final ContactInfo? customer;
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
      customer: json['customer'] == null ? null : ContactInfo.fromJson(json['customer'] as Map<String, dynamic>),
      createdAt: json['createdAt'] == null ? null : DateTime.tryParse(json['createdAt'] as String),
    );
  }
}
