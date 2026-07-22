import 'package:flutter/material.dart';

import '../core/config/app_theme.dart';

class SignatureButton extends StatelessWidget {
  const SignatureButton({super.key, required this.label, required this.onPressed, this.loading = false, this.icon = Icons.arrow_forward});

  final String label;
  final VoidCallback? onPressed;
  final bool loading;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        gradient: const LinearGradient(colors: [AppColors.primary, AppColors.flame], begin: Alignment.centerLeft, end: Alignment.centerRight),
        borderRadius: BorderRadius.circular(999),
        boxShadow: const [BoxShadow(color: Color(0x1F1E2A38), blurRadius: 32, offset: Offset(0, 12))],
      ),
      child: ElevatedButton.icon(
        onPressed: loading ? null : onPressed,
        icon: loading
            ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
            : Icon(icon),
        label: Text(loading ? 'Veuillez patienter...' : label),
        style: ElevatedButton.styleFrom(
          minimumSize: const Size.fromHeight(62),
          elevation: 0,
          backgroundColor: Colors.transparent,
          disabledBackgroundColor: Colors.transparent,
          foregroundColor: Colors.white,
          textStyle: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
        ),
      ),
    );
  }
}
