import 'dart:typed_data';
import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';
import '../services/camera_service_boundary.dart';
import '../models/product_model.dart';
import '../data/demo_products.dart';

/// Phase 6: Mobile AI Skin Analysis Screen
///
/// Implements non-clinical observable surface analysis respecting the
/// SkinAnalysisCameraBoundary contract, with clear privacy and quality disclosures.
class SkinAnalysisScreen extends StatefulWidget {
  final SkinAnalysisCameraBoundary? cameraBoundary;

  const SkinAnalysisScreen({Key? key, this.cameraBoundary}) : super(key: key);

  @override
  State<SkinAnalysisScreen> createState() => _SkinAnalysisScreenState();
}

class _SkinAnalysisScreenState extends State<SkinAnalysisScreen> {
  bool _consentGiven = false;
  bool _isAnalyzing = false;
  ImageQualityCheck? _qualityCheck;
  Map<String, double>? _detectedMetrics;
  List<ProductModel>? _recommendedProducts;
  String? _selectedRegion = 'T-Zone';

  // Observable regions
  final List<String> _regions = ['Forehead', 'T-Zone', 'Left Cheek', 'Right Cheek', 'Chin'];

  void _acceptPrivacyAndProceed() {
    setState(() {
      _consentGiven = true;
    });
  }

  Future<void> _simulateCaptureAndAnalysis({
    required double redness,
    required double shine,
    required double texture,
    required double pores,
    bool simulateBlur = false,
  }) async {
    setState(() {
      _isAnalyzing = true;
      _qualityCheck = null;
    });

    await Future.delayed(const Duration(milliseconds: 600));

    if (simulateBlur) {
      setState(() {
        _isAnalyzing = false;
        _qualityCheck = const ImageQualityCheck(
          isAdequateResolution: true,
          isSufficientLighting: true,
          isFaceCentered: true,
          feedbackMessage: 'Motion blur detected. Keep device steady and tap to focus.',
        );
        _detectedMetrics = null;
        _recommendedProducts = null;
      });
      return;
    }

    // Calibrate recommendations based on observable traits
    final products = DemoProducts.getProducts();
    final List<ProductModel> matches = [];

    for (final p in products) {
      final ingText = (p.ingredients + ' ' + p.keyIngredients.join(' ')).toLowerCase();
      if (redness > 50 && (ingText.contains('centella') || ingText.contains('ceramide') || ingText.contains('copper'))) {
        matches.add(p);
      } else if (shine > 50 && (ingText.contains('zinc') || ingText.contains('niacinamide') || ingText.contains('salicylic'))) {
        matches.add(p);
      } else if (texture > 45 && (ingText.contains('ascorbyl') || ingText.contains('vitamin c') || ingText.contains('hyaluronic'))) {
        matches.add(p);
      }
    }

    setState(() {
      _isAnalyzing = false;
      _qualityCheck = const ImageQualityCheck(
        isAdequateResolution: true,
        isSufficientLighting: true,
        isFaceCentered: true,
        feedbackMessage: 'Capture quality passed non-clinical check.',
      );
      _detectedMetrics = {
        'redness': redness,
        'shine': shine,
        'texture': texture,
        'pores': pores,
      };
      _recommendedProducts = matches.isEmpty ? products.take(2).toList() : matches;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('AI Optical Skin Analysis'),
        backgroundColor: Colors.white,
        elevation: 0.5,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Consent View
              if (!_consentGiven) ...[
                Card(
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                    side: BorderSide(color: Colors.stone[300] ?? Colors.grey.shade300),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(20.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(Icons.shield_outlined, color: Colors.emerald[700] ?? Colors.green, size: 28),
                            const SizedBox(width: 10),
                            const Expanded(
                              child: Text(
                                'Ephemeral Privacy Protection',
                                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        const Text(
                          'Your facial photograph is processed strictly in-memory and discarded immediately. '
                          'Biometric images are never saved to our servers, stored on databases, or shared with third parties.',
                          style: TextStyle(fontSize: 13, height: 1.4),
                        ),
                        const SizedBox(height: 16),
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.amber[50] ?? Colors.amber.shade50,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: Colors.amber[200] ?? Colors.amber.shade200),
                          ),
                          child: const Text(
                            'Non-Clinical Disclosure: This tool estimates observable surface traits (shine, redness, texture) '
                            'to guide cosmetic routine choices. It does not measure sebum excretion, hydration, or diagnose medical conditions.',
                            style: TextStyle(fontSize: 12, height: 1.3),
                          ),
                        ),
                        const SizedBox(height: 20),
                        ElevatedButton(
                          onPressed: _acceptPrivacyAndProceed,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF1C1917),
                            foregroundColor: Colors.white,
                            minimumSize: const Size(double.infinity, 48),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          child: const Text('Accept & Continue'),
                        ),
                      ],
                    ),
                  ),
                ),
              ] else ...[
                // Quality Warning if failed
                if (_qualityCheck != null && !_qualityCheck!.isReadyForAnalysis) ...[
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: Colors.amber[50] ?? Colors.amber.shade50,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.amber.shade300),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.warning_amber_rounded, color: Colors.amber),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            _qualityCheck!.feedbackMessage ?? 'Image quality insufficient.',
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                ],

                // Preset Calibration Buttons
                const Text(
                  'Diagnostic Test Presets',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    ActionChip(
                      label: const Text('Balanced & Radiant'),
                      onPressed: () => _simulateCaptureAndAnalysis(redness: 28, shine: 32, texture: 24, pores: 26),
                    ),
                    ActionChip(
                      label: const Text('Reactive Redness'),
                      onPressed: () => _simulateCaptureAndAnalysis(redness: 68, shine: 24, texture: 44, pores: 30),
                    ),
                    ActionChip(
                      label: const Text('T-Zone Shine'),
                      onPressed: () => _simulateCaptureAndAnalysis(redness: 34, shine: 74, texture: 38, pores: 65),
                    ),
                    ActionChip(
                      label: const Text('Simulate Motion Blur'),
                      onPressed: () => _simulateCaptureAndAnalysis(redness: 0, shine: 0, texture: 0, pores: 0, simulateBlur: true),
                    ),
                  ],
                ),

                if (_isAnalyzing) ...[
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 40),
                    child: Center(
                      child: CircularProgressIndicator(color: Color(0xFF1C1917)),
                    ),
                  ),
                ],

                // Observable Metrics Display
                if (_detectedMetrics != null) ...[
                  const SizedBox(height: 20),
                  Card(
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                      side: BorderSide(color: Colors.grey.shade300),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Observable Optical Surface Indices',
                            style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 12),
                          _buildMetricRow('Visible Redness', _detectedMetrics!['redness']!, Colors.red.shade400),
                          const SizedBox(height: 8),
                          _buildMetricRow('Specular Shine', _detectedMetrics!['shine']!, Colors.amber.shade600),
                          const SizedBox(height: 8),
                          _buildMetricRow('Micro-Texture Roughness', _detectedMetrics!['texture']!, Colors.blue.shade400),
                          const SizedBox(height: 8),
                          _buildMetricRow('Pore Prominence', _detectedMetrics!['pores']!, Colors.stone[700] ?? Colors.black87),
                        ],
                      ),
                    ),
                  ),

                  // Calibrated Recommendations
                  if (_recommendedProducts != null && _recommendedProducts!.isNotEmpty) ...[
                    const SizedBox(height: 20),
                    const Text(
                      'Calibrated Botanical Routine',
                      style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 10),
                    ..._recommendedProducts!.map(
                      (prod) => Card(
                        margin: const EdgeInsets.only(bottom: 10),
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                          side: BorderSide(color: Colors.grey.shade300),
                        ),
                        child: ListTile(
                          title: Text(prod.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                          subtitle: Text(prod.keyIngredients.join(', '), style: const TextStyle(fontSize: 11)),
                          trailing: Text('\$${prod.price.toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.bold)),
                        ),
                      ),
                    ),
                  ],
                ],
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMetricRow(String label, double value, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.between,
          children: [
            Text(label, style: const TextStyle(fontSize: 12, color: Colors.black87)),
            Text('${value.toStringAsFixed(0)}%', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
          ],
        ),
        const SizedBox(height: 4),
        LinearProgressIndicator(
          value: value / 100.0,
          backgroundColor: Colors.grey.shade200,
          valueColor: AlwaysStoppedAnimation<Color>(color),
          minHeight: 6,
          borderRadius: BorderRadius.circular(4),
        ),
      ],
    );
  }
}
