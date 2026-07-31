import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/config/app_theme.dart';
import '../../models/category.dart';
import '../../providers/catalog_provider.dart';

/// Completes (or edits) the signed-in artisan's professional profile
/// (category, experience, rate, bio). Without this step an artisan account
/// has no `Artisan` row in the backend and stays invisible to every
/// customer-facing search/recommendation endpoint.
class ArtisanOnboardingScreen extends StatefulWidget {
  /// When [mandatory] is true (first-time onboarding right after
  /// registration), the screen cannot be dismissed via the back
  /// button/gesture until the profile is saved — otherwise the artisan
  /// stays invisible everywhere (search, admin panel) indefinitely, as
  /// happened when this step was just a skippable menu tile.
  const ArtisanOnboardingScreen({super.key, this.mandatory = false});

  final bool mandatory;

  @override
  State<ArtisanOnboardingScreen> createState() =>
      _ArtisanOnboardingScreenState();
}

class _ArtisanOnboardingScreenState extends State<ArtisanOnboardingScreen> {
  final _experienceYears = TextEditingController();
  final _hourlyRate = TextEditingController();
  final _bio = TextEditingController();
  Category? _category;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    final profile = context.read<CatalogProvider>().myArtisanProfile;
    if (profile != null) {
      _category = profile.category;
      _experienceYears.text = profile.experienceYears.toString();
      if (profile.hourlyRate != null)
        _hourlyRate.text = profile.hourlyRate.toString();
      _bio.text = profile.user.bio ?? '';
    }
  }

  @override
  void dispose() {
    _experienceYears.dispose();
    _hourlyRate.dispose();
    _bio.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (_category == null) {
      ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Choisissez votre métier.')));
      return;
    }
    final years = int.tryParse(_experienceYears.text.trim());
    if (years == null || years < 0) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text("Indiquez un nombre d'années d'expérience valide.")));
      return;
    }

    setState(() => _saving = true);
    final catalog = context.read<CatalogProvider>();
    final navigator = Navigator.of(context);
    final messenger = ScaffoldMessenger.of(context);
    try {
      await catalog.completeArtisanProfile({
        'categoryId': _category!.id,
        'experienceYears': years,
        if (_hourlyRate.text.trim().isNotEmpty)
          'hourlyRate': num.tryParse(_hourlyRate.text.trim()),
        if (_bio.text.trim().isNotEmpty) 'bio': _bio.text.trim(),
      });
      if (!mounted) return;
      messenger.showSnackBar(
          const SnackBar(content: Text('Profil professionnel enregistré.')));
      navigator.pop();
    } catch (_) {
      if (!mounted) return;
      messenger.showSnackBar(const SnackBar(
          content: Text("Impossible d'enregistrer votre profil. Réessayez.")));
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final categories = context.watch<CatalogProvider>().categories;
    final isEditing = context.watch<CatalogProvider>().myArtisanProfile != null;
    return PopScope(
      canPop: !widget.mandatory,
      child: Scaffold(
        backgroundColor: AppColors.surface,
        appBar: AppBar(
          title:
              Text(isEditing ? 'Profil professionnel' : 'Compléter mon profil'),
          automaticallyImplyLeading: !widget.mandatory,
        ),
        body: ListView(
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
          children: [
            Text(
              isEditing
                  ? 'Mettez à jour vos informations de métier.'
                  : 'Ces informations permettent aux clients de vous trouver.',
              style: Theme.of(context).textTheme.bodyLarge,
            ),
            const SizedBox(height: 24),
            Text('MÉTIER', style: Theme.of(context).textTheme.labelSmall),
            const SizedBox(height: 8),
            DropdownButtonFormField<Category>(
              value: _category,
              items: [
                for (final category in categories)
                  DropdownMenuItem(value: category, child: Text(category.name))
              ],
              onChanged: (value) => setState(() => _category = value),
              decoration:
                  const InputDecoration(hintText: 'Sélectionnez votre métier'),
            ),
            const SizedBox(height: 20),
            Text('ANNÉES D\'EXPÉRIENCE',
                style: Theme.of(context).textTheme.labelSmall),
            const SizedBox(height: 8),
            TextField(
              controller: _experienceYears,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(hintText: 'Ex: 5'),
            ),
            const SizedBox(height: 20),
            Text('TARIF HORAIRE (FCFA, OPTIONNEL)',
                style: Theme.of(context).textTheme.labelSmall),
            const SizedBox(height: 8),
            TextField(
              controller: _hourlyRate,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(hintText: 'Ex: 3000'),
            ),
            const SizedBox(height: 20),
            Text('BIO (OPTIONNEL)',
                style: Theme.of(context).textTheme.labelSmall),
            const SizedBox(height: 8),
            TextField(
              controller: _bio,
              minLines: 3,
              maxLines: 5,
              decoration: const InputDecoration(
                  hintText: 'Présentez votre expérience et vos spécialités.'),
            ),
            const SizedBox(height: 28),
            SizedBox(
              width: double.infinity,
              child: DecoratedBox(
                decoration: BoxDecoration(
                    gradient: AppGradients.signature,
                    borderRadius: BorderRadius.circular(AppRadius.full),
                    boxShadow: AppShadows.ambient),
                child: ElevatedButton(
                  onPressed: _saving ? null : _save,
                  style: ElevatedButton.styleFrom(
                    minimumSize: const Size.fromHeight(60),
                    backgroundColor: Colors.transparent,
                    shadowColor: Colors.transparent,
                    foregroundColor: Colors.white,
                    disabledForegroundColor: Colors.white70,
                    textStyle: const TextStyle(
                        fontSize: 16, fontWeight: FontWeight.w800),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(AppRadius.full)),
                  ),
                  child: Text(_saving ? 'Enregistrement...' : 'Enregistrer'),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
