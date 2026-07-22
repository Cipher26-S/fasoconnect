import 'package:flutter/material.dart';

/// Maps a category name to a representative icon, matching the trade icons
/// used across the mockups (plumbing, electrician, mason, ...).
IconData iconForCategory(String name) {
  final value = name.toLowerCase();
  if (value.contains('plomb')) return Icons.plumbing;
  if (value.contains('électric') || value.contains('electric')) return Icons.bolt;
  if (value.contains('maçon') || value.contains('macon')) return Icons.construction;
  if (value.contains('menuis') || value.contains('carpent')) return Icons.carpenter;
  if (value.contains('mécanic') || value.contains('mecanic')) return Icons.handyman;
  if (value.contains('peint')) return Icons.format_paint;
  if (value.contains('soud')) return Icons.build_circle_outlined;
  if (value.contains('répar') || value.contains('repar')) return Icons.home_repair_service;
  if (value.contains('nettoy') || value.contains('ménage') || value.contains('menage')) return Icons.cleaning_services;
  if (value.contains('solaire')) return Icons.solar_power;
  if (value.contains('inform') || value.contains('it ')) return Icons.computer;
  return Icons.handyman;
}
