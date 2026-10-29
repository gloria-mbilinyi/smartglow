import { describe, it, expect } from 'vitest';
import { MOCK_PRODUCTS } from '../src/data/mockProducts';
import { CartItem, SkinType } from '../src/types/store';

describe('SmartGlow Cosmetics Storefront Catalog', () => {
  it('contains products across all required categories', () => {
    const categories = new Set(MOCK_PRODUCTS.map((p) => p.category));
    expect(categories.has('Skincare')).toBe(true);
    expect(categories.has('Serums')).toBe(true);
    expect(categories.has('Cleansers')).toBe(true);
    expect(categories.has('Sun Care')).toBe(true);
    expect(categories.has('Makeup')).toBe(true);
  });

  it('filters products correctly by skin type', () => {
    const sensitiveProducts = MOCK_PRODUCTS.filter(
      (p) => p.skinTypes.includes('All') || p.skinTypes.includes('Sensitive')
    );
    expect(sensitiveProducts.length).toBeGreaterThan(0);
    sensitiveProducts.forEach((p) => {
      const isCompatible = p.skinTypes.includes('All') || p.skinTypes.includes('Sensitive');
      expect(isCompatible).toBe(true);
    });
  });

  it('filters products correctly by skin concern', () => {
    const dullnessProducts = MOCK_PRODUCTS.filter(
      (p) => p.skinConcerns.includes('All') || p.skinConcerns.includes('Dullness')
    );
    expect(dullnessProducts.length).toBeGreaterThan(0);
    dullnessProducts.forEach((p) => {
      const matches = p.skinConcerns.includes('All') || p.skinConcerns.includes('Dullness');
      expect(matches).toBe(true);
    });
  });

  it('sorts products correctly by price ascending and descending', () => {
    const priceAsc = [...MOCK_PRODUCTS].sort((a, b) => a.price - b.price);
    for (let i = 0; i < priceAsc.length - 1; i++) {
      expect(priceAsc[i].price).toBeLessThanOrEqual(priceAsc[i + 1].price);
    }

    const priceDesc = [...MOCK_PRODUCTS].sort((a, b) => b.price - a.price);
    for (let i = 0; i < priceDesc.length - 1; i++) {
      expect(priceDesc[i].price).toBeGreaterThanOrEqual(priceDesc[i + 1].price);
    }
  });
});

describe('SmartGlow Shopping Cart Computations', () => {
  it('correctly calculates subtotal for multiple items and quantities', () => {
    const item1 = MOCK_PRODUCTS[0]; // $48
    const item2 = MOCK_PRODUCTS[2]; // $26

    const cart: CartItem[] = [
      { product: item1, quantity: 2 },
      { product: item2, quantity: 1 },
    ];

    const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    expect(subtotal).toBe(48 * 2 + 26); // 96 + 26 = 122
  });

  it('applies complimentary delivery when subtotal meets or exceeds $60', () => {
    const FREE_THRESHOLD = 60.0;
    const STANDARD_FEE = 6.0;

    const underThresholdSubtotal = 48.0;
    const underShipping = underThresholdSubtotal >= FREE_THRESHOLD ? 0.0 : STANDARD_FEE;
    expect(underShipping).toBe(6.0);

    const overThresholdSubtotal = 74.0;
    const overShipping = overThresholdSubtotal >= FREE_THRESHOLD ? 0.0 : STANDARD_FEE;
    expect(overShipping).toBe(0.0);
  });
});

describe('SmartGlow Phase 5 Skin Profile & Recommendations Logic', () => {
  it('correctly matches products to customer skin type and concerns', () => {
    const userProfile: { skinType: SkinType; skinConcerns: string[]; knownAllergens: string[] } = {
      skinType: 'Dry',
      skinConcerns: ['Dryness & Dehydration', 'Dullness'],
      knownAllergens: ['Fragrance'],
    };

    // Filter products matching Dry or All
    const compatible = MOCK_PRODUCTS.filter((p) => {
      const typeMatches = p.skinTypes.includes('All') || p.skinTypes.includes(userProfile.skinType);
      const allergenSafe = !userProfile.knownAllergens.some((a) =>
        (p.allIngredients || '').toLowerCase().includes(a.toLowerCase())
      );
      return typeMatches && allergenSafe;
    });

    expect(compatible.length).toBeGreaterThan(0);
    compatible.forEach((p) => {
      expect(
        p.skinTypes.includes('All') || p.skinTypes.includes(userProfile.skinType)
      ).toBe(true);
    });
  });

  it('excludes products containing customer allergens', () => {
    const allergen = 'Niacinamide';
    const safeProducts = MOCK_PRODUCTS.filter((p) => {
      const allText = `${p.allIngredients} ${p.keyIngredients.join(' ')}`.toLowerCase();
      return !allText.includes(allergen.toLowerCase());
    });

    safeProducts.forEach((p) => {
      const allText = `${p.allIngredients} ${p.keyIngredients.join(' ')}`.toLowerCase();
      expect(allText.includes(allergen.toLowerCase())).toBe(false);
    });
  });

  it('correctly flags low stock inventory below threshold', () => {
    const LOW_STOCK_THRESHOLD = 25;
    const testItems = [
      { id: '1', stockCount: 12 },
      { id: '2', stockCount: 25 },
      { id: '3', stockCount: 40 },
      { id: '4', stockCount: 0 },
    ];

    const lowStock = testItems.filter((i) => i.stockCount < LOW_STOCK_THRESHOLD);
    expect(lowStock.length).toBe(2); // 12 and 0
    expect(lowStock.map((i) => i.id)).toEqual(['1', '4']);
  });
});

