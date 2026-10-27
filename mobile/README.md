# SmartGlow Mobile (Flutter & Dart)

The SmartGlow mobile client is a unified cross-platform application for Android and iOS providing native camera capture for AI skin analysis, cosmetics shopping, and real-time order tracking.

## Architecture & State Management
- **Framework**: Flutter 3.x with Dart 3.x
- **State Management**: Riverpod / Bloc
- **Networking**: Dio with JWT Bearer Interceptors
- **Camera**: `camera` and `image_picker` plugins with client-side image compression
- **Local Storage**: `flutter_secure_storage` for token persistence

## Directory Structure
```
mobile/
├── android/
├── ios/
├── lib/
│   ├── core/
│   │   ├── constants/
│   │   ├── network/
│   │   └── theme/
│   ├── features/
│   │   ├── auth/
│   │   ├── catalog/
│   │   ├── cart/
│   │   ├── orders/
│   │   └── skin_analysis/
│   ├── shared/
│   │   └── widgets/
│   └── main.dart
├── test/
├── pubspec.yaml
└── README.md
```

## Running the Mobile App
```bash
flutter pub get
flutter run
```
