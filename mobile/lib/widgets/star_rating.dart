import 'package:flutter/material.dart';

import '../core/config/app_theme.dart';

/// Read-only row of 5 stars for displaying a rating value.
class StarRating extends StatelessWidget {
  const StarRating({super.key, required this.rating, this.size = 16});

  final num rating;
  final double size;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(5, (i) {
        final filled = i < rating.round();
        return Icon(filled ? Icons.star_rounded : Icons.star_outline_rounded, color: filled ? AppColors.gold : AppColors.outlineVariant, size: size);
      }),
    );
  }
}

/// Interactive 5-star picker used on the rating screen.
class StarRatingInput extends StatelessWidget {
  const StarRatingInput({super.key, required this.rating, required this.onChanged, this.size = 40});

  final int rating;
  final ValueChanged<int> onChanged;
  final double size;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(5, (i) {
        final value = i + 1;
        final filled = value <= rating;
        return IconButton(
          onPressed: () => onChanged(value),
          icon: Icon(filled ? Icons.star_rounded : Icons.star_outline_rounded, color: filled ? AppColors.primaryContainer : AppColors.primaryFixed, size: size),
        );
      }),
    );
  }
}
