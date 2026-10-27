class OrderItemModel {
  final int id;
  final String productId;
  final String productName;
  final double unitPrice;
  final int quantity;
  final double totalPrice;

  const OrderItemModel({
    required this.id,
    required this.productId,
    required this.productName,
    required this.unitPrice,
    required this.quantity,
    required this.totalPrice,
  });

  factory OrderItemModel.fromJson(Map<String, dynamic> json) {
    return OrderItemModel(
      id: json['id'] as int? ?? 0,
      productId: json['product_id'] as String? ?? '',
      productName: json['product_name'] as String? ?? '',
      unitPrice: (json['unit_price'] as num?)?.toDouble() ?? 0.0,
      quantity: json['quantity'] as int? ?? 1,
      totalPrice: (json['total_price'] as num?)?.toDouble() ?? 0.0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'product_id': productId,
      'product_name': productName,
      'unit_price': unitPrice,
      'quantity': quantity,
      'total_price': totalPrice,
    };
  }
}

class OrderModel {
  final int id;
  final String orderNumber;
  final String customerName;
  final String customerPhone;
  final String deliveryAddress;
  final String city;
  final String postalCode;
  final String paymentMethod;
  final String status;
  final double subtotal;
  final double shippingCost;
  final double totalAmount;
  final DateTime createdAt;
  final List<OrderItemModel> items;
  final bool isLiveBackend;

  const OrderModel({
    required this.id,
    required this.orderNumber,
    required this.customerName,
    required this.customerPhone,
    required this.deliveryAddress,
    required this.city,
    required this.postalCode,
    required this.paymentMethod,
    required this.status,
    required this.subtotal,
    required this.shippingCost,
    required this.totalAmount,
    required this.createdAt,
    required this.items,
    this.isLiveBackend = true,
  });

  factory OrderModel.fromJson(Map<String, dynamic> json, {bool isLiveBackend = true}) {
    return OrderModel(
      id: json['id'] as int? ?? 0,
      orderNumber: json['order_number'] as String? ?? '',
      customerName: json['customer_name'] as String? ?? '',
      customerPhone: json['customer_phone'] as String? ?? '',
      deliveryAddress: json['delivery_address'] as String? ?? '',
      city: json['city'] as String? ?? '',
      postalCode: json['postal_code'] as String? ?? '',
      paymentMethod: json['payment_method'] as String? ?? 'Cash on Delivery',
      status: json['status'] as String? ?? 'confirmed',
      subtotal: (json['subtotal'] as num?)?.toDouble() ?? 0.0,
      shippingCost: (json['shipping_cost'] as num?)?.toDouble() ?? 0.0,
      totalAmount: (json['total_amount'] as num?)?.toDouble() ?? 0.0,
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'].toString()) ?? DateTime.now()
          : DateTime.now(),
      items: (json['items'] as List<dynamic>?)
              ?.map((e) => OrderItemModel.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
      isLiveBackend: isLiveBackend,
    );
  }
}
