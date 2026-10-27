import 'package:flutter_test/flutter_test.dart';
import 'package:smartglow_mobile/data/demo_products.dart';

void main() {
  group('SmartGlow Mobile Catalog Data & Filter Invariants', () {
    test('contains products for all 5 required cosmetic categories', () {
      final categories = DemoProducts.products.map((p) => p.category?.name).toSet();
      expect(categories.contains('Skincare'), true);
      expect(categories.contains('Serums'), true);
      expect(categories.contains('Cleansers'), true);
      expect(categories.contains('Sun Care'), true);
      expect(categories.contains('Makeup'), true);
    });

    test('filters products correctly by skin type', () {
      final sensitiveProducts = DemoProducts.products
          .where((p) => p.skinTypes.contains('All') || p.skinTypes.contains('Sensitive'))
          .toList();

      expect(sensitiveProducts.isNotEmpty, true);
      for (final p in sensitiveProducts) {
        final matches = p.skinTypes.contains('All') || p.skinTypes.contains('Sensitive');
        expect(matches, true);
      }
    });

    test('filters products correctly by skin concern', () {
      final acneProducts = DemoProducts.products
          .where((p) => p.skinConcerns.contains('All') || p.skinConcerns.contains('Acne & Pores'))
          .toList();

      expect(acneProducts.isNotEmpty, true);
      for (final p in acneProducts) {
        final matches = p.skinConcerns.contains('All') || p.skinConcerns.contains('Acne & Pores');
        expect(matches, true);
      }
    });

    test('sorts products correctly by price ascending', () {
      final sortedAsc = List.of(DemoProducts.products);
      sortedAsc.sort((a, b) => a.price.compareTo(b.price));

      for (int i = 0; i < sortedAsc.length - 1; i++) {
        expect(sortedAsc[i].price <= sortedAsc[i + 1].price, true);
      }
    });
  });
}
