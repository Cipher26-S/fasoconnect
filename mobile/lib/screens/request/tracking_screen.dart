import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../core/config/app_theme.dart';
import '../../models/service_request.dart';
import '../../widgets/nearby_artisans_map.dart';

/// Static "Track Artisan" view: FasoConnect has no live GPS feed yet, so
/// this shows the artisan's registered position (or the city center as a
/// fallback) rather than pretending to stream a real-time location.
class TrackingScreen extends StatelessWidget {
  const TrackingScreen({super.key, required this.request});

  final ServiceRequest request;

  Future<void> _call() async {
    final phone = request.artisan?.user.phone;
    if (phone == null || phone.isEmpty) return;
    await launchUrl(Uri.parse('tel:$phone'));
  }

  Future<void> _whatsapp() async {
    final phone = request.artisan?.user.phone;
    if (phone == null || phone.isEmpty) return;
    final digits = phone.replaceAll(RegExp(r'[^0-9]'), '');
    await launchUrl(Uri.parse('https://wa.me/$digits'), mode: LaunchMode.externalApplication);
  }

  @override
  Widget build(BuildContext context) {
    final artisan = request.artisan;
    return Scaffold(
      backgroundColor: AppColors.surfaceContainerHigh,
      body: Column(
        children: [
          Expanded(
            child: Stack(
              children: [
                FlutterMap(
                  options: const MapOptions(initialCenter: defaultMapCenter, initialZoom: 13, interactionOptions: InteractionOptions(flags: InteractiveFlag.all)),
                  children: [
                    TileLayer(urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', userAgentPackageName: 'com.fasoconnect.mobile'),
                    MarkerLayer(
                      markers: [
                        Marker(
                          point: defaultMapCenter,
                          width: 48,
                          height: 48,
                          child: Container(
                            decoration: BoxDecoration(gradient: AppGradients.signature, shape: BoxShape.circle, border: Border.all(color: Colors.white, width: 3), boxShadow: AppShadows.ambient),
                            child: const Icon(Icons.handyman, color: Colors.white),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                SafeArea(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        _RoundButton(icon: Icons.arrow_back, onTap: () => Navigator.of(context).maybePop()),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(AppRadius.full), boxShadow: AppShadows.ambient),
                          child: const Text('Track Artisan', style: TextStyle(fontWeight: FontWeight.w800)),
                        ),
                        _RoundButton(icon: Icons.more_vert, onTap: () {}),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.fromLTRB(20, 24, 20, 28),
            decoration: const BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.xl))),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    CircleAvatar(
                      radius: 28,
                      backgroundColor: AppColors.surfaceContainerLow,
                      backgroundImage: artisan?.user.profilePicture != null ? NetworkImage(artisan!.user.profilePicture!) : null,
                      child: artisan?.user.profilePicture == null ? const Icon(Icons.person, color: AppColors.primary) : null,
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(artisan?.user.fullName ?? 'Artisan', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
                          Text(request.category?.name ?? 'Professionnel', style: Theme.of(context).textTheme.bodyMedium),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(color: AppColors.primaryFixed, borderRadius: BorderRadius.circular(AppRadius.md)),
                  child: Row(
                    children: [
                      const Icon(Icons.access_time, color: AppColors.primary, size: 18),
                      const SizedBox(width: 8),
                      Text(_statusLabel(request.status), style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w800)),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
                Row(
                  children: [
                    Expanded(child: _ContactButton(icon: Icons.call, label: 'APPELER', background: AppColors.secondary, onTap: _call)),
                    const SizedBox(width: 12),
                    Expanded(child: _ContactButton(icon: Icons.chat, label: 'MESSAGE', background: AppColors.primaryContainer, onTap: _whatsapp)),
                    const SizedBox(width: 12),
                    Expanded(child: _ContactButton(icon: Icons.info_outline, label: 'DÉTAILS', background: AppColors.surfaceContainerHigh, foreground: AppColors.onSurface, onTap: () {})),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _statusLabel(String status) {
    return switch (status) {
      'PENDING' => 'En attente d\'attribution',
      'ASSIGNED' => 'Artisan assigné',
      'ACCEPTED' => 'Artisan en route',
      'IN_PROGRESS' => 'Intervention en cours',
      _ => status,
    };
  }
}

class _RoundButton extends StatelessWidget {
  const _RoundButton({required this.icon, required this.onTap});

  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(AppRadius.full),
      child: Container(
        width: 42,
        height: 42,
        decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle, boxShadow: AppShadows.ambient),
        child: Icon(icon, color: AppColors.onSurface, size: 20),
      ),
    );
  }
}

class _ContactButton extends StatelessWidget {
  const _ContactButton({required this.icon, required this.label, required this.background, required this.onTap, this.foreground = Colors.white});

  final IconData icon;
  final String label;
  final Color background;
  final Color foreground;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(AppRadius.md),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(color: background, borderRadius: BorderRadius.circular(AppRadius.md)),
        child: Column(
          children: [
            Icon(icon, color: foreground),
            const SizedBox(height: 6),
            Text(label, style: TextStyle(color: foreground, fontSize: 10, fontWeight: FontWeight.w800)),
          ],
        ),
      ),
    );
  }
}
