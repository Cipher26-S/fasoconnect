import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../core/config/app_theme.dart';
import '../../../models/service_request.dart';
import '../../../providers/workflow_provider.dart';
import '../../../widgets/app_top_bar.dart';
import '../../request/history_screen.dart';
import '../../request/rating_screen.dart';
import '../../request/tracking_screen.dart';
import '../notifications_sheet.dart';

class RequestsTab extends StatelessWidget {
  const RequestsTab({super.key});

  @override
  Widget build(BuildContext context) {
    final workflow = context.watch<WorkflowProvider>();
    final active = workflow.requests.where((r) => r.isActive).toList();
    final recentlyCompleted = workflow.requests.where((r) => r.isCompleted).take(2).toList();

    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppTopBar(onNotificationsTap: () => showNotificationsSheet(context)),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 20, 16, 32),
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Mes demandes', style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontSize: 26)),
              TextButton(
                onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const HistoryScreen())),
                child: const Text('HISTORIQUE', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w800, fontSize: 12)),
              ),
            ],
          ),
          const SizedBox(height: 8),
          if (workflow.error != null) Text(workflow.error!, style: const TextStyle(color: AppColors.error, fontWeight: FontWeight.w700)),
          if (active.isEmpty)
            Container(
              margin: const EdgeInsets.only(top: 12),
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(color: AppColors.surfaceContainerLow, borderRadius: BorderRadius.circular(AppRadius.lg)),
              child: Column(
                children: [
                  const Icon(Icons.assignment_turned_in_outlined, size: 40, color: AppColors.onSurfaceVariant),
                  const SizedBox(height: 12),
                  Text('Aucune demande active pour le moment.', textAlign: TextAlign.center, style: Theme.of(context).textTheme.bodyMedium),
                ],
              ),
            )
          else
            for (final request in active) _ActiveRequestCard(request: request),
          if (recentlyCompleted.isNotEmpty) ...[
            const SizedBox(height: 24),
            Text('Récemment terminées', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontSize: 18)),
            const SizedBox(height: 12),
            for (final request in recentlyCompleted) _CompletedRequestCard(request: request),
          ],
        ],
      ),
    );
  }
}

class _ActiveRequestCard extends StatelessWidget {
  const _ActiveRequestCard({required this.request});

  final ServiceRequest request;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(color: AppColors.surfaceContainerLowest, borderRadius: BorderRadius.circular(AppRadius.lg), boxShadow: AppShadows.ambient),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(child: Text(request.title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800))),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(color: AppColors.primaryFixed, borderRadius: BorderRadius.circular(AppRadius.full)),
                child: Text(_statusLabel(request.status), style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w800, fontSize: 11)),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(request.description, maxLines: 2, overflow: TextOverflow.ellipsis, style: Theme.of(context).textTheme.bodyMedium),
          const SizedBox(height: 14),
          Row(
            children: [
              if (request.artisan != null)
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => TrackingScreen(request: request))),
                    icon: const Icon(Icons.map_outlined, size: 18),
                    label: const Text('Suivre'),
                    style: OutlinedButton.styleFrom(foregroundColor: AppColors.onSurface, side: BorderSide(color: AppColors.outlineVariant.withValues(alpha: 0.4)), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.full))),
                  ),
                ),
              if (request.artisan != null) const SizedBox(width: 10),
              Expanded(
                child: TextButton(
                  onPressed: () => context.read<WorkflowProvider>().cancel(request.id),
                  style: TextButton.styleFrom(foregroundColor: AppColors.error),
                  child: const Text('Annuler', style: TextStyle(fontWeight: FontWeight.w800)),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  String _statusLabel(String status) {
    return switch (status) {
      'PENDING' => 'En attente',
      'ASSIGNED' => 'Assigné',
      'ACCEPTED' => 'Accepté',
      'IN_PROGRESS' => 'En cours',
      _ => status,
    };
  }
}

class _CompletedRequestCard extends StatelessWidget {
  const _CompletedRequestCard({required this.request});

  final ServiceRequest request;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: AppColors.surfaceContainerLow, borderRadius: BorderRadius.circular(AppRadius.lg)),
      child: Row(
        children: [
          const Icon(Icons.check_circle, color: AppColors.primary),
          const SizedBox(width: 12),
          Expanded(child: Text(request.title, style: const TextStyle(fontWeight: FontWeight.w700))),
          TextButton(
            onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => RatingScreen(request: request))),
            child: const Text('Noter', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w800)),
          ),
        ],
      ),
    );
  }
}
