import 'package:flutter/material.dart';

import '../core/config/app_theme.dart';
import 'glass_surface.dart';

class AppNavDestination {
  const AppNavDestination({required this.icon, required this.activeIcon, required this.label});

  final IconData icon;
  final IconData activeIcon;
  final String label;
}

const List<AppNavDestination> appNavDestinations = [
  AppNavDestination(icon: Icons.home_outlined, activeIcon: Icons.home, label: 'Accueil'),
  AppNavDestination(icon: Icons.search, activeIcon: Icons.search, label: 'Recherche'),
  AppNavDestination(icon: Icons.assignment_turned_in_outlined, activeIcon: Icons.assignment_turned_in, label: 'Mes demandes'),
  AppNavDestination(icon: Icons.chat_bubble_outline, activeIcon: Icons.chat_bubble, label: 'Messages'),
  AppNavDestination(icon: Icons.person_outline, activeIcon: Icons.person, label: 'Profil'),
];

/// Frosted, pill-highlighted bottom navigation matching the mockups' glass
/// nav bar. The "Messages" destination has no backend yet, so tapping it
/// surfaces a "coming soon" notice instead of a broken screen.
class AppBottomNav extends StatelessWidget {
  const AppBottomNav({super.key, required this.index, required this.onChanged});

  final int index;
  final ValueChanged<int> onChanged;

  @override
  Widget build(BuildContext context) {
    return GlassSurface(
      border: Border(top: BorderSide(color: AppColors.outlineVariant.withValues(alpha: 0.15))),
      child: SafeArea(
        top: false,
        child: SizedBox(
          height: 76,
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              for (var i = 0; i < appNavDestinations.length; i++)
                Expanded(
                  child: _NavItem(destination: appNavDestinations[i], active: i == index, onTap: () => onChanged(i)),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  const _NavItem({required this.destination, required this.active, required this.onTap});

  final AppNavDestination destination;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final color = active ? AppColors.primary : AppColors.onSurfaceVariant;
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(AppRadius.md),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 8),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: active ? AppColors.primaryFixedDim.withValues(alpha: 0.3) : Colors.transparent,
                borderRadius: BorderRadius.circular(AppRadius.full),
              ),
              child: Icon(active ? destination.activeIcon : destination.icon, color: color, size: 22),
            ),
            const SizedBox(height: 4),
            Text(
              destination.label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 10, fontWeight: active ? FontWeight.w800 : FontWeight.w500, color: color, letterSpacing: -0.1),
            ),
          ],
        ),
      ),
    );
  }
}
