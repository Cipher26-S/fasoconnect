import '../core/services/api_client.dart';
import '../models/notification_item.dart';
import '../models/service_request.dart';

class WorkflowService {
  const WorkflowService(this._apiClient);

  final ApiClient _apiClient;

  Future<List<ServiceRequest>> requests() async {
    final response = await _apiClient.dio.get('/api/service-requests', queryParameters: {'limit': 50});
    final data = response.data as Map<String, dynamic>;
    return (data['data'] as List<dynamic>).map((item) => ServiceRequest.fromJson(item as Map<String, dynamic>)).toList();
  }

  Future<void> createRequest(Map<String, dynamic> payload) async {
    await _apiClient.dio.post('/api/service-requests', data: payload);
  }

  Future<void> updateStatus(String id, String status) async {
    await _apiClient.dio.patch('/api/service-requests/$id/status', data: {'status': status});
  }

  Future<List<NotificationItem>> notifications() async {
    final response = await _apiClient.dio.get('/api/notifications', queryParameters: {'limit': 50});
    final data = response.data as Map<String, dynamic>;
    return (data['data'] as List<dynamic>).map((item) => NotificationItem.fromJson(item as Map<String, dynamic>)).toList();
  }

  Future<void> markNotificationRead(String id) async {
    await _apiClient.dio.patch('/api/notifications/$id/read');
  }

  Future<void> submitReview({required String serviceRequestId, required int rating, String? comment}) async {
    await _apiClient.dio.post('/api/reviews', data: {
      'serviceRequestId': serviceRequestId,
      'rating': rating,
      if (comment != null && comment.isNotEmpty) 'comment': comment,
    });
  }
}
