class User {
  const User({
    required this.id,
    required this.fullName,
    required this.email,
    required this.role,
    required this.status,
    this.phone,
    this.city,
    this.country,
    this.profilePicture,
    this.bio,
  });

  final String id;
  final String fullName;
  final String email;
  final String role;
  final String status;
  final String? phone;
  final String? city;
  final String? country;
  final String? profilePicture;
  final String? bio;

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      fullName: json['fullName'] as String,
      email: json['email'] as String,
      role: json['role'] as String,
      status: json['status'] as String,
      phone: json['phone'] as String?,
      city: json['city'] as String?,
      country: json['country'] as String?,
      profilePicture: json['profilePicture'] as String?,
      bio: json['bio'] as String?,
    );
  }
}
