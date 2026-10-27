import 'dart:typed_data';

/// Interface defining the contract for camera capture and image validation
/// prepared for Phase 6 (AI Skin Analysis).
///
/// In Phase 4, no actual camera hardware permissions are prompted to avoid
/// premature user intrusion.
enum CameraStatus {
  uninitialized,
  permissionDenied,
  ready,
  capturing,
  failed,
}

class ImageQualityCheck {
  final bool isAdequateResolution;
  final bool isSufficientLighting;
  final bool isFaceCentered;
  final String? feedbackMessage;

  const ImageQualityCheck({
    required this.isAdequateResolution,
    required this.isSufficientLighting,
    required this.isFaceCentered,
    this.feedbackMessage,
  });

  bool get isReadyForAnalysis =>
      isAdequateResolution && isSufficientLighting && isFaceCentered;
}

abstract class SkinAnalysisCameraBoundary {
  /// Request explicit customer consent prior to initializing camera preview.
  /// User photos must remain strictly ephemeral and never stored without consent.
  Future<bool> requestConsentAndPermissions();

  /// Initialize camera controller with standard resolution preset (1080p).
  Future<CameraStatus> initializeCamera();

  /// Capture still facial photograph as uncompressed byte buffer.
  Future<Uint8List?> captureFrame();

  /// Perform non-clinical client-side lighting and blur assessment.
  Future<ImageQualityCheck> validateImageQuality(Uint8List imageBytes);

  /// Release camera resources and dispose controller immediately.
  Future<void> dispose();
}
