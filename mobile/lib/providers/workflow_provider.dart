import 'package:flutter/foundation.dart';

import '../core/services/api_client.dart';
import '../core/services/secure_token_storage.dart';
import '../models/notification_item.dart';
import '../models/service_request.dart';
import '../services/workflow_service.dart';
import '../utils/api_error.dart';
import 'auth_provider.dart';

class WorkflowProvider extends ChangeNotifier {
  WorkflowProvider(AuthProvider authProvider) : _apiClient = ApiClient(SecureTokenStorage()) {
    _apiClient.onUnauthorized = () {
      authProvider.clearSession();
    };
    _service = WorkflowService(_apiClient);
  }

  final ApiClient _apiClient;
  late final WorkflowService _service;
  List<ServiceRequest> requests = [];
  List<ServiceRequest> openRequests = [];
  List<NotificationItem> notifications = [];
  bool loading = false;
  String? error;

  Future<void> load() async {
    loading = true;
    error = null;
    notifyListeners();
    try {
      requests = await _service.requests();
      notifications = await _service.notifications();
    } catch (exception) {
      error = apiErrorMessage(exception);
    } finally {
      loading = false;
      notifyListeners();
    }
  }

  Future<void> loadOpenRequests() async {
    try {
      openRequests = await _service.openRequestsForArtisan();
      notifyListeners();
    } catch (exception) {
      error = apiErrorMessage(exception);
      notifyListeners();
    }
  }

  Future<void> claim(String serviceRequestId, String artisanId) async {
    try {
      await _service.claimRequest(serviceRequestId: serviceRequestId, artisanId: artisanId);
      await loadOpenRequests();
      await load();
    } catch (exception) {
      error = apiErrorMessage(exception);
      notifyListeners();
    }
  }

  Future<void> createRequest(Map<String, dynamic> payload) async {
    await _service.createRequest(payload);
    await load();
  }

  Future<void> cancel(String id) async {
    try {
      await _service.updateStatus(id, 'CANCELLED');
      await load();
    } catch (exception) {
      error = apiErrorMessage(exception);
      notifyListeners();
    }
  }

  Future<void> readNotification(String id) async {
    try {
      await _service.markNotificationRead(id);
      await load();
    } catch (exception) {
      error = apiErrorMessage(exception);
      notifyListeners();
    }
  }

  Future<void> submitReview({required String serviceRequestId, required int rating, String? comment}) async {
    await _service.submitReview(serviceRequestId: serviceRequestId, rating: rating, comment: comment);
  }
}
