import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../core/config/app_theme.dart';
import '../../models/artisan.dart';
import '../../models/review.dart';
import '../../providers/catalog_provider.dart';
import '../../widgets/star_rating.dart';
import '../request/service_request_screen.dart';

class ArtisanProfileScreen extends StatefulWidget {
  const ArtisanProfileScreen({super.key, required this.artisanId});

  final String artisanId;

  @override
  State<ArtisanProfileScreen> createState() => _ArtisanProfileScreenState();
}

class _ArtisanProfileScreenState extends State<ArtisanProfileScreen> {
  Artisan? _artisan;
  List<Review> _reviews = const [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final catalog = context.read<CatalogProvider>();
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final artisan = await catalog.artisanDetail(widget.artisanId);
      final reviews = await catalog.reviewsForUser(artisan.user.id);
      if (!mounted) return;
      setState(() {
        _artisan = artisan;
        _reviews = reviews;
        _loading = false;
      });
    } catch (exception) {
      if (!mounted) return;
      setState(() {
        _error = 'Impossible de charger ce profil.';
        _loading = false;
      });
    }
  }

  Future<void> _call() async {
    final phone = _artisan?.user.phone;
    if (phone == null || phone.isEmpty) return;
    await launchUrl(Uri.parse('tel:$phone'));
  }

  Future<void> _whatsapp() async {
    final phone = _artisan?.user.phone;
    if (phone == null || phone.isEmpty) return;
    final digits = phone.replaceAll(RegExp(r'[^0-9]'), '');
    await launchUrl(Uri.parse('https://wa.me/$digits'), mode: LaunchMode.externalApplication);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(title: const Text('Profil artisan')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text(_error!))
              : _ArtisanProfileBody(
                  artisan: _artisan!,
                  reviews: _reviews,
                  onCall: _call,
                  onWhatsapp: _whatsapp,
                ),
    );
  }
}

class _ArtisanProfileBody extends StatelessWidget {
  const _ArtisanProfileBody({required this.artisan, required this.reviews, required this.onCall, required this.onWhatsapp});

  final Artisan artisan;
  final List<Review> reviews;
  final VoidCallback onCall;
  final VoidCallback onWhatsapp;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
      children: [
        _ProfileHero(artisan: artisan),
        const SizedBox(height: 20),
        Row(
          children: [
            Expanded(
              child: _ActionButton(icon: Icons.call, label: 'Appeler', background: AppColors.secondaryContainer, foreground: AppColors.onSecondaryContainer, onTap: onCall),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _ActionButton(icon: Icons.chat, label: 'WhatsApp', background: AppColors.whatsapp, foreground: Colors.white, onTap: onWhatsapp),
            ),
          ],
        ),
        const SizedBox(height: 12),
        SizedBox(
          width: double.infinity,
          child: DecoratedBox(
            decoration: BoxDecoration(gradient: AppGradients.signature, borderRadius: BorderRadius.circular(AppRadius.full), boxShadow: AppShadows.glow),
            child: ElevatedButton.icon(
              onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => ServiceRequestScreen(artisan: artisan))),
              style: ElevatedButton.styleFrom(
                minimumSize: const Size.fromHeight(60),
                backgroundColor: Colors.transparent,
                shadowColor: Colors.transparent,
                foregroundColor: Colors.white,
                textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.full)),
              ),
              icon: const Icon(Icons.bolt),
              label: const Text('Demander service'),
            ),
          ),
        ),
        const SizedBox(height: 32),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Avis récents', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontSize: 20)),
            if (reviews.isNotEmpty) const Text('Voir tout', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w800)),
          ],
        ),
        const SizedBox(height: 16),
        if (reviews.isEmpty)
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(color: AppColors.surfaceContainerLow, borderRadius: BorderRadius.circular(AppRadius.lg)),
            child: Text('Pas encore d\'avis pour cet artisan.', style: Theme.of(context).textTheme.bodyMedium),
          )
        else
          for (final review in reviews) _ReviewCard(review: review),
        const SizedBox(height: 32),
        Text('Services & Expertise', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontSize: 20)),
        const SizedBox(height: 16),
        _ServicesGrid(categoryName: artisan.category?.name ?? 'Service général'),
      ],
    );
  }
}

class _ProfileHero extends StatelessWidget {
  const _ProfileHero({required this.artisan});

  final Artisan artisan;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(color: AppColors.surfaceContainerLowest, borderRadius: BorderRadius.circular(AppRadius.xl), boxShadow: AppShadows.ambient),
      clipBehavior: Clip.antiAlias,
      child: Column(
        children: [
          AspectRatio(
            aspectRatio: 4 / 3,
            child: Stack(
              fit: StackFit.expand,
              children: [
                artisan.user.profilePicture != null
                    ? Image.network(artisan.user.profilePicture!, fit: BoxFit.cover)
                    : DecoratedBox(
                        decoration: BoxDecoration(gradient: AppGradients.signature),
                        child: const Center(child: Icon(Icons.person, color: Colors.white, size: 64)),
                      ),
                if (artisan.verified)
                  Positioned(
                    top: 16,
                    right: 16,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.92), borderRadius: BorderRadius.circular(AppRadius.full)),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.verified, color: AppColors.primary, size: 14),
                          SizedBox(width: 4),
                          Text('VÉRIFIÉ', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800)),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(artisan.user.fullName, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800)),
                          Text(artisan.category?.name ?? 'Artisan', style: const TextStyle(color: AppColors.primary, fontSize: 16, fontWeight: FontWeight.w600)),
                        ],
                      ),
                    ),
                    if (artisan.user.city != null)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                        decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: 0.06), borderRadius: BorderRadius.circular(AppRadius.sm)),
                        child: Row(
                          children: [
                            const Icon(Icons.location_on, color: AppColors.primary, size: 16),
                            const SizedBox(width: 4),
                            Text(artisan.user.city!, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 12)),
                          ],
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 14),
                Container(
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  decoration: BoxDecoration(border: Border(top: BorderSide(color: AppColors.outlineVariant.withValues(alpha: 0.25)))),
                  child: Row(
                    children: [
                      StarRating(rating: artisan.averageRating ?? 0, size: 18),
                      const SizedBox(width: 6),
                      Text('${artisan.averageRating ?? '—'}', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
                      const SizedBox(width: 12),
                      Container(width: 1, height: 14, color: AppColors.outlineVariant.withValues(alpha: 0.4)),
                      const SizedBox(width: 12),
                      Text('${artisan.experienceYears} ans d\'expérience', style: const TextStyle(color: AppColors.onSecondaryContainer, fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ActionButton extends StatelessWidget {
  const _ActionButton({required this.icon, required this.label, required this.background, required this.foreground, required this.onTap});

  final IconData icon;
  final String label;
  final Color background;
  final Color foreground;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(AppRadius.md),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(color: background, borderRadius: BorderRadius.circular(AppRadius.md)),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: foreground),
            const SizedBox(width: 8),
            Text(label, style: TextStyle(color: foreground, fontWeight: FontWeight.w800)),
          ],
        ),
      ),
    );
  }
}

class _ReviewCard extends StatelessWidget {
  const _ReviewCard({required this.review});

  final Review review;

  @override
  Widget build(BuildContext context) {
    final initials = (review.reviewerName ?? '?').trim().split(RegExp(r'\s+')).map((w) => w.isNotEmpty ? w[0] : '').take(2).join().toUpperCase();
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(color: AppColors.surfaceContainerLow, borderRadius: BorderRadius.circular(AppRadius.lg)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          StarRating(rating: review.rating),
          if (review.comment != null && review.comment!.isNotEmpty) ...[
            const SizedBox(height: 10),
            Text(review.comment!, style: const TextStyle(fontStyle: FontStyle.italic, height: 1.4)),
          ],
          const SizedBox(height: 12),
          Row(
            children: [
              CircleAvatar(radius: 14, backgroundColor: AppColors.outlineVariant.withValues(alpha: 0.4), child: Text(initials, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800))),
              const SizedBox(width: 10),
              Text(review.reviewerName ?? 'Client', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13)),
            ],
          ),
        ],
      ),
    );
  }
}

class _ServicesGrid extends StatelessWidget {
  const _ServicesGrid({required this.categoryName});

  final String categoryName;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: Container(
            height: 160,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(color: AppColors.surfaceContainerHigh, borderRadius: BorderRadius.circular(AppRadius.lg)),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                const Icon(Icons.bolt, color: AppColors.primary),
                const Spacer(),
                Text(categoryName, style: const TextStyle(fontWeight: FontWeight.w800)),
                const Text('Prestations sur mesure', style: TextStyle(fontSize: 12, color: AppColors.onSurfaceVariant)),
              ],
            ),
          ),
        ),
        const SizedBox(width: 14),
        Expanded(
          child: SizedBox(
            height: 160,
            child: Column(
              children: [
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: 0.06), borderRadius: BorderRadius.circular(AppRadius.lg)),
                    child: const Row(children: [Icon(Icons.build, color: AppColors.primary), SizedBox(width: 10), Text('Dépannage', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13))]),
                  ),
                ),
                const SizedBox(height: 12),
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(color: AppColors.secondaryContainer.withValues(alpha: 0.3), borderRadius: BorderRadius.circular(AppRadius.lg)),
                    child: const Row(children: [Icon(Icons.description_outlined, color: AppColors.secondary), SizedBox(width: 10), Text('Devis gratuit', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13))]),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
