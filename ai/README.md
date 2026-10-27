# SmartGlow AI — Computer Vision & Skin Analysis Engine

This service handles skin diagnostics, image quality validation, and facial region segmentation using OpenCV and TensorFlow/Keras.

## 1. Supported Skin Characteristics
- **Skin Type Estimation**: Oily, Dry, Combination, Normal.
- **Surface Concerns**: Blemishes / Acne lesions, Redness / Sensitivity, Hyperpigmentation / Dark spots, Texture unevenness, Fine lines.
- **Undertone Analysis**: Warm, Cool, Neutral (for foundation & color matching).

## 2. Image Preprocessing Pipeline (OpenCV)
1. **Quality & Lighting Checks**:
   - Laplacian variance for blur detection (`variance > threshold`).
   - Mean luminance check to eliminate over/under-exposed photos.
2. **Face Localization & Alignment**:
   - Bounding box detection and landmark extraction (eyes, nose, cheeks, forehead).
3. **Region of Interest (ROI) Masking**:
   - Extract forehead, cheek, and T-zone patches for targeted texture and pore analysis.
4. **Color Normalization**:
   - White balance correction and histogram equalization.

## 3. Model Architecture
- **Backbone**: EfficientNet-B0 / MobileNetV3 feature extractor fine-tuned for multi-label skin concern classification.
- **Input Resolution**: 224x224 RGB normalized tensors.
- **Inference Mode**: Ephemeral execution — photos are processed in memory and discarded immediately unless user explicitly consents to progress tracking.

## 4. Safety & Ethical Disclaimers
SmartGlow analysis is exclusively intended for non-clinical cosmetic guidance. It is not an FDA-approved diagnostic tool and does not detect melanoma, dermatological diseases, or prescribe medical treatments.
