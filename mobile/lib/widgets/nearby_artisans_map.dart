import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

import '../core/config/app_theme.dart';
import '../models/artisan.dart';
import '../utils/category_icons.dart';

/// Default map center used whenever no artisan (or the signed-in user) has a
/// known GPS position: Ouagadougou, FasoConnect's pilot city.
const LatLng defaultMapCenter = LatLng(12.3714, -1.5197);

/// Compact, mostly decorative map preview used on the home screen: real
/// OpenStreetMap tiles with pins for artisans that have a known location,
/// scattered around the city center as a fallback otherwise so the section
/// never renders empty.
class NearbyArtisansMap extends StatelessWidget {
  const NearbyArtisansMap({super.key, required this.artisans, this.height = 240, this.interactive = false});

  final List<Artisan> artisans;
  final double height;
  final bool interactive;

  List<MapEntry<Artisan, LatLng>> _points() {
    final located = artisans.where((a) => a.hasLocation).map((a) => MapEntry(a, LatLng(a.latitude!, a.longitude!))).toList();
    if (located.isNotEmpty) return located;

    // No artisan carries GPS coordinates yet (common before a city rollout
    // finishes onboarding) — scatter a handful around the default center so
    // the map still reads as "artisans nearby" rather than an empty void.
    const offsets = [LatLng(0.01, -0.01), LatLng(-0.008, 0.012), LatLng(0.005, 0.015)];
    return [
      for (var i = 0; i < artisans.length && i < offsets.length; i++)
        MapEntry(artisans[i], LatLng(defaultMapCenter.latitude + offsets[i].latitude, defaultMapCenter.longitude + offsets[i].longitude)),
    ];
  }

  @override
  Widget build(BuildContext context) {
    final points = _points();
    return ClipRRect(
      borderRadius: BorderRadius.circular(AppRadius.xl),
      child: SizedBox(
        height: height,
        child: Stack(
          children: [
            FlutterMap(
              options: MapOptions(
                initialCenter: defaultMapCenter,
                initialZoom: 13,
                interactionOptions: InteractionOptions(flags: interactive ? InteractiveFlag.all : InteractiveFlag.none),
              ),
              children: [
                TileLayer(
                  urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                  userAgentPackageName: 'com.fasoconnect.mobile',
                ),
                MarkerLayer(
                  markers: [
                    for (final entry in points)
                      Marker(
                        point: entry.value,
                        width: 40,
                        height: 40,
                        child: _ArtisanPin(artisan: entry.key),
                      ),
                  ],
                ),
              ],
            ),
            Positioned(
              bottom: 12,
              right: 12,
              child: DecoratedBox(
                decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.9), shape: BoxShape.circle, boxShadow: AppShadows.ambient),
                child: const Padding(
                  padding: EdgeInsets.all(10),
                  child: Icon(Icons.my_location, color: AppColors.onSurface, size: 18),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ArtisanPin extends StatelessWidget {
  const _ArtisanPin({required this.artisan});

  final Artisan artisan;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: AppGradients.signature,
        shape: BoxShape.circle,
        border: Border.all(color: Colors.white, width: 2),
        boxShadow: AppShadows.ambient,
      ),
      child: Icon(iconForCategory(artisan.category?.name ?? ''), color: Colors.white, size: 18),
    );
  }
}
