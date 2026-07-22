import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/config/app_theme.dart';
import '../../providers/auth_provider.dart';
import '../../routes/app_router.dart';
import '../../widgets/brand_header.dart';
import '../../widgets/signature_button.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    final auth = context.read<AuthProvider>();
    final ok = await auth.login(email: _emailController.text.trim(), password: _passwordController.text);
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
                const SizedBox(height: 42),
                Text('FasoConnect', style: Theme.of(context).textTheme.headlineLarge),
                const SizedBox(height: 14),
                Text("L'excellence de l'artisanat local a portee de main.", style: Theme.of(context).textTheme.bodyLarge),
                const SizedBox(height: 48),
                TextFormField(
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  decoration: const InputDecoration(prefixIcon: Icon(Icons.email_outlined), labelText: 'Email'),
                  validator: (value) => value == null || value.isEmpty ? 'Email requis' : null,
                ),
                const SizedBox(height: 18),
                TextFormField(
                  controller: _passwordController,
                  obscureText: true,
                  decoration: const InputDecoration(prefixIcon: Icon(Icons.lock_outline), labelText: 'Mot de passe'),
                  validator: (value) => value == null || value.isEmpty ? 'Mot de passe requis' : null,
                ),
                if (auth.error != null) ...[
                  const SizedBox(height: 18),
                  Text(auth.error!, style: const TextStyle(color: Colors.red, fontWeight: FontWeight.w700)),
                ],
                const SizedBox(height: 28),
                SignatureButton(label: 'Se connecter', loading: auth.loading, onPressed: _submit),
                const SizedBox(height: 20),
                Center(
                  child: TextButton(
                    onPressed: () => Navigator.of(context).pushNamed(AppRouter.register),
                    child: const Text('Creer un compte', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w900)),
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
