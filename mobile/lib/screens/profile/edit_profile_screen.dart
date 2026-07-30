import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/config/app_theme.dart';
import '../../providers/auth_provider.dart';

/// Lets a customer or artisan update their basic account details (name,
/// phone, city, country, bio). The backend endpoint (`PUT /api/users/profile`)
/// already existed; this screen was the missing piece on the mobile side.
class EditProfileScreen extends StatefulWidget {
  const EditProfileScreen({super.key});

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  late final TextEditingController _fullName;
  late final TextEditingController _phone;
  late final TextEditingController _city;
  late final TextEditingController _country;
  late final TextEditingController _bio;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    final user = context.read<AuthProvider>().user;
    _fullName = TextEditingController(text: user?.fullName ?? '');
    _phone = TextEditingController(text: user?.phone ?? '');
    _city = TextEditingController(text: user?.city ?? '');
    _country = TextEditingController(text: user?.country ?? '');
    _bio = TextEditingController(text: user?.bio ?? '');
  }

  @override
  void dispose() {
    _fullName.dispose();
    _phone.dispose();
    _city.dispose();
    _country.dispose();
    _bio.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (_fullName.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Le nom complet est requis.')));
      return;
    }
    setState(() => _saving = true);
    final auth = context.read<AuthProvider>();
    final navigator = Navigator.of(context);
    final messenger = ScaffoldMessenger.of(context);
    final success = await auth.updateProfile(
      fullName: _fullName.text.trim(),
      phone: _phone.text.trim(),
      city: _city.text.trim(),
      country: _country.text.trim(),
      bio: _bio.text.trim(),
    );
    if (!mounted) return;
    setState(() => _saving = false);
    if (success) {
      messenger.showSnackBar(const SnackBar(content: Text('Profil mis à jour.')));
      navigator.pop();
    } else {
      messenger.showSnackBar(SnackBar(content: Text(auth.error ?? 'Impossible de mettre à jour le profil.')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(title: const Text('Modifier le profil')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
        children: [
          Text('NOM COMPLET', style: Theme.of(context).textTheme.labelSmall),
          const SizedBox(height: 8),
          TextField(controller: _fullName, decoration: const InputDecoration(hintText: 'Votre nom complet')),
          const SizedBox(height: 20),
          Text('TÉLÉPHONE', style: Theme.of(context).textTheme.labelSmall),
          const SizedBox(height: 8),
          TextField(controller: _phone, keyboardType: TextInputType.phone, decoration: const InputDecoration(hintText: 'Ex: +226 70 00 00 00')),
          const SizedBox(height: 20),
          Text('VILLE', style: Theme.of(context).textTheme.labelSmall),
          const SizedBox(height: 8),
          TextField(controller: _city, decoration: const InputDecoration(hintText: 'Ex: Ouagadougou')),
          const SizedBox(height: 20),
          Text('PAYS', style: Theme.of(context).textTheme.labelSmall),
          const SizedBox(height: 8),
          TextField(controller: _country, decoration: const InputDecoration(hintText: 'Ex: Burkina Faso')),
          const SizedBox(height: 20),
          Text('BIO', style: Theme.of(context).textTheme.labelSmall),
          const SizedBox(height: 8),
          TextField(controller: _bio, minLines: 3, maxLines: 5, decoration: const InputDecoration(hintText: 'Parlez un peu de vous.')),
          const SizedBox(height: 28),
          SizedBox(
            width: double.infinity,
            child: DecoratedBox(
              decoration: BoxDecoration(gradient: AppGradients.signature, borderRadius: BorderRadius.circular(AppRadius.full), boxShadow: AppShadows.ambient),
              child: ElevatedButton(
                onPressed: _saving ? null : _save,
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size.fromHeight(60),
                  backgroundColor: Colors.transparent,
                  shadowColor: Colors.transparent,
                  foregroundColor: Colors.white,
                  disabledForegroundColor: Colors.white70,
                  textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.full)),
                ),
                child: Text(_saving ? 'Enregistrement...' : 'Enregistrer'),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
