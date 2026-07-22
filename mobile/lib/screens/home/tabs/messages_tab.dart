import 'package:flutter/material.dart';

import '../../../core/config/app_theme.dart';
import '../../../widgets/app_top_bar.dart';
import '../notifications_sheet.dart';

/// Messaging has no backend yet (no /api/messages module), so this tab is a
/// clearly-labelled placeholder rather than a broken chat screen.
class MessagesTab extends StatelessWidget {
  const MessagesTab({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppTopBar(onNotificationsTap: () => showNotificationsSheet(context)),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 88,
                height: 88,
                decoration: BoxDecoration(color: AppColors.surfaceContainerLow, shape: BoxShape.circle),
                child: const Icon(Icons.chat_bubble_outline, color: AppColors.primary, size: 36),
              ),
              const SizedBox(height: 20),
              Text('Messagerie bientôt disponible', style: Theme.of(context).textTheme.titleLarge, textAlign: TextAlign.center),
              const SizedBox(height: 10),
              Text(
                'En attendant, contactez vos artisans directement par appel ou WhatsApp depuis leur profil.',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
