# SmartGlow Mobile (Flutter & Dart for Android and iOS)

SmartGlow Mobile provides a unified, cross-platform e-commerce shopping experience for cosmetics, botanical skincare, and AI-driven recommendations.

---

## 📱 Architecture & Folder Structure

```
mobile/
├── pubspec.yaml                  # Flutter dependencies & assets
├── lib/
│   ├── main.dart                 # Application entry point
│   ├── core/
│   │   ├── constants/            # API endpoints & platform networking
│   │   └── theme/                # Luxury cosmetics colors & typography
│   ├── data/
│   │   └── demo_products.dart    # High-fidelity offline cosmetics catalog
│   ├── models/                   # Category, Product, CartItem, Order models
│   ├── services/
│   │   ├── api_service.dart      # HTTP client with graceful offline fallback
│   │   └── camera_service_boundary.dart  # Phase 6 AI skin analysis interface
│   ├── state/                    # ChangeNotifier providers (CartState, CatalogState)
│   ├── widgets/                  # ProductCard, FreeShippingMeter, CategoryChipBar, FilterSheet
│   └── screens/                  # HomeScreen, ProductDetailScreen, CartScreen, OrderConfirmationScreen
└── test/
    ├── cart_calculation_test.dart
    └── product_filtering_test.dart
```

---

## 🌐 Network Configuration for Android & iOS

The FastAPI backend runs on port 8000. Mobile environments route network traffic as follows:

| Client Environment | Default Host Address | Configuration Command |
|---|---|---|
| **Android Emulator** | `http://10.0.2.2:8000/api/v1` | Handled automatically by `ApiConstants` |
| **iOS Simulator** | `http://127.0.0.1:8000/api/v1` | Handled automatically by `ApiConstants` |
| **Physical Phone (Wi-Fi LAN)** | `http://<YOUR_PC_IP>:8000/api/v1` | `flutter run --dart-define=API_BASE_URL=http://192.168.1.X:8000/api/v1` |
| **Production Server** | `https://api.yourdomain.com/api/v1` | `flutter run --dart-define=API_BASE_URL=https://api.yourdomain.com/api/v1` |

---

## 🚀 Running the Flutter App

```bash
cd mobile

# 1. Fetch dependencies
flutter pub get

# 2. Run automated test suites
flutter test

# 3. Launch the application (select connected device)
flutter run
```

---

## 📷 Future Camera & AI Preparation (Phase 6)

`mobile/lib/services/camera_service_boundary.dart` provides clean architectural separation for future AI skin analysis:
- No camera hardware permissions are prompted prematurely in Phase 4.
- In Phase 6, photos are processed ephemerally in memory without persistent local storage unless customer grants explicit consent.
