import 'package:flutter/material.dart';
import 'core/theme/app_theme.dart';
import 'state/catalog_state.dart';
import 'state/cart_state.dart';
import 'screens/home_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const SmartGlowMobileApp());
}

class SmartGlowMobileApp extends StatefulWidget {
  const SmartGlowMobileApp({super.key});

  @override
  State<SmartGlowMobileApp> createState() => _SmartGlowMobileAppState();
}

class _SmartGlowMobileAppState extends State<SmartGlowMobileApp> {
  late final CatalogState _catalogState;
  late final CartState _cartState;

  @override
  void initState() {
    super.initState();
    _catalogState = CatalogState();
    _cartState = CartState();
    _catalogState.initialize();
  }

  @override
  void dispose() {
    _catalogState.dispose();
    _cartState.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SmartGlow Cosmetics',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: HomeScreen(
        catalogState: _catalogState,
        cartState: _cartState,
      ),
    );
  }
}
