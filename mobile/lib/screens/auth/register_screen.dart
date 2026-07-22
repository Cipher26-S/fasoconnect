import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/config/app_theme.dart';
import '../../providers/auth_provider.dart';
import '../../routes/app_router.dart';
import '../../widgets/brand_header.dart';
import '../../widgets/signature_button.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _fullNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  String _role = 'CUSTOMER';

  @override
  void dispose() {
    _fullNameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    final auth = context.read<AuthProvider>();
    final ok = await auth.register(
      fullName: _fullNameController.text.trim(),
      email: _emailController.text.trim(),
      phone: _phoneController.text.trim(),
      password: _passwordController.text,
      role: _role,
    );
    if (ok && mounted) Navigator.of(context).pushReplacementNamed(AppRouter.home);
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 18),
                const Center(child: BrandHeader(compact: true)),
                const SizedBox(height: 36),
                Text('Creer un compte', style: Theme.of(context).textTheme.headlineLarge),
                const SizedBox(height: 14),
                Text('Trouvez rapidement un artisan local de confiance.', style: Theme.of(context).textTheme.bodyLarge),
                const SizedBox(height: 34),
                TextFormField(
                  controller: _fullNameController,
                  decoration: const InputDecoration(prefixIcon: Icon(Icons.person_outline), labelText: 'Nom complet'),
                  validator: (value) => value == null || value.length < 2 ? 'Nom complet requis' : null,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  decoration: const InputDecoration(prefixIcon: Icon(Icons.email_outlined), labelText: 'Email'),
                  validator: (value) => value == null || value.isEmpty ? 'Email requis' : null,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  decoration: const InputDecoration(prefixIcon: Icon(Icons.phone_outlined), labelText: 'Telephone'),
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _passwordController,
                  obscureText: true,
                  decoration: const InputDecoration(prefixIcon: Icon(Icons.lock_outline), labelText: 'Mot de passe'),
                  validator: (value) => value == null || value.length < 6 ? '6 caracteres minimum' : null,
                ),
                const SizedBox(height: 16),
                DropdownButtonFormField<String>(
                  value: _role,
                  decoration: const InputDecoration(prefixIcon: Icon(Icons.badge_outlined), labelText: 'Type de compte'),
                  items: const [
                    DropdownMenuItem(value: 'CUSTOMER', child: Text('Client')),
                    DropdownMenuItem(value: 'ARTISAN', child: Text('Artisan')),
                  ],
                  onChanged: (value) => setState(() => _role = value ?? 'CUSTOMER'),
                ),
                if (auth.error != null) ...[
                  const SizedBox(height: 18),
                  Text(auth.error!, style: const TextStyle(color: Colors.red, fontWeight: FontWeight.w700)),
                ],
                const SizedBox(height: 28),
                SignatureButton(label: 'Creer un compte', loading: auth.loading, onPressed: _submit),
                const SizedBox(height: 16),
                Center(
                  child: TextButton(
                    onPressed: () => Navigator.of(context).pop(),
                    child: const Text('Se connecter', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w900)),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
