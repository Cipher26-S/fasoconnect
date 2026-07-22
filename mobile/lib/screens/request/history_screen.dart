import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/config/app_theme.dart';
import '../../models/service_request.dart';
import '../../providers/workflow_provider.dart';
import '../artisan/artisan_profile_screen.dart';
import 'rating_screen.dart';

class HistoryScreen extends StatelessWidget {
  const HistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final workflow = context.watch<WorkflowProvider>();
    final history = workflow.requests.where((r) => r.isCompleted || r.isCancelled).toList();

    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(title: const Text('Historique')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 32),
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Historique', style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontSize: 26)),
              Text('${history.length} SERVICES', style: Theme.of(context).textTheme.labelSmall),
            ],
          ),
          const SizedBox(height: 8),
          Text('Retrouvez toutes vos interventions passées et commandez à nouveau vos artisans favoris en un clic.', style: Theme.of(context).textTheme.bodyMedium),
          const SizedBox(height: 20),
          if (history.isEmpty)
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(color: AppColors.surfaceContainerLow, borderRadius: BorderRadius.circular(AppRadius.lg)),
              child: Text('Aucun service terminé pour le moment.', style: Theme.of(context).textTheme.bodyMedium),
            ),
          for (final request in history) _HistoryCard(request: request),
        ],
      ),
    );
  }
}

class _HistoryCard extends StatelessWidget {
  const _HistoryCard({required this.request});

  final ServiceRequest request;

  @override
  Widget build(BuildContext context) {
    final completed = request.isCompleted;
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: AppColors.surfaceContainerLowest, borderRadius: BorderRadius.circular(AppRadius.lg), boxShadow: AppShadows.ambient),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: completed ? AppColors.surfaceContainerHigh : AppColors.errorContainer,
                  borderRadius: BorderRadius.circular(AppRadius.sm),
                ),
                child: Icon(completed ? Icons.check_circle : Icons.cancel, color: completed ? AppColors.primary : AppColors.error, size: 22),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text((request.category?.name ?? 'Service').toUpperCase(), style: const TextStyle(color: AppColors.primary, fontSize: 11, fontWeight: FontWeight.w800)),
                    Text(request.artisan?.user.fullName ?? request.title, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
                    Text(
                      completed
                          ? '${request.budget != null ? '${request.budget} FCFA' : 'Tarif non renseigné'}${request.createdAt != null ? ' • ${_formatDate(request.createdAt!)}' : ''}'
                          : 'Annulé${request.createdAt != null ? ' • ${_formatDate(request.createdAt!)}' : ''}',
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              if (request.artisan != null)
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => ArtisanProfileScreen(artisanId: request.artisan!.id))),
                    style: OutlinedButton.styleFrom(foregroundColor: AppColors.onSurface, side: BorderSide(color: AppColors.outlineVariant.withValues(alpha: 0.4)), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.full))),
                    child: const Text('Détails'),
                  ),
                ),
              if (request.artisan != null) const SizedBox(width: 10),
              Expanded(
                child: ElevatedButton(
                  onPressed: () => completed
                      ? Navigator.of(context).push(MaterialPageRoute(builder: (_) => RatingScreen(request: request)))
                      : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    disabledBackgroundColor: AppColors.surfaceContainerHigh,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.full)),
                  ),
                  child: Text(completed ? 'Noter le service' : 'Réserver un autre'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) => '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}';
}
