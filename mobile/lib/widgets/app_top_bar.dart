import 'package:flutter/material.dart';

import '../core/config/app_theme.dart';
import 'glass_surface.dart';

/// Sticky top app bar shared by every authenticated screen: location pin +
/// wordmark on the left, a notifications bell on the right.
class AppTopBar extends StatelessWidget implements PreferredSizeWidget {
  const AppTopBar({super.key, this.onNotificationsTap, this.notificationCount = 0, this.leading});

  final VoidCallback? onNotificationsTap;
  final int notificationCount;
  final Widget? leading;

  @override
  Size get preferredSize => const Size.fromHeight(64);

  @override
  Widget build(BuildContext context) {
    return GlassSurface(
      border: Border(bottom: BorderSide(color: AppColors.outlineVariant.withValues(alpha: 0.2))),
      child: SafeArea(
        bottom: false,
        child: SizedBox(
          height: preferredSize.height,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                if (leading != null) leading! else const Icon(Icons.location_on, color: AppColors.primary),
                const SizedBox(width: 10),
                Text('FasoConnect', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontSize: 18)),
                const Spacer(),
                _NotificationButton(count: notificationCount, onTap: onNotificationsTap),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _NotificationButton extends StatelessWidget {
  const _NotificationButton({required this.count, this.onTap});

  final int count;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(AppRadius.full),
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Container(
            width: 40,
            height: 40,
            alignment: Alignment.center,
            decoration: const BoxDecoration(color: AppColors.surfaceContainerLow, shape: BoxShape.circle),
            child: const Icon(Icons.notifications_outlined, color: AppColors.onSurfaceVariant, size: 22),
          ),
          if (count > 0)
            Positioned(
              top: -2,
              right: -2,
              child: Container(
                width: 10,
                height: 10,
                decoration: const BoxDecoration(color: AppColors.primaryContainer, shape: BoxShape.circle),
              ),
            ),
        ],
      ),
    );
  }
}
