import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../providers/catalog_provider.dart';
import '../../providers/workflow_provider.dart';
import '../../widgets/app_bottom_nav.dart';
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
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<CatalogProvider>().load();
      context.read<WorkflowProvider>().load();
    });
  }

  void _goTo(int index) => setState(() => _index = index);

  @override
  Widget build(BuildContext context) {
    final pages = [
      HomeTab(onFindNow: () => _goTo(1)),
      const SearchTab(),
      const RequestsTab(),
      const MessagesTab(),
      const ProfileTab(),
    ];

    return Scaffold(
      body: IndexedStack(index: _index, children: pages),
      bottomNavigationBar: AppBottomNav(index: _index, onChanged: _goTo),
    );
  }
}
