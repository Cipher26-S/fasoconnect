class Category {
  const Category({required this.id, required this.name, this.description});

  final String id;
  final String name;
  final String? description;

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
    );
  }
}
