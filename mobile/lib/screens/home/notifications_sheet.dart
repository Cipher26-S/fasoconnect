import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/config/app_theme.dart';
import '../../providers/workflow_provider.dart';

void showNotificationsSheet(BuildContext context) {
  showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    backgroundColor: AppColors.surface,
    shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.lg))),
    builder: (_) => const _NotificationsSheet(),
  );
}

class _NotificationsSheet extends StatelessWidget {
  const _NotificationsSheet();

  @override
  Widget build(BuildContext context) {
    final workflow = context.watch<WorkflowProvider>();
    return DraggableScrollableSheet(
      initialChildSize: 0.6,
      minChildSize: 0.3,
      maxChildSize: 0.9,
      expand: false,
      builder: (context, controller) {
        return Column(
          children: [
            const SizedBox(height: 12),
            Container(width: 40, height: 4, decoration: BoxDecoration(color: AppColors.outlineVariant, borderRadius: BorderRadius.circular(2))),
            Padding(
              padding: const EdgeInsets.all(20),
              child: Row(
                children: [
                  Text('Notifications', style: Theme.of(context).textTheme.titleLarge),
                ],
              ),
            ),
            Expanded(
              child: workflow.notifications.isEmpty
                  ? Center(child: Text('Aucune notification pour le moment.', style: Theme.of(context).textTheme.bodyMedium))
                  : ListView.builder(
                      controller: controller,
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      itemCount: workflow.notifications.length,
                      itemBuilder: (context, index) {
                        final item = workflow.notifications[index];
                        return Container(
                          margin: const EdgeInsets.only(bottom: 10),
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: item.isRead ? AppColors.surfaceContainerLow : AppColors.primaryFixed.withValues(alpha: 0.35),
                            borderRadius: BorderRadius.circular(AppRadius.md),
                          ),
                          child: InkWell(
                            onTap: () => context.read<WorkflowProvider>().readNotification(item.id),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(item.title, style: const TextStyle(fontWeight: FontWeight.w800)),
                                const SizedBox(height: 4),
                                Text(item.message, style: Theme.of(context).textTheme.bodyMedium),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
            ),
          ],
        );
      },
    );
  }
}
