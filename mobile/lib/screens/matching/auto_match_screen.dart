import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/config/app_theme.dart';
import '../../models/artisan.dart';
import '../../providers/catalog_provider.dart';
import '../../widgets/star_rating.dart';
import '../artisan/artisan_profile_screen.dart';

enum _Stage { searching, found, empty }

/// Full-screen "auto matching" flow triggered by the home screen's
/// signature CTA: a short searching animation (recherche_automatique) that
/// resolves into either a match-found card (artisan_trouvé) or an empty
/// state if nothing is currently available.
class AutoMatchScreen extends StatefulWidget {
  const AutoMatchScreen({super.key});

  @override
  State<AutoMatchScreen> createState() => _AutoMatchScreenState();
}

class _AutoMatchScreenState extends State<AutoMatchScreen> {
  _Stage _stage = _Stage.searching;
  Artisan? _match;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _search());
  }

  Future<void> _search() async {
    final catalog = context.read<CatalogProvider>();
    final minimumDelay = Future<void>.delayed(const Duration(milliseconds: 2200));
    List<Artisan> results = const [];
    try {
      final category = catalog.categories.isNotEmpty ? catalog.categories.first.name : null;
      if (category != null) {
        results = await catalog.findRecommendations(category: category);
      }
    } catch (_) {
      results = const [];
    }
    await minimumDelay;
    if (!mounted) return;
    setState(() {
      _match = results.isEmpty ? null : results.first;
      _stage = results.isEmpty ? _Stage.empty : _Stage.found;
    });
  }

  @override
  Widget build(BuildContext context) {
    final catalog = context.watch<CatalogProvider>();
    final city = catalog.artisans.isNotEmpty ? (catalog.artisans.first.user.city ?? 'Ouagadougou') : 'Ouagadougou';

    return Scaffold(
      backgroundColor: AppColors.surface,
      body: switch (_stage) {
        _Stage.searching => _SearchingView(city: city),
        _Stage.found => _MatchFoundView(artisan: _match!),
        _Stage.empty => _EmptyView(onRetry: () {
            setState(() => _stage = _Stage.searching);
            _search();
          }),
      },
    );
  }
}

class _SearchingView extends StatefulWidget {
  const _SearchingView({required this.city});

  final String city;

  @override
  State<_SearchingView> createState() => _SearchingViewState();
}

class _SearchingViewState extends State<_SearchingView> with SingleTickerProviderStateMixin {
  late final AnimationController _pulse = AnimationController(vsync: this, duration: const Duration(milliseconds: 1400))..repeat(reverse: true);

  @override
  void dispose() {
    _pulse.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(
              children: [
                IconButton(onPressed: () => Navigator.of(context).maybePop(), icon: const Icon(Icons.arrow_back)),
                const SizedBox(width: 4),
                const Icon(Icons.location_on, color: AppColors.primary),
                const SizedBox(width: 8),
                Text('FasoConnect', style: Theme.of(context).textTheme.titleMedium),
              ],
            ),
          ),
          Expanded(
            flex: 3,
            child: Stack(
              alignment: Alignment.center,
              children: [
                DecoratedBox(
                  decoration: BoxDecoration(
                    gradient: RadialGradient(colors: [AppColors.primaryContainer.withValues(alpha: 0.55), AppColors.primaryContainer.withValues(alpha: 0.15)]),
                  ),
                  child: const SizedBox.expand(),
                ),
                ScaleTransition(
                  scale: Tween(begin: 0.9, end: 1.08).animate(CurvedAnimation(parent: _pulse, curve: Curves.easeInOut)),
                  child: Container(
                    width: 96,
                    height: 96,
                    decoration: const BoxDecoration(color: AppColors.primaryContainer, shape: BoxShape.circle, boxShadow: AppShadows.glow),
                    child: const Icon(Icons.search, color: Colors.white, size: 40),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            flex: 4,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 28),
              child: Column(
                children: [
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                    decoration: BoxDecoration(color: AppColors.secondaryContainer, borderRadius: BorderRadius.circular(AppRadius.full)),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(width: 8, height: 8, decoration: const BoxDecoration(color: AppColors.primaryContainer, shape: BoxShape.circle)),
                        const SizedBox(width: 8),
                        const Text('LIVE TRACKING', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, letterSpacing: 0.6)),
                      ],
                    ),
                  ),
                  const SizedBox(height: 18),
                  Text(
                    "Recherche de l'artisan le plus proche...",
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontSize: 24, fontWeight: FontWeight.w800),
                  ),
                  const SizedBox(height: 12),
                  RichText(
                    textAlign: TextAlign.center,
                    text: TextSpan(
                      style: Theme.of(context).textTheme.bodyLarge?.copyWith(fontSize: 15),
                      children: [
                        const TextSpan(text: 'Connexion en cours avec les experts disponibles à '),
                        TextSpan(text: widget.city, style: const TextStyle(fontWeight: FontWeight.w800, color: AppColors.onSurface)),
                        const TextSpan(text: '.'),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      minHeight: 6,
                      backgroundColor: AppColors.surfaceContainerHigh,
                      valueColor: const AlwaysStoppedAnimation(AppColors.primaryContainer),
                    ),
                  ),
                  const SizedBox(height: 28),
                  Row(
                    children: [
                      Expanded(child: _ShortcutTile(icon: Icons.history, label: 'Récents')),
                      const SizedBox(width: 14),
                      Expanded(child: _ShortcutTile(icon: Icons.star_border, label: 'Favoris')),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ShortcutTile extends StatelessWidget {
  const _ShortcutTile({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 18),
      decoration: BoxDecoration(color: AppColors.surfaceContainerLow, borderRadius: BorderRadius.circular(AppRadius.md)),
      child: Column(
        children: [
          Icon(icon, color: AppColors.primary),
          const SizedBox(height: 8),
          Text(label, style: const TextStyle(fontWeight: FontWeight.w700)),
        ],
      ),
    );
  }
}

class _MatchFoundView extends StatelessWidget {
  const _MatchFoundView({required this.artisan});

  final Artisan artisan;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 28),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Stack(
              alignment: Alignment.center,
              children: [
                Container(width: 128, height: 128, decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: AppColors.outlineVariant.withValues(alpha: 0.4)))),
                Container(width: 100, height: 100, decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle)),
                Container(
                  width: 72,
                  height: 72,
                  decoration: const BoxDecoration(color: AppColors.primary, shape: BoxShape.circle),
                  child: const Icon(Icons.check, color: Colors.white, size: 34),
                ),
              ],
            ),
            const SizedBox(height: 24),
            Text('Artisan trouvé !', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontSize: 26, fontWeight: FontWeight.w800)),
            const SizedBox(height: 10),
            Text(
              "Nous avons trouvé l'expert idéal pour votre projet à ${artisan.user.city ?? 'proximité'}.",
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyLarge,
            ),
            const SizedBox(height: 28),
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(color: AppColors.surfaceContainerLowest, borderRadius: BorderRadius.circular(AppRadius.lg), boxShadow: AppShadows.ambient),
              child: Row(
                children: [
                  Stack(
                    children: [
                      CircleAvatar(
                        radius: 32,
                        backgroundColor: AppColors.surfaceContainerLow,
                        backgroundImage: artisan.user.profilePicture != null ? NetworkImage(artisan.user.profilePicture!) : null,
                        child: artisan.user.profilePicture == null ? const Icon(Icons.person, color: AppColors.primary, size: 30) : null,
                      ),
                      Positioned(
                        top: -2,
                        left: -2,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(color: AppColors.primaryContainer, borderRadius: BorderRadius.circular(AppRadius.full)),
                          child: const Text('PRO', style: TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.w800)),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text((artisan.category?.name ?? 'ARTISAN').toUpperCase(), style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w800, fontSize: 11)),
                        Text(artisan.user.fullName, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 17)),
                        Row(
                          children: [
                            StarRating(rating: artisan.averageRating ?? 0),
                            const SizedBox(width: 6),
                            Text('${artisan.averageRating ?? '—'}', style: const TextStyle(fontWeight: FontWeight.w800)),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: DecoratedBox(
                decoration: BoxDecoration(gradient: AppGradients.signature, borderRadius: BorderRadius.circular(AppRadius.full), boxShadow: AppShadows.glow),
                child: ElevatedButton.icon(
                  onPressed: () => Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (_) => ArtisanProfileScreen(artisanId: artisan.id))),
                  style: ElevatedButton.styleFrom(
                    minimumSize: const Size.fromHeight(58),
                    backgroundColor: Colors.transparent,
                    shadowColor: Colors.transparent,
                    foregroundColor: Colors.white,
                    textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.full)),
                  ),
                  icon: const Icon(Icons.arrow_forward),
                  label: const Text('Voir le profil'),
                ),
              ),
            ),
            const SizedBox(height: 14),
            TextButton.icon(
              onPressed: () => Navigator.of(context).maybePop(),
              icon: const Icon(Icons.close, color: AppColors.onSurfaceVariant),
              label: const Text('Fermer', style: TextStyle(color: AppColors.onSurfaceVariant, fontWeight: FontWeight.w700)),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }
}

class _EmptyView extends StatelessWidget {
  const _EmptyView({required this.onRetry});

  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(28),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.search_off, size: 56, color: AppColors.onSurfaceVariant),
            const SizedBox(height: 20),
            Text('Aucun artisan disponible', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontSize: 22)),
            const SizedBox(height: 10),
            Text(
              "Aucun artisan n'est disponible pour le moment. Réessayez dans quelques instants.",
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyLarge,
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: onRetry,
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size.fromHeight(54),
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.full)),
                ),
                child: const Text('Réessayer'),
              ),
            ),
            const SizedBox(height: 12),
            TextButton(onPressed: () => Navigator.of(context).maybePop(), child: const Text('Fermer')),
          ],
        ),
      ),
    );
  }
}
