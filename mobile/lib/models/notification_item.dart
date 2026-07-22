class NotificationItem {
  const NotificationItem({required this.id, required this.title, required this.message, required this.isRead});

  final String id;
  final String title;
  final String message;
  final bool isRead;

  factory NotificationItem.fromJson(Map<String, dynamic> json) {
    return NotificationItem(
      id: json['id'] as String,
      title: json['title'] as String,
      message: json['message'] as String,
      isRead: json['isRead'] as bool? ?? false,
    );
  }
}
