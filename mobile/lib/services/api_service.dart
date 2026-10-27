import 'dart:convert';
import 'dart:math';
import 'package:http/http.dart' as http;
import '../core/constants/api_constants.dart';
import '../models/product_model.dart';
import '../models/category_model.dart';
import '../models/order_model.dart';
import '../models/cart_item_model.dart';
import '../data/demo_products.dart';

class ProductsResult {
  final List<ProductModel> products;
  final bool isLiveBackend;

  const ProductsResult({
    required this.products,
    required this.isLiveBackend,
  });
}

class ApiService {
  final http.Client _client;

  ApiService({http.Client? client}) : _client = client ?? http.Client();

  /// Fetch products with optional category, skin type, concern, search, and sort filters
  Future<ProductsResult> getProducts({
    String? category,
    String? skinType,
    String? skinConcern,
    String? search,
    String? sortBy,
  }) async {
    final queryParams = <String, String>{};
    if (category != null && category.isNotEmpty && category != 'All') {
      queryParams['category'] = category;
    }
    if (skinType != null && skinType.isNotEmpty && skinType != 'All') {
      queryParams['skin_type'] = skinType;
    }
    if (skinConcern != null && skinConcern.isNotEmpty && skinConcern != 'All') {
      queryParams['skin_concern'] = skinConcern;
    }
    if (search != null && search.trim().isNotEmpty) {
      queryParams['search'] = search.trim();
    }
    if (sortBy != null && sortBy.isNotEmpty) {
      queryParams['sort_by'] = sortBy;
    }

    final uri = Uri.parse('${ApiConstants.baseUrl}${ApiConstants.productsEndpoint}')
        .replace(queryParameters: queryParams.isEmpty ? null : queryParams);

    try {
      final response = await _client.get(uri).timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        final data = json.decode(response.body) as Map<String, dynamic>;
        final items = (data['items'] as List<dynamic>?)
                ?.map((e) => ProductModel.fromJson(e as Map<String, dynamic>))
                .toList() ??
            [];
        return ProductsResult(products: items, isLiveBackend: true);
      }
    } catch (_) {
      // Graceful offline fallback
    }

    // Filter in-memory demo data
    final filtered = DemoProducts.products.where((p) {
      if (category != null && category != 'All' && p.category?.name != category) {
        return false;
      }
      if (skinType != null && skinType != 'All') {
        final matches = p.skinTypes.contains('All') || p.skinTypes.contains(skinType);
        if (!matches) return false;
      }
      if (skinConcern != null && skinConcern != 'All') {
        final matches = p.skinConcerns.contains('All') || p.skinConcerns.contains(skinConcern);
        if (!matches) return false;
      }
      if (search != null && search.trim().isNotEmpty) {
        final q = search.trim().toLowerCase();
        final match = p.name.toLowerCase().contains(q) ||
            p.subtitle.toLowerCase().contains(q) ||
            p.description.toLowerCase().contains(q) ||
            p.keyIngredients.any((i) => i.toLowerCase().contains(q));
        if (!match) return false;
      }
      return true;
    }).toList();

    // In-memory sorting
    if (sortBy == 'price-asc') {
      filtered.sort((a, b) => a.price.compareTo(b.price));
    } else if (sortBy == 'price-desc') {
      filtered.sort((a, b) => b.price.compareTo(a.price));
    } else if (sortBy == 'rating') {
      filtered.sort((a, b) => b.rating.compareTo(a.rating));
    }

    return ProductsResult(products: filtered, isLiveBackend: false);
  }

  /// Fetch product categories
  Future<List<CategoryModel>> getCategories() async {
    final uri = Uri.parse('${ApiConstants.baseUrl}${ApiConstants.categoriesEndpoint}');

    try {
      final response = await _client.get(uri).timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        final list = json.decode(response.body) as List<dynamic>;
        return list.map((e) => CategoryModel.fromJson(e as Map<String, dynamic>)).toList();
      }
    } catch (_) {
      // Offline fallback
    }

    return DemoProducts.categories;
  }

  /// Submit an order to the backend API with automatic fallback
  Future<OrderModel> submitOrder({
    required String customerName,
    required String customerPhone,
    required String deliveryAddress,
    required String city,
    required String postalCode,
    String paymentMethod = 'Cash on Delivery',
    required List<CartItemModel> items,
  }) async {
    final subtotal = items.fold<double>(0.0, (acc, item) => acc + item.totalPrice);
    final shipping = subtotal >= ApiConstants.freeShippingThreshold
        ? 0.0
        : ApiConstants.standardShippingFee;
    final total = subtotal + shipping;

    final uri = Uri.parse('${ApiConstants.baseUrl}${ApiConstants.ordersEndpoint}');

    final payload = {
      'customer_name': customerName.trim(),
      'customer_phone': customerPhone.trim(),
      'delivery_address': deliveryAddress.trim(),
      'city': city.trim(),
      'postal_code': postalCode.trim(),
      'payment_method': paymentMethod,
      'items': items
          .map((i) => {
                'product_id': i.product.id,
                'quantity': i.quantity,
              })
          .toList(),
    };

    try {
      final response = await _client
          .post(
            uri,
            headers: {'Content-Type': 'application/json'},
            body: json.encode(payload),
          )
          .timeout(const Duration(seconds: 5));

      if (response.statusCode == 201) {
        final data = json.decode(response.body) as Map<String, dynamic>;
        return OrderModel.fromJson(data, isLiveBackend: true);
      }
    } catch (_) {
      // Offline fallback
    }

    // Local order creation fallback
    final randomNum = 100000 + Random().nextInt(900000);
    return OrderModel(
      id: 0,
      orderNumber: 'SG-$randomNum',
      customerName: customerName,
      customerPhone: customerPhone,
      deliveryAddress: deliveryAddress,
      city: city,
      postalCode: postalCode,
      paymentMethod: paymentMethod,
      status: 'confirmed',
      subtotal: (subtotal * 100).round() / 100,
      shippingCost: shipping,
      totalAmount: (total * 100).round() / 100,
      createdAt: DateTime.now(),
      items: items
          .map((i) => OrderItemModel(
                id: 0,
                productId: i.product.id,
                productName: i.product.name,
                unitPrice: i.product.price,
                quantity: i.quantity,
                totalPrice: i.totalPrice,
              ))
          .toList(),
      isLiveBackend: false,
    );
  }
}
