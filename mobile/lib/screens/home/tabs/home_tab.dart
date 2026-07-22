import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../core/config/app_theme.dart';
import '../../../providers/catalog_provider.dart';
import '../../../providers/workflow_provider.dart';
import '../../../utils/category_icons.dart';
import '../../../widgets/app_top_bar.dart';
import '../../../widgets/nearby_artisans_map.dart';
import '../../matching/auto_match_screen.dart';
import '../notifications_sheet.dart';

class HomeTab extends StatelessWidget {
  const HomeTab({super.key, required this.onFindNow});

  final VoidCallback onFindNow;

  @override
  Widget build(BuildContext context) {
    final catalog = context.watch<CatalogProvider>();
    final workflow = context.watch<WorkflowProvider>();
    final city = catalog.artisans.isNotEmpty ? (catalog.artisans.first.user.city ?? 'Ouagadougou') : 'Ouagadougou';
    final unread = workflow.notifications.where((n) => !n.isRead).length;

    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppTopBar(
        notificationCount: unread,
        onNotificationsTap: () => showNotificationsSheet(context),
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          final catalogProvider = context.read<CatalogProvider>();
          final workflowProvider = context.read<WorkflowProvider>();
          await catalogProvider.load();
          await workflowProvider.load();
        },
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 20, 16, 140),
          children: [
            Text('BIENVENUE', style: Theme.of(context).textTheme.labelSmall?.copyWith(color: AppColors.primary)),
            const SizedBox(height: 6),
            Text(
              "L'excellence de\nl'artisanat local.",
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontSize: 30, height: 1.1),
            ),
            const SizedBox(height: 24),
            _SearchPrompt(onTap: onFindNow),
            const SizedBox(height: 32),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Nos métiers', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontSize: 20)),
                TextButton(
                  onPressed: onFindNow,
                  child: const Text('VOIR TOUT', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w800, fontSize: 12)),
                ),
              ],
            ),
            const SizedBox(height: 12),
            _CategoryBento(names: catalog.categories.map((c) => c.name).toList()),
            const SizedBox(height: 32),
            Text('Artisans proches de vous', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontSize: 20)),
            const SizedBox(height: 4),
            Text('${catalog.artisans.length} experts disponibles à $city', style: Theme.of(context).textTheme.bodyMedium),
            const SizedBox(height: 14),
            NearbyArtisansMap(artisans: catalog.artisans),
            const SizedBox(height: 12),
          ],
        ),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
      floatingActionButton: Padding(
        padding: const EdgeInsets.only(bottom: 76),
        child: SizedBox(
          width: MediaQuery.of(context).size.width - 32,
          child: DecoratedBox(
            decoration: BoxDecoration(
              gradient: AppGradients.signature,
              borderRadius: BorderRadius.circular(AppRadius.full),
              boxShadow: AppShadows.glow,
            ),
            child: ElevatedButton.icon(
              onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const AutoMatchScreen())),
              style: ElevatedButton.styleFrom(
                minimumSize: const Size.fromHeight(60),
                backgroundColor: Colors.transparent,
                shadowColor: Colors.transparent,
                foregroundColor: Colors.white,
                textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.full)),
              ),
              icon: const Icon(Icons.auto_awesome),
              label: const Text('Trouver artisan maintenant'),
            ),
          ),
        ),
      ),
    );
  }
}

class _SearchPrompt extends StatelessWidget {
  const _SearchPrompt({required this.onTap});

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(AppRadius.md),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 18),
        decoration: BoxDecoration(color: AppColors.surfaceContainerHighest, borderRadius: BorderRadius.circular(AppRadius.md)),
        child: Row(
          children: [
            const Icon(Icons.search, color: AppColors.onSurfaceVariant),
            const SizedBox(width: 14),
            Expanded(child: Text('Quel service cherchez-vous ?', style: Theme.of(context).textTheme.bodyLarge?.copyWith(fontSize: 15))),
          ],
        ),
      ),
    );
  }
}

class _CategoryBento extends StatelessWidget {
  const _CategoryBento({required this.names});

  final List<String> names;

  @override
  Widget build(BuildContext context) {
    final values = names.isEmpty ? const ['Plombier', 'Électricien', 'Maçon', 'Réparateur', 'Mécanicien', 'Menuisier'] : names;
    final large = values.first;
    final medium = values.length > 2 ? values.sublist(1, 3) : values.skip(1).toList();
    final small = values.length > 3 ? values.sublist(3, values.length.clamp(3, 6)) : const <String>[];

    return Column(
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: AspectRatio(
                aspectRatio: 1,
                child: Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(color: AppColors.secondaryContainer, borderRadius: BorderRadius.circular(AppRadius.lg)),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Icon(iconForCategory(large), color: AppColors.onSecondaryContainer, size: 30),
                      Text(large, style: const TextStyle(fontWeight: FontWeight.w800, color: AppColors.onSecondaryContainer)),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                children: [
                  for (final name in medium) ...[
                    _MediumTile(name: name),
                    if (name != medium.last) const SizedBox(height: 12),
                  ],
                ],
              ),
            ),
          ],
        ),
        if (small.isNotEmpty) ...[
          const SizedBox(height: 12),
          Row(
            children: [
              for (final name in small) ...[
                Expanded(child: _SmallTile(name: name)),
                if (name != small.last) const SizedBox(width: 12),
              ],
            ],
          ),
        ],
      ],
    );
  }
}

class _MediumTile extends StatelessWidget {
  const _MediumTile({required this.name});

  final String name;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: AppColors.surfaceContainerHigh, borderRadius: BorderRadius.circular(AppRadius.md)),
      child: Row(
        children: [
          Icon(iconForCategory(name), color: AppColors.primary, size: 20),
          const SizedBox(width: 10),
          Expanded(child: Text(name, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13), overflow: TextOverflow.ellipsis)),
        ],
      ),
    );
  }
}

class _SmallTile extends StatelessWidget {
  const _SmallTile({required this.name});

  final String name;

  @override
  Widget build(BuildContext context) {
    return AspectRatio(
      aspectRatio: 1,
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(color: AppColors.surfaceContainerLow, borderRadius: BorderRadius.circular(AppRadius.md)),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(iconForCategory(name), color: AppColors.secondary, size: 20),
            const SizedBox(height: 6),
            Text(
              name.toUpperCase(),
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w800, letterSpacing: 0.4),
            ),
          ],
        ),
      ),
    );
  }
}
