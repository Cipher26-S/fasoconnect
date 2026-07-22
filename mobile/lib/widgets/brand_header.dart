import 'package:flutter/material.dart';

import '../core/config/app_theme.dart';

class BrandHeader extends StatelessWidget {
  const BrandHeader({super.key, this.compact = false});

  final bool compact;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 46,
          height: 46,
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)),
          child: const Icon(Icons.location_pin, color: AppColors.primary),
        ),
        if (!compact) ...[
          const SizedBox(width: 12),
          const Text('FasoConnect', style: TextStyle(fontSize: 26, fontWeight: FontWeight.w900, color: AppColors.ink)),
        ],
      ],
    );
  }
}
