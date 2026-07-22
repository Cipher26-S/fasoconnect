import 'package:flutter/material.dart';

import '../../core/config/app_theme.dart';
import '../../routes/app_router.dart';

/// Entry choice screen shown before login/register, matching the
/// "connexion_inscription" mockup: full-bleed artisan photo, wordmark, two
/// primary actions, and a row of alternative sign-in methods.
///
/// Phone / WhatsApp / Google sign-in are visual only for now: the backend
/// only supports email+password authentication, so tapping them explains
/// that rather than pretending to work.
class AuthWelcomeScreen extends StatelessWidget {
  const AuthWelcomeScreen({super.key});

  void _comingSoon(BuildContext context, String method) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Connexion via $method bientôt disponible.')),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      body: Stack(
        fit: StackFit.expand,
        children: [
          Image.asset('assets/images/artisan_hero.jpg', fit: BoxFit.cover, errorBuilder: (_, __, ___) => Container(color: AppColors.surfaceContainerHigh)),
          DecoratedBox(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.bottomCenter,
                end: Alignment.topCenter,
                colors: [AppColors.surface, AppColors.surface.withValues(alpha: 0.55), Colors.transparent],
              ),
            ),
          ),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Column(
                children: [
                  const SizedBox(height: 32),
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceContainerLowest,
                      borderRadius: BorderRadius.circular(AppRadius.md),
                      boxShadow: AppShadows.ambient,
                    ),
                    child: const Icon(Icons.location_on, color: AppColors.primary, size: 32),
                  ),
                  const SizedBox(height: 20),
                  Text('FasoConnect', style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontSize: 32)),
                  const SizedBox(height: 8),
                  Text(
                    "L'excellence de l'artisanat local à portée de main.",
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.bodyLarge,
                  ),
                  const Spacer(),
                  SizedBox(
                    width: double.infinity,
                    child: DecoratedBox(
                      decoration: BoxDecoration(gradient: AppGradients.signature, borderRadius: BorderRadius.circular(AppRadius.full)),
                      child: ElevatedButton.icon(
                        onPressed: () => Navigator.of(context).pushNamed(AppRouter.register),
                        style: ElevatedButton.styleFrom(
                          minimumSize: const Size.fromHeight(58),
                          backgroundColor: Colors.transparent,
                          shadowColor: Colors.transparent,
                          foregroundColor: Colors.white,
                          textStyle: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.full)),
                        ),
                        icon: const Icon(Icons.arrow_forward, size: 18),
                        label: const Text('Créer un compte'),
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () => Navigator.of(context).pushNamed(AppRouter.login),
                      style: ElevatedButton.styleFrom(
                        minimumSize: const Size.fromHeight(58),
                        backgroundColor: AppColors.secondary,
                        foregroundColor: Colors.white,
                        elevation: 0,
                        textStyle: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.full)),
                      ),
                      child: const Text('Se connecter'),
                    ),
                  ),
                  const SizedBox(height: 22),
                  Row(
                    children: [
                      Expanded(child: Divider(color: AppColors.outlineVariant.withValues(alpha: 0.3))),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        child: Text('OU CONTINUER AVEC', style: Theme.of(context).textTheme.labelSmall),
                      ),
                      Expanded(child: Divider(color: AppColors.outlineVariant.withValues(alpha: 0.3))),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(child: _SocialButton(icon: Icons.call_outlined, label: 'Téléphone', onTap: () => _comingSoon(context, 'téléphone'))),
                      const SizedBox(width: 12),
                      Expanded(child: _SocialButton(icon: Icons.chat, label: 'WhatsApp', iconColor: AppColors.whatsapp, onTap: () => _comingSoon(context, 'WhatsApp'))),
                      const SizedBox(width: 12),
                      Expanded(child: _SocialButton(icon: Icons.g_mobiledata, label: 'Google', onTap: () => _comingSoon(context, 'Google'))),
                    ],
                  ),
                  const SizedBox(height: 24),
                  Padding(
                    padding: const EdgeInsets.only(bottom: 16),
                    child: RichText(
                      textAlign: TextAlign.center,
                      text: TextSpan(
                        style: Theme.of(context).textTheme.bodySmall,
                        children: const [
                          TextSpan(text: 'En continuant, vous acceptez nos '),
                          TextSpan(text: "Conditions d'utilisation", style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w700)),
                        ],
                      ),
                    ),
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

class _SocialButton extends StatelessWidget {
  const _SocialButton({required this.icon, required this.label, required this.onTap, this.iconColor});

  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final Color? iconColor;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(AppRadius.sm),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          color: AppColors.surfaceContainerLowest.withValues(alpha: 0.9),
          borderRadius: BorderRadius.circular(AppRadius.sm),
          border: Border.all(color: AppColors.outlineVariant.withValues(alpha: 0.15)),
        ),
        child: Column(
          children: [
            Icon(icon, color: iconColor ?? AppColors.onSurfaceVariant, size: 22),
            const SizedBox(height: 6),
            Text(label, style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w700, letterSpacing: 0.6, color: AppColors.onSurface)),
          ],
        ),
      ),
    );
  }
}
