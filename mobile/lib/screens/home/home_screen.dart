import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../providers/auth_provider.dart';
import '../../providers/catalog_provider.dart';
import '../../providers/workflow_provider.dart';
import '../../widgets/app_bottom_nav.dart';
import '../artisan/artisan_onboarding_screen.dart';
import 'tabs/home_tab.dart';
import 'tabs/messages_tab.dart';
import 'tabs/profile_tab.dart';
import 'tabs/requests_tab.dart';
import 'tabs/search_tab.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _index = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback(_bootstrap);
  }

  Future<void> _bootstrap(Duration _) async {
    final catalog = context.read<CatalogProvider>();
    final workflow = context.read<WorkflowProvider>();
    await catalog.load();
    await workflow.load();

    if (!mounted) return;
    if (context.read<AuthProvider>().user?.role == 'ARTISAN') {
      await catalog.loadMyArtisanProfile();
      if (!mounted) return;
      if (catalog.myArtisanProfile == null) {
        Navigator.of(context).push(MaterialPageRoute(builder: (_) => const ArtisanOnboardingScreen()));
      }
    }
  }

  void _goTo(int index) => setState(() => _index = index);

  @override
  Widget build(BuildContext context) {
    final role = context.watch<AuthProvider>().user?.role;
    final pages = [
      HomeTab(onFindNow: () => _goTo(1)),
      const SearchTab(),
      const RequestsTab(),
      const MessagesTab(),
      const ProfileTab(),
    ];

    return Scaffold(
      body: IndexedStack(index: _index, children: pages),
      bottomNavigationBar: AppBottomNav(index: _index, onChanged: _goTo, destinations: navDestinationsForRole(role)),
    );
  }
}
