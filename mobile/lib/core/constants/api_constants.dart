import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;

class ApiConstants {
  // Free delivery threshold aligned with web and backend
  static const double freeShippingThreshold = 60.0;
  static const double standardShippingFee = 6.0;

  // Compile-time environment override via --dart-define=API_BASE_URL=...
  static const String _envBaseUrl = String.fromEnvironment('API_BASE_URL');

  static String get baseUrl {
    if (_envBaseUrl.isNotEmpty) {
      return _envBaseUrl;
    }

    if (kIsWeb) {
      return 'http://localhost:8000/api/v1';
    }

    // Android emulator loops back to host machine via 10.0.2.2
    if (Platform.isAndroid) {
      return 'http://10.0.2.2:8000/api/v1';
    }

    // iOS Simulator loops back to host via localhost
    if (Platform.isIOS) {
      return 'http://127.0.0.1:8000/api/v1';
    }

    return 'http://localhost:8000/api/v1';
  }

  // API v1 Endpoints matching Phase 3 FastAPI router
  static const String productsEndpoint = '/products/';
  static const String categoriesEndpoint = '/categories/';
  static const String ordersEndpoint = '/orders/';
  static const String healthEndpoint = '/health';
}
