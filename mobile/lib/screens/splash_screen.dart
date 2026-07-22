import 'dart:async';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/config/app_theme.dart';
import '../providers/auth_provider.dart';
import '../routes/app_router.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
  late final AnimationController _dotsController;

  @override
  void initState() {
    super.initState();
    _dotsController = AnimationController(vsync: this, duration: const Duration(milliseconds: 1200))..repeat();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      final auth = context.read<AuthProvider>();
      final minimumSplash = Future<void>.delayed(const Duration(milliseconds: 1400));
      while (auth.bootstrapping) {
        await Future<void>.delayed(const Duration(milliseconds: 80));
      }
      await minimumSplash;
      if (!mounted) return;
      Navigator.of(context).pushReplacementNamed(auth.isAuthenticated ? AppRouter.home : AppRouter.authWelcome);
    });
  }

  @override
  void dispose() {
    _dotsController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.primaryContainer,
      body: Stack(
        children: [
          const _DecorativeBlobs(),
          SafeArea(
            child: Center(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 32),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Stack(
                      alignment: Alignment.center,
                      children: [
                        Container(
                          width: 128,
                          height: 128,
                          decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.10), shape: BoxShape.circle),
                        ),
                        Container(
                          width: 96,
                          height: 96,
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(AppRadius.lg),
                            boxShadow: const [BoxShadow(color: Color(0x1A000000), blurRadius: 24, offset: Offset(0, 12))],
                          ),
                          child: const Icon(Icons.handyman, color: AppColors.primaryContainer, size: 48),
                        ),
                      ],
                    ),
                    const SizedBox(height: 48),
                    Text(
                      'FasoConnect',
                      style: Theme.of(context).textTheme.headlineLarge?.copyWith(color: Colors.white, fontSize: 44, fontWeight: FontWeight.w800, letterSpacing: -1),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Trouver un artisan près\nde vous',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: Colors.white.withValues(alpha: 0.9), fontSize: 18, fontWeight: FontWeight.w600, height: 1.4),
                    ),
                    const SizedBox(height: 88),
                    AnimatedBuilder(
                      animation: _dotsController,
                      builder: (context, _) {
                        final active = (_dotsController.value * 3).floor() % 3;
                        return Row(
                          mainAxisSize: MainAxisSize.min,
                          children: List.generate(3, (i) {
                            final on = i == active;
                            return AnimatedContainer(
                              duration: const Duration(milliseconds: 200),
                              margin: const EdgeInsets.symmetric(horizontal: 4),
                              width: 8,
                              height: 8,
                              decoration: BoxDecoration(color: Colors.white.withValues(alpha: on ? 1 : 0.4), shape: BoxShape.circle),
                            );
                          }),
                        );
                      },
                    ),
                  ],
                ),
              ),
            ),
          ),
          Positioned(
            bottom: 48,
            left: 0,
            right: 0,
            child: Text(
              'ARTISANAT DE QUALITÉ • SERVICE DE PROXIMITÉ',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.white.withValues(alpha: 0.6), fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 1.4),
            ),
          ),
        ],
      ),
    );
  }
}

class _DecorativeBlobs extends StatelessWidget {
  const _DecorativeBlobs();

  @override
  Widget build(BuildContext context) {
    return IgnorePointer(
      child: Stack(
        children: [
          Positioned(
            top: -120,
            right: -120,
            child: _blob(256, Colors.white.withValues(alpha: 0.05)),
          ),
          Positioned(
            bottom: -140,
            left: -140,
            child: _blob(320, Colors.black.withValues(alpha: 0.05)),
          ),
        ],
      ),
    );
  }

  Widget _blob(double size, Color color) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(color: color, shape: BoxShape.circle),
    );
  }
}
