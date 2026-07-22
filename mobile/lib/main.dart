import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'core/config/app_theme.dart';
import 'providers/auth_provider.dart';
import 'providers/catalog_provider.dart';
import 'providers/workflow_provider.dart';
import 'routes/app_router.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const FasoConnectApp());
}

class FasoConnectApp extends StatelessWidget {
  const FasoConnectApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()..bootstrap()),
        ChangeNotifierProvider(create: (context) => CatalogProvider(context.read<AuthProvider>())),
        ChangeNotifierProvider(create: (context) => WorkflowProvider(context.read<AuthProvider>())),
      ],
      child: Consumer<AuthProvider>(
        builder: (context, auth, _) {
          return MaterialApp(
            title: 'FasoConnect',
            debugShowCheckedModeBanner: false,
            theme: AppTheme.light(),
            initialRoute: AppRouter.splash,
            onGenerateRoute: (settings) => AppRouter.generate(settings, auth),
          );
        },
      ),
    );
  }
}
