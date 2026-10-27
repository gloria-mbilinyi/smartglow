import 'package:flutter/foundation.dart';
import '../models/product_model.dart';
import '../models/cart_item_model.dart';
import '../models/order_model.dart';
import '../services/api_service.dart';
import '../core/constants/api_constants.dart';

class CartState extends ChangeNotifier {
  final ApiService _apiService;
  final List<CartItemModel> _items = [];

  bool _isSubmitting = false;
  OrderModel? _lastOrder;

  CartState({ApiService? apiService}) : _apiService = apiService ?? ApiService();

  List<CartItemModel> get items => List.unmodifiable(_items);
  bool get isSubmitting => _isSubmitting;
  OrderModel? get lastOrder => _lastOrder;

  int get totalItemCount => _items.fold<int>(0, (sum, item) => sum + item.quantity);

  double get subtotal =>
      _items.fold<double>(0.0, (sum, item) => sum + item.totalPrice);

  bool get isFreeShipping => subtotal >= ApiConstants.freeShippingThreshold;

  double get shippingCost {
    if (_items.isEmpty || isFreeShipping) return 0.0;
    return ApiConstants.standardShippingFee;
  }

  double get totalAmount => subtotal + shippingCost;

  double get freeShippingProgress {
    if (_items.isEmpty) return 0.0;
    final progress = subtotal / ApiConstants.freeShippingThreshold;
    return progress.clamp(0.0, 1.0);
  }

  double get amountNeededForFreeShipping {
    final diff = ApiConstants.freeShippingThreshold - subtotal;
    return diff > 0 ? diff : 0.0;
  }

  void addToCart(ProductModel product, {int quantity = 1}) {
    final existingIndex = _items.indexWhere((i) => i.product.id == product.id);
    if (existingIndex >= 0) {
      final current = _items[existingIndex].quantity;
      final maxAvailable = product.stockCount > 0 ? product.stockCount : 99;
      _items[existingIndex].quantity = (current + quantity).clamp(1, maxAvailable);
    } else {
      _items.add(CartItemModel(product: product, quantity: quantity));
    }
    notifyListeners();
  }

  void updateQuantity(String productId, int quantity) {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    final index = _items.indexWhere((i) => i.product.id == productId);
    if (index >= 0) {
      final maxStock = _items[index].product.stockCount;
      final cap = maxStock > 0 ? maxStock : 99;
      _items[index].quantity = quantity.clamp(1, cap);
      notifyListeners();
    }
  }

  void removeFromCart(String productId) {
    _items.removeWhere((i) => i.product.id == productId);
    notifyListeners();
  }

  void clearCart() {
    _items.clear();
    notifyListeners();
  }

  Future<OrderModel?> placeOrder({
    required String name,
    required String phone,
    required String address,
    required String city,
    required String postalCode,
  }) async {
    if (_items.isEmpty) return null;

    _isSubmitting = true;
    notifyListeners();

    try {
      final order = await _apiService.submitOrder(
        customerName: name,
        customerPhone: phone,
        deliveryAddress: address,
        city: city,
        postalCode: postalCode,
        items: _items,
      );
      _lastOrder = order;
      clearCart();
      return order;
    } finally {
      _isSubmitting = false;
      notifyListeners();
    }
  }
}
