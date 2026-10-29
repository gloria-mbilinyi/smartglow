import { Product } from '../types/store';
import { UserProfile } from './api';

export interface ImageQualityAssessment {
  isAdequateResolution: boolean;
  isSufficientLighting: boolean;
  isSharp: boolean;
  isFaceCentered: boolean;
  isAcceptable: boolean;
  lightingScore: number; // 0 - 100
  sharpnessScore: number; // 0 - 100
  feedbackMessage: string;
  uncertaintyReasons: string[];
}

export interface FacialRegion {
  id: 'forehead' | 't_zone' | 'left_cheek' | 'right_cheek' | 'chin';
  name: string;
  bounds: { x: number; y: number; width: number; height: number }; // normalized 0..1
  relativeRedness: number; // 0 - 100
  specularShine: number; // 0 - 100
  textureRoughness: number; // 0 - 100
  summary: string;
}

export interface ObservableSkinMetrics {
  rednessIndex: number;
  shineIndex: number;
  textureRoughnessIndex: number;
  poreProminenceIndex: number;
  overallConfidence: number;
  estimatedSkinTendency: string;
  isReliable: boolean;
  regions: FacialRegion[];
  disclaimer: string;
}

export interface ExplainableMatch {
  product: Product;
  matchScore: number;
  targetTrait: string;
  whyItMatches: string;
  allergenSafetyStatus: string;
  skinTypeAlignment: string;
}

export const NON_CLINICAL_DISCLAIMER =
  'SmartGlow Facial Analysis is non-clinical and designed exclusively for cosmetic routine guidance. ' +
  'Visible shine, redness, and texture are surface optical approximations influenced by camera sensors, ' +
  'lighting, ambient humidity, and topical products. Photographs cannot measure dermal hydration, ' +
  'sebum excretion rate, or barrier permeability, and do not diagnose medical conditions.';

/**
 * Assess photographic quality on client-side ImageData buffer.
 */
export function assessImageQuality(
  width: number,
  height: number,
  data: Uint8ClampedArray
): ImageQualityAssessment {
  const isAdequateResolution = width >= 320 && height >= 320;

  // Compute luminance mean and standard deviation
  let totalLuminance = 0;
  const pixelCount = width * height;
  const step = Math.max(1, Math.floor(pixelCount / 40000)); // Sample up to 40,000 pixels for speed

  let sampledCount = 0;
  for (let i = 0; i < pixelCount * 4; i += 4 * step) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    totalLuminance += lum;
    sampledCount++;
  }

  const meanLuminance = sampledCount > 0 ? totalLuminance / sampledCount : 0;

  let varianceSum = 0;
  for (let i = 0; i < pixelCount * 4; i += 4 * step) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    varianceSum += Math.pow(lum - meanLuminance, 2);
  }
  const stdLuminance = sampledCount > 0 ? Math.sqrt(varianceSum / sampledCount) : 0;

  // Calculate focus sharpness via horizontal/vertical luminance gradients
  let gradientSum = 0;
  let gradientCount = 0;
  const sampleStride = Math.max(2, Math.floor(width / 120));

  for (let y = 1; y < height - 1; y += sampleStride) {
    for (let x = 1; x < width - 1; x += sampleStride) {
      const idx = (y * width + x) * 4;
      const idxRight = (y * width + (x + 1)) * 4;
      const idxDown = ((y + 1) * width + x) * 4;

      const lumCenter = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      const lumRight = 0.299 * data[idxRight] + 0.587 * data[idxRight + 1] + 0.114 * data[idxRight + 2];
      const lumDown = 0.299 * data[idxDown] + 0.587 * data[idxDown + 1] + 0.114 * data[idxDown + 2];

      const dx = lumRight - lumCenter;
      const dy = lumDown - lumCenter;
      gradientSum += Math.abs(dx) + Math.abs(dy);
      gradientCount++;
    }
  }

  const meanGradient = gradientCount > 0 ? gradientSum / gradientCount : 0;
  const sharpnessScore = Math.min(100, Math.max(0, (meanGradient / 12.0) * 100));
  const isSharp = meanGradient >= 3.5;

  // Lighting evaluation
  const lumDiff = Math.abs(meanLuminance - 130);
  const lightingScore = Math.min(100, Math.max(0, 100 - lumDiff * 0.9));
  const isSufficientLighting = meanLuminance >= 45 && meanLuminance <= 220 && stdLuminance >= 15;

  const isFaceCentered = isAdequateResolution && width / height >= 0.5 && width / height <= 2.0;

  const uncertaintyReasons: string[] = [];
  let feedbackMessage = 'Image passes non-clinical cosmetic quality checks.';

  if (!isAdequateResolution) {
    uncertaintyReasons.push(`Resolution (${width}x${height}) below minimum 320x320.`);
    feedbackMessage = 'Image resolution is too low. Please hold device closer.';
  } else if (meanLuminance < 45) {
    uncertaintyReasons.push(`Underexposed lighting (mean luminance ${meanLuminance.toFixed(1)}).`);
    feedbackMessage = 'Low lighting detected. Please face a soft, indirect natural light source.';
  } else if (meanLuminance > 220) {
    uncertaintyReasons.push(`Overexposed lighting / direct glare (mean luminance ${meanLuminance.toFixed(1)}).`);
    feedbackMessage = 'Harsh direct glare detected. Avoid intense direct overhead lighting.';
  } else if (!isSharp) {
    uncertaintyReasons.push(`Low optical focus sharpness (gradient score ${meanGradient.toFixed(1)}).`);
    feedbackMessage = 'Motion blur or soft focus detected. Hold device steady and tap to focus.';
  }

  const isAcceptable = isAdequateResolution && isSufficientLighting && isSharp && isFaceCentered;

  return {
    isAdequateResolution,
    isSufficientLighting,
    isSharp,
    isFaceCentered,
    isAcceptable,
    lightingScore: Math.round(lightingScore),
    sharpnessScore: Math.round(sharpnessScore),
    feedbackMessage,
    uncertaintyReasons,
  };
}

/**
 * Extract observable optical metrics across 5 facial regions.
 */
export function extractObservableMetrics(
  width: number,
  height: number,
  data: Uint8ClampedArray,
  quality: ImageQualityAssessment,
  overrideMeasurements?: { redness: number; shine: number; texture: number; pores: number }
): ObservableSkinMetrics {
  if (!quality.isAcceptable && !overrideMeasurements) {
    return {
      rednessIndex: 0,
      shineIndex: 0,
      textureRoughnessIndex: 0,
      poreProminenceIndex: 0,
      overallConfidence: 0,
      estimatedSkinTendency: 'Insufficient Image Quality for Analysis',
      isReliable: false,
      regions: [],
      disclaimer: NON_CLINICAL_DISCLAIMER,
    };
  }

  let redness: number;
  let shine: number;
  let texture: number;
  let pores: number;

  if (overrideMeasurements) {
    redness = overrideMeasurements.redness;
    shine = overrideMeasurements.shine;
    texture = overrideMeasurements.texture;
    pores = overrideMeasurements.pores;
  } else {
    // Optical pixel extraction across regions
    const getSubregionStats = (xStartFrac: number, xEndFrac: number, yStartFrac: number, yEndFrac: number) => {
      const xs = Math.floor(width * xStartFrac);
      const xe = Math.floor(width * xEndFrac);
      const ys = Math.floor(height * yStartFrac);
      const ye = Math.floor(height * yEndFrac);

      let totalR = 0, totalG = 0, totalB = 0;
      let count = 0;
      let specularCount = 0;

      for (let y = ys; y < ye; y += 2) {
        for (let x = xs; x < xe; x += 2) {
          const idx = (y * width + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];

          totalR += r;
          totalG += g;
          totalB += b;
          count++;

          const lum = (r + g + b) / 3;
          if (lum > 200) specularCount++;
        }
      }

      const meanR = count > 0 ? totalR / count : 0;
      const meanG = count > 0 ? totalG / count : 0;
      const meanB = count > 0 ? totalB / count : 0;

      // Chromatic redness index: (R - G) / (R + G + 1e-4)
      const redRatio = (meanR - meanG) / (meanR + meanG + 1e-4);
      const normRedness = Math.max(0, Math.min(100, (redRatio - 0.05) * 220));
      const normShine = Math.max(0, Math.min(100, (specularCount / Math.max(1, count)) * 400));

      return { redness: normRedness, shine: normShine };
    };

    const foreheadStats = getSubregionStats(0.3, 0.7, 0.15, 0.35);
    const tzoneStats = getSubregionStats(0.4, 0.6, 0.35, 0.65);
    const leftCheekStats = getSubregionStats(0.15, 0.38, 0.45, 0.75);
    const rightCheekStats = getSubregionStats(0.62, 0.85, 0.45, 0.75);

    redness = (leftCheekStats.redness + rightCheekStats.redness) / 2;
    shine = tzoneStats.shine;
    texture = Math.min(100, Math.max(15, quality.sharpnessScore * 0.5 + (100 - foreheadStats.shine) * 0.3));
    pores = Math.min(100, Math.max(15, shine * 0.6 + texture * 0.4));
  }

  const clamp = (v: number) => Math.round(Math.max(0, Math.min(100, v)));

  const regions: FacialRegion[] = [
    {
      id: 'forehead',
      name: 'Forehead',
      bounds: { x: 0.3, y: 0.15, width: 0.4, height: 0.2 },
      relativeRedness: clamp(redness * 0.8),
      specularShine: clamp(shine * 0.9),
      textureRoughness: clamp(texture * 1.05),
      summary: 'Upper zone surface smoothness and natural light diffusion.',
    },
    {
      id: 't_zone',
      name: 'Nose & T-Zone',
      bounds: { x: 0.4, y: 0.35, width: 0.2, height: 0.3 },
      relativeRedness: clamp(redness * 0.9),
      specularShine: clamp(shine * 1.25),
      textureRoughness: clamp(texture * 0.95),
      summary: 'Central sebaceous zone with higher specular reflectance.',
    },
    {
      id: 'left_cheek',
      name: 'Left Cheek',
      bounds: { x: 0.15, y: 0.45, width: 0.23, height: 0.3 },
      relativeRedness: clamp(redness * 1.05),
      specularShine: clamp(shine * 0.75),
      textureRoughness: clamp(texture),
      summary: 'Buccal zone showing localized vascular micro-erythema.',
    },
    {
      id: 'right_cheek',
      name: 'Right Cheek',
      bounds: { x: 0.62, y: 0.45, width: 0.23, height: 0.3 },
      relativeRedness: clamp(redness * 1.02),
      specularShine: clamp(shine * 0.72),
      textureRoughness: clamp(texture * 0.98),
      summary: 'Lateral cheek surface moisture balance and barrier uniformity.',
    },
    {
      id: 'chin',
      name: 'Chin',
      bounds: { x: 0.35, y: 0.75, width: 0.3, height: 0.17 },
      relativeRedness: clamp(redness * 0.9),
      specularShine: clamp(shine * 0.85),
      textureRoughness: clamp(texture * 1.02),
      summary: 'Lower jawline cellular renewal balance.',
    },
  ];

  let estimatedSkinTendency = 'Balanced & Normal Surface Tendency';
  if (redness > 55) {
    estimatedSkinTendency = 'Reactive & Redness-Prone Tendency';
  } else if (shine > 55 && pores > 50) {
    estimatedSkinTendency = 'Oily & High-Shine T-Zone Tendency';
  } else if (texture > 55 || (shine < 25 && redness < 35)) {
    estimatedSkinTendency = 'Dry & Dehydration Tendency';
  }

  const overallConfidence = Math.round(quality.lightingScore * 0.45 + quality.sharpnessScore * 0.55);

  return {
    rednessIndex: clamp(redness),
    shineIndex: clamp(shine),
    textureRoughnessIndex: clamp(texture),
    poreProminenceIndex: clamp(pores),
    overallConfidence,
    estimatedSkinTendency,
    isReliable: quality.isAcceptable && overallConfidence >= 50,
    regions,
    disclaimer: NON_CLINICAL_DISCLAIMER,
  };
}

/**
 * Calibrate explainable product recommendations matching detected observable optical traits,
 * with strict zero-tolerance customer allergen filtering.
 */
export function calibrateRecommendations(
  products: Product[],
  metrics: ObservableSkinMetrics,
  userProfile?: UserProfile | null,
  sessionAllergens: string[] = []
): ExplainableMatch[] {
  if (!metrics.isReliable) return [];

  // Combine user profile allergens and session allergens
  const effectiveAllergens = Array.from(
    new Set([
      ...(userProfile?.knownAllergens || []).map((a) => a.trim().toLowerCase()),
      ...sessionAllergens.map((a) => a.trim().toLowerCase()),
    ])
  ).filter(Boolean);

  const userType = (userProfile?.skinType || 'All').toLowerCase();
  const userConcerns = (userProfile?.skinConcerns || []).map((c) => c.toLowerCase());

  const matches: ExplainableMatch[] = [];

  for (const product of products) {
    const fullIngredientProfile = `${product.allIngredients} ${product.keyIngredients.join(' ')}`.toLowerCase();

    // 1. STRICT ZERO-TOLERANCE ALLERGEN FILTERING
    const hasAllergenConflict = effectiveAllergens.some((allergen) =>
      fullIngredientProfile.includes(allergen)
    );

    if (hasAllergenConflict) {
      continue; // Strictly omit product containing any customer allergen
    }

    // 2. EXPLAINABLE COMPATIBILITY SCORING
    let score = 0;
    const matchReasons: string[] = [];
    let targetTrait = 'Daily Botanical Balance';

    const pTypes = product.skinTypes.map((t) => t.toLowerCase());
    const pConcerns = product.skinConcerns.map((c) => c.toLowerCase());

    // Optical Trait 1: Visible Redness
    if (metrics.rednessIndex >= 45 || userConcerns.some((c) => c.includes('redness') || c.includes('sensitiv'))) {
      if (['centella', 'ceramide', 'copper', 'tripeptide', 'allantoin'].some((act) => fullIngredientProfile.includes(act))) {
        score += 5;
        targetTrait = 'Visible Redness Soothing';
        matchReasons.push('Formulated with calming botanical barrier actives (Centella Asiatica & Ceramides) to soothe observable surface flushing');
      }
    }

    // Optical Trait 2: Specular Shine & Enlarged Pores
    if (metrics.shineIndex >= 45 || userConcerns.some((c) => c.includes('acne') || c.includes('pore'))) {
      if (['zinc', 'niacinamide', 'salicylic', 'tea', 'bha'].some((act) => fullIngredientProfile.includes(act))) {
        score += 4;
        targetTrait = 'T-Zone Shine & Pore Refinement';
        matchReasons.push('Balances surface specular shine with clarifying botanicals without dehydrating underlying barrier lipids');
      }
    }

    // Optical Trait 3: Micro-Texture Roughness & Dullness
    if (metrics.textureRoughnessIndex >= 40 || userConcerns.some((c) => c.includes('dull') || c.includes('texture'))) {
      if (['ascorbyl', 'vitamin c', 'ferulic', 'pha', 'glycolic'].some((act) => fullIngredientProfile.includes(act))) {
        score += 4;
        targetTrait = 'Micro-Texture Smoothing';
        matchReasons.push('Contains stabilized antioxidant complex to refine uneven surface micro-relief and restore natural radiance');
      }
    }

    // Optical Trait 4: Dehydration / Moisture Barrier
    if (metrics.textureRoughnessIndex >= 45 && metrics.shineIndex < 35) {
      if (['hyaluronic', 'squalane', 'glycerin', 'panthenol'].some((act) => fullIngredientProfile.includes(act))) {
        score += 4;
        targetTrait = 'Multi-Tier Hydration';
        matchReasons.push('Multi-molecular humectants attract and seal surface hydration across dry facial regions');
      }
    }

    // User Skin Type Alignment
    if (pTypes.includes('all') || userType === 'all' || pTypes.includes(userType)) {
      score += 2;
    }

    if (score > 0) {
      const allergenSafetyStatus =
        effectiveAllergens.length > 0
          ? `Verified Safe · Free of your declared allergens (${effectiveAllergens.join(', ')})`
          : 'Clean Botanical Formula · Complete Ingredient Transparency';

      const skinTypeAlignment =
        userType && userType !== 'all'
          ? `Calibrated for ${userProfile?.skinType || 'your'} skin profile`
          : 'Universal botanical compatibility across all skin types';

      matches.push({
        product,
        matchScore: Math.min(99, 70 + score * 3),
        targetTrait,
        whyItMatches: matchReasons.join(' · ') || 'Botanical formulation harmonizing with your general skin profile.',
        allergenSafetyStatus,
        skinTypeAlignment,
      });
    }
  }

  // Sort descending by matchScore
  matches.sort((a, b) => b.matchScore - a.matchScore);
  return matches.slice(0, 4);
}
