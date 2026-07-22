import 'package:flutter/material.dart';

import '../providers/auth_provider.dart';
import '../screens/auth/auth_welcome_screen.dart';
import '../screens/auth/login_screen.dart';
import '../screens/auth/register_screen.dart';
import '../screens/home/home_screen.dart';
import '../screens/splash_screen.dart';

class AppRouter {
  static const splash = '/';
  static const authWelcome = '/welcome';
  static const login = '/login';
  static const register = '/register';
  static const home = '/home';

  static Route<dynamic> generate(RouteSettings settings, AuthProvider auth) {
    Widget screen;
    switch (settings.name) {
      case splash:
        screen = const SplashScreen();
        break;
      case authWelcome:
        screen = auth.isAuthenticated ? const HomeScreen() : const AuthWelcomeScreen();
        break;
      case login:
        screen = auth.isAuthenticated ? const HomeScreen() : const LoginScreen();
        break;
      case register:
        screen = auth.isAuthenticated ? const HomeScreen() : const RegisterScreen();
        break;
      case home:
        screen = auth.isAuthenticated ? const HomeScreen() : const AuthWelcomeScreen();
        break;
      default:
        screen = auth.isAuthenticated ? const HomeScreen() : const AuthWelcomeScreen();
    }
    return MaterialPageRoute(builder: (_) => screen, settings: settings);
  }
}
