import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/config/app_theme.dart';
import '../../models/service_request.dart';
import '../../providers/workflow_provider.dart';
import '../../widgets/app_bottom_nav.dart';
import '../../widgets/star_rating.dart';

class RatingScreen extends StatefulWidget {
  const RatingScreen({super.key, required this.request});

  final ServiceRequest request;

  @override
  State<RatingScreen> createState() => _RatingScreenState();
}

class _RatingScreenState extends State<RatingScreen> {
  int _rating = 5;
  final _comment = TextEditingController();
  bool _sending = false;

  @override
  void dispose() {
    _comment.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    setState(() => _sending = true);
    final workflow = context.read<WorkflowProvider>();
    final navigator = Navigator.of(context);
    final messenger = ScaffoldMessenger.of(context);
    try {
      await workflow.submitReview(serviceRequestId: widget.request.id, rating: _rating, comment: _comment.text.trim());
      if (!mounted) return;
      messenger.showSnackBar(const SnackBar(content: Text('Merci pour votre avis !')));
      navigator.pop();
    } catch (_) {
      if (!mounted) return;
      messenger.showSnackBar(const SnackBar(content: Text("Impossible d'enregistrer votre avis (avis déjà envoyé ?).")));
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final artisan = widget.request.artisan;
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(title: const Text('')),
      bottomNavigationBar: const AppBottomNav(index: 2, onChanged: _noop),
      body: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 24),
        children: [
          const SizedBox(height: 8),
          Center(
            child: Stack(
              alignment: Alignment.center,
              children: [
                CircleAvatar(
                  radius: 56,
                  backgroundColor: AppColors.surfaceContainerLow,
                  backgroundImage: artisan?.user.profilePicture != null ? NetworkImage(artisan!.user.profilePicture!) : null,
                  child: artisan?.user.profilePicture == null ? const Icon(Icons.person, size: 48, color: AppColors.primary) : null,
                ),
                Positioned(
                  bottom: 0,
                  right: 0,
                  child: Container(
                    padding: const EdgeInsets.all(6),
                    decoration: const BoxDecoration(color: AppColors.primary, shape: BoxShape.circle),
                    child: const Icon(Icons.check, color: Colors.white, size: 18),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          Text('Service terminé !', textAlign: TextAlign.center, style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontSize: 26, fontWeight: FontWeight.w800)),
          const SizedBox(height: 10),
          RichText(
            textAlign: TextAlign.center,
            text: TextSpan(
              style: Theme.of(context).textTheme.bodyLarge,
              children: [
                const TextSpan(text: 'Votre projet avec '),
                TextSpan(text: artisan?.user.fullName ?? 'l\'artisan', style: const TextStyle(fontWeight: FontWeight.w800, color: AppColors.onSurface)),
                const TextSpan(text: ' a été marqué comme complété.'),
              ],
            ),
          ),
          const SizedBox(height: 28),
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(color: AppColors.surfaceContainerLow, borderRadius: BorderRadius.circular(AppRadius.lg)),
            child: Column(
              children: [
                Text('Comment s\'est passé le service ?', textAlign: TextAlign.center, style: Theme.of(context).textTheme.titleMedium?.copyWith(fontSize: 18)),
                const SizedBox(height: 16),
                StarRatingInput(rating: _rating, onChanged: (value) => setState(() => _rating = value)),
                const SizedBox(height: 12),
                Text('VOTRE EXPÉRIENCE', style: Theme.of(context).textTheme.labelSmall),
                const SizedBox(height: 8),
                TextField(
                  controller: _comment,
                  minLines: 3,
                  maxLines: 5,
                  decoration: InputDecoration(
                    hintText: 'Partagez quelques mots sur la qualité du travail...',
                    fillColor: AppColors.surfaceContainerLowest,
                    filled: true,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            child: DecoratedBox(
              decoration: BoxDecoration(gradient: AppGradients.signature, borderRadius: BorderRadius.circular(AppRadius.full), boxShadow: AppShadows.glow),
              child: ElevatedButton.icon(
                onPressed: _sending ? null : _submit,
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size.fromHeight(58),
                  backgroundColor: Colors.transparent,
                  shadowColor: Colors.transparent,
                  foregroundColor: Colors.white,
                  textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.full)),
                ),
                icon: const Icon(Icons.send),
                label: Text(_sending ? 'Envoi...' : 'Valider mon avis'),
              ),
            ),
          ),
          const SizedBox(height: 14),
          Center(
            child: TextButton(
              onPressed: () => Navigator.of(context).maybePop(),
              child: const Text('Plus tard', style: TextStyle(color: AppColors.onSurfaceVariant, fontWeight: FontWeight.w700)),
            ),
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }
}

void _noop(int _) {}
