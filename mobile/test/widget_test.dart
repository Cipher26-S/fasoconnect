import 'package:flutter_test/flutter_test.dart';

import 'package:fasoconnect_mobile/main.dart';

void main() {
  testWidgets('App boots to the splash screen', (WidgetTester tester) async {
    await tester.pumpWidget(const FasoConnectApp());
    await tester.pump();

    expect(find.text('FasoConnect'), findsOneWidget);
  });
}
