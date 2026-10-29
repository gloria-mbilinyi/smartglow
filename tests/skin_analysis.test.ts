import { describe, it, expect } from 'vitest';
import {
  assessImageQuality,
  extractObservableMetrics,
  calibrateRecommendations,
  NON_CLINICAL_DISCLAIMER,
  ImageQualityAssessment,
} from '../src/services/skinAnalysisEngine';
import { MOCK_PRODUCTS } from '../src/data/mockProducts';
import { UserProfile } from '../src/services/api';

describe('SmartGlow AI Skin Analysis: Image Quality Assessment', () => {
  it('rejects low-resolution images below 320x320 with descriptive feedback', () => {
    const width = 200;
    const height = 200;
    const buffer = new Uint8ClampedArray(width * height * 4); // blank
    const assessment = assessImageQuality(width, height, buffer);

    expect(assessment.isAdequateResolution).toBe(false);
    expect(assessment.isAcceptable).toBe(false);
    expect(assessment.feedbackMessage).toContain('resolution is too low');
    expect(assessment.uncertaintyReasons.length).toBeGreaterThan(0);
  });

  it('rejects underexposed captures with low lighting feedback', () => {
    const width = 400;
    const height = 400;
    const buffer = new Uint8ClampedArray(width * height * 4);
    // Fill with very dark pixels (luminance ~10)
    for (let i = 0; i < buffer.length; i += 4) {
      buffer[i] = 10;
      buffer[i + 1] = 10;
      buffer[i + 2] = 10;
      buffer[i + 3] = 255;
    }

    const assessment = assessImageQuality(width, height, buffer);
    expect(assessment.isSufficientLighting).toBe(false);
    expect(assessment.isAcceptable).toBe(false);
    expect(assessment.feedbackMessage).toContain('Low lighting detected');
  });

  it('rejects uniform or blurry captures with focus sharpness feedback', () => {
    const width = 400;
    const height = 400;
    const buffer = new Uint8ClampedArray(width * height * 4);
    // Fill with completely uniform grey (zero gradient)
    for (let i = 0; i < buffer.length; i += 4) {
      buffer[i] = 130;
      buffer[i + 1] = 130;
      buffer[i + 2] = 130;
      buffer[i + 3] = 255;
    }

    const assessment = assessImageQuality(width, height, buffer);
    expect(assessment.isSharp).toBe(false);
    expect(assessment.isAcceptable).toBe(false);
    expect(assessment.feedbackMessage).toContain('Motion blur or soft focus detected');
  });

  it('accepts well-lit, high-resolution image with sufficient contrast and edges', () => {
    const width = 400;
    const height = 400;
    const buffer = new Uint8ClampedArray(width * height * 4);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const isStripe = (x % 8) < 4;
        buffer[idx] = isStripe ? 180 : 80;
        buffer[idx + 1] = isStripe ? 160 : 70;
        buffer[idx + 2] = isStripe ? 150 : 60;
        buffer[idx + 3] = 255;
      }
    }

    const assessment = assessImageQuality(width, height, buffer);
    expect(assessment.isAdequateResolution).toBe(true);
    expect(assessment.isSufficientLighting).toBe(true);
    expect(assessment.isSharp).toBe(true);
    expect(assessment.isAcceptable).toBe(true);
    expect(assessment.feedbackMessage).toContain('passes non-clinical cosmetic quality checks');
  });
});

describe('SmartGlow AI Skin Analysis: Regional Segmentation & Observables', () => {
  it('does not force diagnostic classification on rejected captures', () => {
    const failedQuality: ImageQualityAssessment = {
      isAdequateResolution: false,
      isSufficientLighting: false,
      isSharp: false,
      isFaceCentered: false,
      isAcceptable: false,
      lightingScore: 10,
      sharpnessScore: 10,
      feedbackMessage: 'Poor capture quality',
      uncertaintyReasons: ['Blur', 'Low resolution'],
    };

    const emptyBuffer = new Uint8ClampedArray(100);
    const metrics = extractObservableMetrics(100, 100, emptyBuffer, failedQuality);

    expect(metrics.isReliable).toBe(false);
    expect(metrics.estimatedSkinTendency).toBe('Insufficient Image Quality for Analysis');
    expect(metrics.regions.length).toBe(0);
    expect(metrics.disclaimer).toBe(NON_CLINICAL_DISCLAIMER);
  });

  it('maps all 5 facial regions with valid normalized coordinates', () => {
    const validQuality: ImageQualityAssessment = {
      isAdequateResolution: true,
      isSufficientLighting: true,
      isSharp: true,
      isFaceCentered: true,
      isAcceptable: true,
      lightingScore: 90,
      sharpnessScore: 92,
      feedbackMessage: 'Pass',
      uncertaintyReasons: [],
    };

    const buffer = new Uint8ClampedArray(400 * 400 * 4);
    buffer.fill(130);

    const metrics = extractObservableMetrics(400, 400, buffer, validQuality, {
      redness: 40,
      shine: 45,
      texture: 30,
      pores: 35,
    });

    expect(metrics.isReliable).toBe(true);
    expect(metrics.regions.length).toBe(5);

    const regionIds = metrics.regions.map((r) => r.id);
    expect(regionIds).toContain('forehead');
    expect(regionIds).toContain('t_zone');
    expect(regionIds).toContain('left_cheek');
    expect(regionIds).toContain('right_cheek');
    expect(regionIds).toContain('chin');

    // Bounds check
    metrics.regions.forEach((r) => {
      expect(r.bounds.x).toBeGreaterThanOrEqual(0);
      expect(r.bounds.x + r.bounds.width).toBeLessThanOrEqual(1.0);
      expect(r.bounds.y).toBeGreaterThanOrEqual(0);
      expect(r.bounds.y + r.bounds.height).toBeLessThanOrEqual(1.0);
      expect(r.relativeRedness).toBeGreaterThanOrEqual(0);
      expect(r.relativeRedness).toBeLessThanOrEqual(100);
      expect(r.specularShine).toBeGreaterThanOrEqual(0);
      expect(r.specularShine).toBeLessThanOrEqual(100);
    });
  });
});

describe('SmartGlow AI Skin Analysis: Explainable Recommendations & Allergen Safety', () => {
  const dummyMetrics = {
    rednessIndex: 70,
    shineIndex: 25,
    textureRoughnessIndex: 35,
    poreProminenceIndex: 30,
    overallConfidence: 88,
    estimatedSkinTendency: 'Reactive & Redness-Prone Tendency',
    isReliable: true,
    regions: [],
    disclaimer: NON_CLINICAL_DISCLAIMER,
  };

  it('calibrates barrier-soothing formulations when redness is detected', () => {
    const recommendations = calibrateRecommendations(MOCK_PRODUCTS, dummyMetrics, null);

    expect(recommendations.length).toBeGreaterThan(0);
    const topMatch = recommendations[0];
    expect(topMatch.targetTrait).toBe('Visible Redness Soothing');
    expect(topMatch.whyItMatches.toLowerCase()).toContain('centella');
    expect(topMatch.matchScore).toBeGreaterThanOrEqual(70);
  });

  it('strictly excludes products containing customer declared known allergens', () => {
    // Declaring allergen 'Fragrance' or 'Niacinamide'
    const allergen = 'Niacinamide';
    const mockUser: UserProfile = {
      id: 1,
      email: 'sensitive@smartglow.com',
      fullName: 'Samira Chen',
      role: 'customer',
      isActive: true,
      skinType: 'Sensitive',
      skinConcerns: ['Redness & Sensitivity'],
      sensitivityLevel: 'High',
      knownAllergens: [allergen],
      preferredRoutine: 'Clean Botanical',
      createdAt: new Date().toISOString(),
    };

    const recommendations = calibrateRecommendations(MOCK_PRODUCTS, dummyMetrics, mockUser);

    expect(recommendations.length).toBeGreaterThan(0);
    recommendations.forEach((rec) => {
      const fullProfile = `${rec.product.allIngredients} ${rec.product.keyIngredients.join(' ')}`.toLowerCase();
      expect(fullProfile.includes(allergen.toLowerCase())).toBe(false);
      expect(rec.allergenSafetyStatus).toContain('Free of your declared allergens');
    });
  });

  it('does not recommend products when analysis is unreliable', () => {
    const unreliableMetrics = { ...dummyMetrics, isReliable: false };
    const recommendations = calibrateRecommendations(MOCK_PRODUCTS, unreliableMetrics, null);
    expect(recommendations.length).toBe(0);
  });
});
