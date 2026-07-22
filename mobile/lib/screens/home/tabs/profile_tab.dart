import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../core/config/app_theme.dart';
import '../../../models/artisan.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/catalog_provider.dart';
import '../../../widgets/app_top_bar.dart';
import '../../artisan/artisan_profile_screen.dart';
import '../../request/history_screen.dart';
import '../notifications_sheet.dart';

class ProfileTab extends StatelessWidget {
  const ProfileTab({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final favorites = context.watch<CatalogProvider>().favorites;

    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppTopBar(onNotificationsTap: () => showNotificationsSheet(context)),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 20, 16, 32),
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(color: AppColors.surfaceContainerLowest, borderRadius: BorderRadius.circular(AppRadius.xl), boxShadow: AppShadows.ambient),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                CircleAvatar(
                  radius: 36,
                  backgroundColor: AppColors.surfaceContainerLow,
                  backgroundImage: auth.user?.profilePicture != null ? NetworkImage(auth.user!.profilePicture!) : null,
                  child: auth.user?.profilePicture == null ? const Icon(Icons.person, color: AppColors.primary, size: 34) : null,
                ),
                const SizedBox(height: 18),
                Text(auth.user?.fullName ?? '', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontSize: 22)),
                Text(auth.user?.email ?? '', style: Theme.of(context).textTheme.bodyMedium),
                const SizedBox(height: 10),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(color: AppColors.primaryFixed, borderRadius: BorderRadius.circular(AppRadius.full)),
                  child: Text(_roleLabel(auth.user?.role), style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w800, fontSize: 12)),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          _ProfileTile(
            icon: Icons.history,
            label: 'Historique des services',
            onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const HistoryScreen())),
          ),
          const SizedBox(height: 12),
          Text('Favoris', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontSize: 18)),
          const SizedBox(height: 12),
          if (favorites.isEmpty)
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(color: AppColors.surfaceContainerLow, borderRadius: BorderRadius.circular(AppRadius.lg)),
              child: Text('Aucun artisan favori pour le moment.', style: Theme.of(context).textTheme.bodyMedium),
            )
          else
            for (final artisan in favorites) _FavoriteTile(artisan: artisan),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: auth.logout,
              icon: const Icon(Icons.logout, color: AppColors.error),
              label: const Text('Se déconnecter', style: TextStyle(color: AppColors.error, fontWeight: FontWeight.w800)),
              style: OutlinedButton.styleFrom(
                minimumSize: const Size.fromHeight(52),
                side: const BorderSide(color: AppColors.error),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.full)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _roleLabel(String? role) {
    return switch (role) {
      'ARTISAN' => 'Artisan',
      'ADMIN' => 'Administrateur',
      _ => 'Client',
    };
  }
}

class _ProfileTile extends StatelessWidget {
  const _ProfileTile({required this.icon, required this.label, required this.onTap});

  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(AppRadius.md),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(color: AppColors.surfaceContainerLow, borderRadius: BorderRadius.circular(AppRadius.md)),
        child: Row(
          children: [
            Icon(icon, color: AppColors.primary),
            const SizedBox(width: 14),
            Expanded(child: Text(label, style: const TextStyle(fontWeight: FontWeight.w700))),
            const Icon(Icons.chevron_right, color: AppColors.onSurfaceVariant),
          ],
        ),
      ),
    );
  }
}

class _FavoriteTile extends StatelessWidget {
  const _FavoriteTile({required this.artisan});

  final Artisan artisan;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => ArtisanProfileScreen(artisanId: artisan.id))),
      borderRadius: BorderRadius.circular(AppRadius.lg),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(color: AppColors.surfaceContainerLowest, borderRadius: BorderRadius.circular(AppRadius.lg), boxShadow: AppShadows.ambient),
        child: Row(
          children: [
            CircleAvatar(
              radius: 24,
              backgroundColor: AppColors.surfaceContainerLow,
              backgroundImage: artisan.user.profilePicture != null ? NetworkImage(artisan.user.profilePicture!) : null,
              child: artisan.user.profilePicture == null ? const Icon(Icons.person, color: AppColors.primary) : null,
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(artisan.user.fullName, style: const TextStyle(fontWeight: FontWeight.w800)),
                  Text(artisan.category?.name ?? 'Artisan', style: Theme.of(context).textTheme.bodyMedium),
                ],
              ),
            ),
            const Icon(Icons.chevron_right, color: AppColors.onSurfaceVariant),
          ],
        ),
      ),
    );
  }
}
