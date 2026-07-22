import 'dart:ui';

import 'package:flutter/material.dart';

/// Frosted-glass background used by the top app bar and bottom navigation,
/// matching the mockups' `.glass` / `.glass-nav` utility (85% opacity white
/// over a 16px backdrop blur).
class GlassSurface extends StatelessWidget {
  const GlassSurface({super.key, required this.child, this.border});

  final Widget child;
  final Border? border;

  @override
  Widget build(BuildContext context) {
    return ClipRect(
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 16, sigmaY: 16),
        child: DecoratedBox(
          decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.85), border: border),
          child: child,
        ),
      ),
    );
  }
}
