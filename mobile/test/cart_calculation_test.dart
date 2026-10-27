import 'package:flutter_test/flutter_test.dart';
import 'package:smartglow_mobile/models/product_model.dart';
import 'package:smartglow_mobile/state/cart_state.dart';
import 'package:smartglow_mobile/core/constants/api_constants.dart';

void main() {
  group('SmartGlow Mobile Cart State Business Logic', () {
    late CartState cartState;

    final testSerum = const ProductModel(
      id: 'sg-serum-01',
      name: 'Botanical Radiance Serum',
      slug: 'botanical-radiance-serum',
      price: 48.0,
      stockCount: 10,
      description: 'Test serum',
      imageUrl: 'test.jpg',
    );

    final testCleanser = const ProductModel(
      id: 'sg-cleanse-01',
      name: 'Gentle Botanical Gel Cleanser',
      slug: 'gentle-botanical-gel-cleanser',
      price: 26.0,
      stockCount: 5,
      description: 'Test cleanser',
      imageUrl: 'test.jpg',
    );

    setUp(() {
      cartState = CartState();
    });

    test('initial cart is empty with zero subtotal', () {
      expect(cartState.items.isEmpty, true);
      expect(cartState.totalItemCount, 0);
      expect(cartState.subtotal, 0.0);
      expect(cartState.shippingCost, 0.0);
      expect(cartState.totalAmount, 0.0);
    });

    test('adding items calculates subtotal and quantity correctly', () {
      cartState.addToCart(testSerum, quantity: 1);
      expect(cartState.items.length, 1);
      expect(cartState.totalItemCount, 1);
      expect(cartState.subtotal, 48.0);

      // Add another of the same item
      cartState.addToCart(testSerum, quantity: 1);
      expect(cartState.items.length, 1);
      expect(cartState.totalItemCount, 2);
      expect(cartState.subtotal, 96.0);
    });

    test('applies standard shipping for orders under \$60 threshold', () {
      cartState.addToCart(testCleanser, quantity: 1); // \$26.00
      expect(cartState.subtotal, 26.0);
      expect(cartState.isFreeShipping, false);
      expect(cartState.shippingCost, ApiConstants.standardShippingFee); // \$6.00
      expect(cartState.totalAmount, 32.0);
    });

    test('unlocks free delivery when subtotal meets or exceeds \$60', () {
      cartState.addToCart(testSerum, quantity: 2); // \$96.00
      expect(cartState.subtotal, 96.0);
      expect(cartState.isFreeShipping, true);
      expect(cartState.shippingCost, 0.0);
      expect(cartState.totalAmount, 96.0);
      expect(cartState.freeShippingProgress, 1.0);
    });

    test('updating quantity to zero removes item from cart', () {
      cartState.addToCart(testSerum, quantity: 1);
      expect(cartState.items.length, 1);

      cartState.updateQuantity(testSerum.id, 0);
      expect(cartState.items.isEmpty, true);
      expect(cartState.subtotal, 0.0);
    });
  });
}
