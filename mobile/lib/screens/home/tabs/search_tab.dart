import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../core/config/app_theme.dart';
import '../../../models/artisan.dart';
import '../../../models/service_request.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/catalog_provider.dart';
import '../../../providers/workflow_provider.dart';
import '../../../widgets/app_top_bar.dart';
import '../../../widgets/star_rating.dart';
import '../../artisan/artisan_profile_screen.dart';
import '../notifications_sheet.dart';

class SearchTab extends StatefulWidget {
  const SearchTab({super.key});

  @override
  State<SearchTab> createState() => _SearchTabState();
}

class _SearchTabState extends State<SearchTab> {
  final _controller = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      if (context.read<AuthProvider>().user?.role == 'ARTISAN') {
        context.read<WorkflowProvider>().loadOpenRequests();
      }
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isArtisan = context.watch<AuthProvider>().user?.role == 'ARTISAN';
    return isArtisan ? _buildArtisanMissions(context) : _buildCustomerSearch(context);
  }

  Widget _buildCustomerSearch(BuildContext context) {
    final catalog = context.watch<CatalogProvider>();
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppTopBar(onNotificationsTap: () => showNotificationsSheet(context)),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 20, 16, 32),
        children: [
          Text('Trouver un artisan', style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontSize: 26)),
          const SizedBox(height: 16),
          TextField(
            controller: _controller,
            decoration: const InputDecoration(prefixIcon: Icon(Icons.search), hintText: 'Nom, métier ou ville'),
            onSubmitted: (value) => context.read<CatalogProvider>().load(search: value),
          ),
          const SizedBox(height: 20),
          if (catalog.loading) const Center(child: Padding(padding: EdgeInsets.all(24), child: CircularProgressIndicator())),
          if (catalog.error != null) Padding(padding: const EdgeInsets.only(bottom: 12), child: Text(catalog.error!, style: const TextStyle(color: AppColors.error, fontWeight: FontWeight.w700))),
          if (!catalog.loading && catalog.artisans.isEmpty) Text('Aucun artisan trouvé.', style: Theme.of(context).textTheme.bodyMedium),
          for (final artisan in catalog.artisans)
            _ArtisanCard(
              artisan: artisan,
              onFavorite: () => context.read<CatalogProvider>().toggleFavorite(artisan.id),
              onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => ArtisanProfileScreen(artisanId: artisan.id))),
            ),
        ],
      ),
    );
  }

  Widget _buildArtisanMissions(BuildContext context) {
    final workflow = context.watch<WorkflowProvider>();
    final myArtisanId = context.watch<CatalogProvider>().myArtisanProfile?.id;
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppTopBar(onNotificationsTap: () => showNotificationsSheet(context)),
      body: RefreshIndicator(
        onRefresh: () => context.read<WorkflowProvider>().loadOpenRequests(),
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 20, 16, 32),
          children: [
            Text('Missions disponibles', style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontSize: 26)),
            const SizedBox(height: 4),
            Text('Demandes de service dans votre catégorie, en attente d\'un artisan.', style: Theme.of(context).textTheme.bodyMedium),
            const SizedBox(height: 20),
            if (workflow.error != null) Padding(padding: const EdgeInsets.only(bottom: 12), child: Text(workflow.error!, style: const TextStyle(color: AppColors.error, fontWeight: FontWeight.w700))),
            if (workflow.openRequests.isEmpty) Text('Aucune mission disponible pour le moment.', style: Theme.of(context).textTheme.bodyMedium),
            for (final request in workflow.openRequests)
              _OpenRequestCard(
                request: request,
                onClaim: myArtisanId == null
                    ? null
                    : () => context.read<WorkflowProvider>().claim(request.id, myArtisanId),
              ),
          ],
        ),
      ),
    );
  }
}

class _OpenRequestCard extends StatelessWidget {
  const _OpenRequestCard({required this.request, required this.onClaim});

  final ServiceRequest request;
  final VoidCallback? onClaim;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: AppColors.surfaceContainerLowest, borderRadius: BorderRadius.circular(AppRadius.lg), boxShadow: AppShadows.ambient),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(request.title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
          const SizedBox(height: 4),
          Text(request.description, maxLines: 2, overflow: TextOverflow.ellipsis, style: Theme.of(context).textTheme.bodyMedium),
          const SizedBox(height: 8),
          Row(
            children: [
              const Icon(Icons.place_outlined, size: 16, color: AppColors.onSurfaceVariant),
              const SizedBox(width: 4),
              Text(request.location ?? 'Localisation non précisée', style: Theme.of(context).textTheme.bodySmall),
              if (request.budget != null) ...[
                const SizedBox(width: 12),
                const Icon(Icons.payments_outlined, size: 16, color: AppColors.onSurfaceVariant),
                const SizedBox(width: 4),
                Text('${request.budget} FCFA', style: Theme.of(context).textTheme.bodySmall),
              ],
            ],
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: onClaim,
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.full))),
              child: const Text('Réclamer cette mission', style: TextStyle(fontWeight: FontWeight.w800)),
            ),
          ),
        ],
      ),
    );
  }
}

class _ArtisanCard extends StatelessWidget {
  const _ArtisanCard({required this.artisan, required this.onFavorite, required this.onTap});

  final Artisan artisan;
  final VoidCallback onFavorite;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(AppRadius.lg),
      child: Container(
        margin: const EdgeInsets.only(bottom: 14),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(color: AppColors.surfaceContainerLowest, borderRadius: BorderRadius.circular(AppRadius.lg), boxShadow: AppShadows.ambient),
        child: Row(
          children: [
            CircleAvatar(
              radius: 28,
              backgroundColor: AppColors.surfaceContainerLow,
              backgroundImage: artisan.user.profilePicture != null ? NetworkImage(artisan.user.profilePicture!) : null,
              child: artisan.user.profilePicture == null ? const Icon(Icons.person, color: AppColors.primary) : null,
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(artisan.user.fullName, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
                  Text('${artisan.category?.name ?? 'Artisan'} • ${artisan.user.city ?? 'Burkina Faso'}', style: Theme.of(context).textTheme.bodyMedium),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      StarRating(rating: artisan.averageRating ?? 0, size: 14),
                      const SizedBox(width: 6),
                      Text('${artisan.experienceYears} ans', style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w800, fontSize: 12)),
                    ],
                  ),
                ],
              ),
            ),
            IconButton(onPressed: onFavorite, icon: const Icon(Icons.favorite_border, color: AppColors.primary)),
          ],
        ),
      ),
    );
  }
}
