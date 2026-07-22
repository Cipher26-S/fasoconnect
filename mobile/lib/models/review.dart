class Review {
  const Review({
    required this.id,
    required this.rating,
    this.comment,
    this.reviewerName,
  });

  final String id;
  final int rating;
  final String? comment;
  final String? reviewerName;

  factory Review.fromJson(Map<String, dynamic> json) {
    final reviewer = json['reviewer'] as Map<String, dynamic>?;
    return Review(
      id: json['id'] as String,
      rating: json['rating'] as int,
      comment: json['comment'] as String?,
      reviewerName: reviewer?['fullName'] as String?,
    );
  }
}
