import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/config/app_theme.dart';
import '../../models/artisan.dart';
import '../../providers/workflow_provider.dart';

/// "Nouvelle demande" screen launched from an artisan's profile: the
/// recipient is fixed (spotlight card), only the problem description (and,
/// visually, photos) needs to be filled in.
class ServiceRequestScreen extends StatefulWidget {
  const ServiceRequestScreen({super.key, required this.artisan});

  final Artisan artisan;

  @override
  State<ServiceRequestScreen> createState() => _ServiceRequestScreenState();
}

class _ServiceRequestScreenState extends State<ServiceRequestScreen> {
  final _description = TextEditingController();
  bool _sending = false;

  @override
  void dispose() {
    _description.dispose();
    super.dispose();
  }

  Future<void> _send() async {
    final description = _description.text.trim();
    if (description.length < 10) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Décrivez votre besoin en 10 caractères minimum.')));
      return;
    }
    setState(() => _sending = true);
    final workflow = context.read<WorkflowProvider>();
    final navigator = Navigator.of(context);
    final messenger = ScaffoldMessenger.of(context);
    try {
      await workflow.createRequest({
        'title': 'Service ${widget.artisan.category?.name ?? "artisan"}',
        'description': description,
        'categoryId': widget.artisan.category?.id,
        'artisanId': widget.artisan.id,
        if (widget.artisan.user.city != null) 'location': widget.artisan.user.city,
      });
      if (!mounted) return;
      messenger.showSnackBar(const SnackBar(content: Text('Demande envoyée avec succès !')));
      navigator.pop();
    } catch (_) {
      if (!mounted) return;
      messenger.showSnackBar(const SnackBar(content: Text("Impossible d'envoyer la demande. Réessayez.")));
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final artisan = widget.artisan;
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(title: const Text('')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
        children: [
          Text('Nouvelle demande', style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontSize: 28)),
          const SizedBox(height: 8),
          Text("Décrivez votre besoin pour trouver l'artisan idéal.", style: Theme.of(context).textTheme.bodyLarge),
          const SizedBox(height: 28),
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(color: AppColors.surfaceContainerLow, borderRadius: BorderRadius.circular(AppRadius.md)),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 28,
                  backgroundColor: AppColors.surfaceDim,
                  backgroundImage: artisan.user.profilePicture != null ? NetworkImage(artisan.user.profilePicture!) : null,
                  child: artisan.user.profilePicture == null ? const Icon(Icons.person, color: AppColors.primary) : null,
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('DESTINATAIRE', style: Theme.of(context).textTheme.labelSmall?.copyWith(color: AppColors.primary)),
                      Text(artisan.user.fullName, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 17)),
                      Text('${artisan.category?.name ?? "Artisan"} • ${artisan.user.city ?? "Burkina Faso"}', style: Theme.of(context).textTheme.bodyMedium),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          Text('DESCRIPTION DU PROBLÈME', style: Theme.of(context).textTheme.labelSmall),
          const SizedBox(height: 8),
          TextField(
            controller: _description,
            minLines: 4,
            maxLines: 6,
            decoration: const InputDecoration(hintText: 'Ex: Mon ventilateur ne marche plus...'),
          ),
          const SizedBox(height: 24),
          Text('AJOUTER DES PHOTOS', style: Theme.of(context).textTheme.labelSmall),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: InkWell(
                  onTap: () => ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("L'ajout de photos sera bientôt disponible."))),
                  borderRadius: BorderRadius.circular(AppRadius.md),
                  child: AspectRatio(
                    aspectRatio: 1,
                    child: DecoratedBox(
                      decoration: BoxDecoration(
                        color: AppColors.surfaceContainerHighest,
                        borderRadius: BorderRadius.circular(AppRadius.md),
                        border: Border.all(color: AppColors.outlineVariant.withValues(alpha: 0.4), width: 1.5),
                      ),
                      child: const Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.add_a_photo_outlined, color: AppColors.primary),
                          SizedBox(height: 6),
                          Text('AJOUTER', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w800)),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(child: AspectRatio(aspectRatio: 1, child: DecoratedBox(decoration: BoxDecoration(color: AppColors.surfaceContainerLow, borderRadius: BorderRadius.circular(AppRadius.md))))),
              const SizedBox(width: 12),
              Expanded(child: AspectRatio(aspectRatio: 1, child: DecoratedBox(decoration: BoxDecoration(color: AppColors.surfaceContainerLow, borderRadius: BorderRadius.circular(AppRadius.md))))),
            ],
          ),
          const SizedBox(height: 24),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(color: AppColors.secondaryContainer.withValues(alpha: 0.3), borderRadius: BorderRadius.circular(AppRadius.md)),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(Icons.info, color: AppColors.secondary, size: 20),
                const SizedBox(width: 12),
                Expanded(
                  child: RichText(
                    text: TextSpan(
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppColors.onSecondaryContainer),
                      children: [
                        const TextSpan(text: 'Une notification sera envoyée instantanément à '),
                        TextSpan(text: artisan.user.fullName, style: const TextStyle(fontWeight: FontWeight.w800)),
                        const TextSpan(text: '. Il pourra consulter votre demande et vous répondre directement.'),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 28),
          SizedBox(
            width: double.infinity,
            child: DecoratedBox(
              decoration: BoxDecoration(gradient: AppGradients.signature, borderRadius: BorderRadius.circular(AppRadius.full), boxShadow: AppShadows.ambient),
              child: ElevatedButton.icon(
                onPressed: _sending ? null : _send,
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size.fromHeight(60),
                  backgroundColor: Colors.transparent,
                  shadowColor: Colors.transparent,
                  foregroundColor: Colors.white,
                  disabledForegroundColor: Colors.white70,
                  textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.full)),
                ),
                icon: _sending ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Icon(Icons.send),
                label: Text(_sending ? 'Envoi...' : 'Envoyer la demande'),
              ),
            ),
          ),
          const SizedBox(height: 12),
          Text(
            'TEMPS DE RÉPONSE MOYEN : 15 MIN',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 0.8, color: AppColors.onSurfaceVariant.withValues(alpha: 0.6)),
          ),
        ],
      ),
    );
  }
}
