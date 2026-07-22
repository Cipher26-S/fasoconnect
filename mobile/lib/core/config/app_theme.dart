import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Design tokens for the "Editorial Artisan Core" design system.
/// Mirrors the token set used across the Stitch mockups so the app and the
/// design reference stay in sync.
class AppColors {
  static const primary = Color(0xFFA04100);
  static const primaryContainer = Color(0xFFFF6B00);
  static const onPrimary = Color(0xFFFFFFFF);
  static const onPrimaryContainer = Color(0xFF572000);
  static const primaryFixed = Color(0xFFFFDBCC);
  static const primaryFixedDim = Color(0xFFFFB693);

  static const secondary = Color(0xFF535F6F);
  static const secondaryContainer = Color(0xFFD4E1F4);
  static const onSecondary = Color(0xFFFFFFFF);
  static const onSecondaryContainer = Color(0xFF576474);

  static const tertiary = Color(0xFF0062A1);
  static const tertiaryContainer = Color(0xFF059EFF);

  static const surface = Color(0xFFF9F9F9);
  static const surfaceDim = Color(0xFFDADADA);
  static const surfaceBright = Color(0xFFF9F9F9);
  static const surfaceContainerLowest = Color(0xFFFFFFFF);
  static const surfaceContainerLow = Color(0xFFF3F3F3);
  static const surfaceContainer = Color(0xFFEEEEEE);
  static const surfaceContainerHigh = Color(0xFFE8E8E8);
  static const surfaceContainerHighest = Color(0xFFE2E2E2);
  static const surfaceVariant = Color(0xFFE2E2E2);

  static const onSurface = Color(0xFF1A1C1C);
  static const onSurfaceVariant = Color(0xFF5A4136);
  static const outline = Color(0xFF8E7164);
  static const outlineVariant = Color(0xFFE2BFB0);

  static const error = Color(0xFFBA1A1A);
  static const errorContainer = Color(0xFFFFDAD6);
  static const onErrorContainer = Color(0xFF93000A);

  static const whatsapp = Color(0xFF25D366);
  static const gold = Color(0xFFFFB800);

  // Legacy aliases kept so older call sites keep compiling while screens
  // are migrated over to the full token set.
  static const flame = primaryContainer;
  static const ink = onSurface;
  static const slate = secondary;
  static const soft = surfaceContainerLow;
  static const raised = surfaceContainerHigh;
}

class AppRadius {
  static const sm = 12.0;
  static const md = 16.0;
  static const lg = 24.0;
  static const xl = 32.0;
  static const full = 999.0;
}

class AppShadows {
  static const ambient = [
    BoxShadow(color: Color(0x141E2A38), blurRadius: 32, offset: Offset(0, 12)),
  ];

  static const glow = [
    BoxShadow(color: Color(0x66FF6B00), blurRadius: 25, offset: Offset(0, 10)),
  ];
}

class AppGradients {
  static const signature = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [AppColors.primary, AppColors.primaryContainer],
  );
}

class AppTheme {
  static TextTheme _textTheme() {
    final headline = GoogleFonts.plusJakartaSansTextTheme();
    final body = GoogleFonts.beVietnamProTextTheme();
    return body
        .copyWith(
          displayLarge: headline.displayLarge,
          displayMedium: headline.displayMedium,
          displaySmall: headline.displaySmall,
          headlineLarge: headline.headlineLarge,
          headlineMedium: headline.headlineMedium,
          headlineSmall: headline.headlineSmall,
          titleLarge: headline.titleLarge,
          titleMedium: headline.titleMedium,
          titleSmall: headline.titleSmall,
        )
        .apply(bodyColor: AppColors.onSurface, displayColor: AppColors.onSurface)
        .copyWith(
          headlineLarge: headline.headlineLarge?.copyWith(fontSize: 40, fontWeight: FontWeight.w800, letterSpacing: -0.8, height: 1.05, color: AppColors.onSurface),
          headlineMedium: headline.headlineMedium?.copyWith(fontSize: 28, fontWeight: FontWeight.w800, letterSpacing: -0.5, color: AppColors.onSurface),
          titleLarge: headline.titleLarge?.copyWith(fontSize: 22, fontWeight: FontWeight.w800, letterSpacing: -0.3, color: AppColors.onSurface),
          titleMedium: headline.titleMedium?.copyWith(fontSize: 17, fontWeight: FontWeight.w700, color: AppColors.onSurface),
          bodyLarge: body.bodyLarge?.copyWith(fontSize: 17, color: AppColors.secondary, height: 1.45),
          bodyMedium: body.bodyMedium?.copyWith(fontSize: 15, color: AppColors.secondary, height: 1.4),
          bodySmall: body.bodySmall?.copyWith(fontSize: 13, color: AppColors.onSurfaceVariant),
          labelLarge: body.labelLarge?.copyWith(fontSize: 13, fontWeight: FontWeight.w700, letterSpacing: 0.5, color: AppColors.secondary),
          labelSmall: body.labelSmall?.copyWith(fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 1.0, color: AppColors.secondary),
        );
  }

  static ThemeData light() {
    final textTheme = _textTheme();
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: AppColors.surface,
      splashFactory: NoSplash.splashFactory,
      colorScheme: const ColorScheme.light(
        primary: AppColors.primary,
        onPrimary: AppColors.onPrimary,
        primaryContainer: AppColors.primaryFixed,
        secondary: AppColors.secondary,
        onSecondary: AppColors.onSecondary,
        secondaryContainer: AppColors.secondaryContainer,
        tertiary: AppColors.tertiary,
        surface: AppColors.surface,
        onSurface: AppColors.onSurface,
        surfaceContainerHighest: AppColors.surfaceContainerHighest,
        error: AppColors.error,
        errorContainer: AppColors.errorContainer,
        outline: AppColors.outline,
        outlineVariant: AppColors.outlineVariant,
      ),
      textTheme: textTheme,
      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.surface,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: AppColors.onSurface),
        titleTextStyle: textTheme.titleLarge,
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.surfaceContainerLow,
        hintStyle: TextStyle(color: AppColors.onSurfaceVariant.withValues(alpha: 0.5)),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(AppRadius.md), borderSide: BorderSide.none),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(AppRadius.md), borderSide: BorderSide.none),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
          borderSide: const BorderSide(color: AppColors.primary, width: 2),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 18),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: AppColors.surfaceContainerLow,
        labelStyle: textTheme.bodyMedium,
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.full)),
        side: BorderSide.none,
      ),
      dividerTheme: DividerThemeData(color: AppColors.outlineVariant.withValues(alpha: 0.2)),
    );
  }
}
