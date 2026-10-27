import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';
import '../state/cart_state.dart';
import '../widgets/free_shipping_meter.dart';
import 'order_confirmation_screen.dart';

class CartScreen extends StatelessWidget {
  final CartState cartState;

  const CartScreen({super.key, required this.cartState});

  void _showCheckoutDialog(BuildContext context) {
    final formKey = GlobalKey<FormState>();
    final nameCtrl = TextEditingController(text: 'Gloria Mbilinyi');
    final phoneCtrl = TextEditingController(text: '+1 (555) 234-5678');
    final addressCtrl = TextEditingController(text: '450 Sunset Boulevard');
    final cityCtrl = TextEditingController(text: 'Dar es Salaam');
    final postalCtrl = TextEditingController(text: '14111');

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return Container(
          decoration: const BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 16,
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
          ),
          child: Form(
            key: formKey,
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      width: 36,
                      height: 4,
                      decoration: BoxDecoration(
                        color: AppColors.border,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Express Checkout (Cash on Delivery)',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppColors.accentAmber.withOpacity(0.08),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppColors.accentAmber.withOpacity(0.3)),
                    ),
                    child: const Text(
                      'Pay in cash upon physical delivery handover. No card or prepayment required.',
                      style: TextStyle(fontSize: 11, color: AppColors.accentAmber),
                    ),
                  ),
                  const SizedBox(height: 14),

                  TextFormField(
                    controller: nameCtrl,
                    decoration: const InputDecoration(labelText: 'Full Name'),
                    validator: (v) => (v == null || v.isEmpty) ? 'Required' : null,
                  ),
                  const SizedBox(height: 10),
                  TextFormField(
                    controller: phoneCtrl,
                    decoration: const InputDecoration(labelText: 'Phone Number'),
                    validator: (v) => (v == null || v.isEmpty) ? 'Required' : null,
                  ),
                  const SizedBox(height: 10),
                  TextFormField(
                    controller: addressCtrl,
                    decoration: const InputDecoration(labelText: 'Street Address'),
                    validator: (v) => (v == null || v.isEmpty) ? 'Required' : null,
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(
                        child: TextFormField(
                          controller: cityCtrl,
                          decoration: const InputDecoration(labelText: 'City'),
                          validator: (v) => (v == null || v.isEmpty) ? 'Required' : null,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: TextFormField(
                          controller: postalCtrl,
                          decoration: const InputDecoration(labelText: 'Postal Code'),
                          validator: (v) => (v == null || v.isEmpty) ? 'Required' : null,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Total Amount Due:'),
                      Text(
                        '\$${cartState.totalAmount.toStringAsFixed(2)}',
                        style: const TextStyle(
                          fontSize: 16,
                          fontFamily: 'monospace',
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),

                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () async {
                        if (formKey.currentState?.validate() ?? false) {
                          Navigator.pop(ctx);
                          final order = await cartState.placeOrder(
                            name: nameCtrl.text,
                            phone: phoneCtrl.text,
                            address: addressCtrl.text,
                            city: cityCtrl.text,
                            postalCode: postalCtrl.text,
                          );
                          if (order != null && context.mounted) {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => OrderConfirmationScreen(order: order),
                              ),
                            );
                          }
                        }
                      },
                      child: Text('Place Order · \$${cartState.totalAmount.toStringAsFixed(2)}'),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: cartState,
      builder: (context, _) {
        final items = cartState.items;

        return Scaffold(
          backgroundColor: AppColors.background,
          appBar: AppBar(
            title: const Text('Shopping Bag'),
            actions: [
              if (items.isNotEmpty)
                IconButton(
                  icon: const Icon(Icons.delete_sweep_outlined),
                  onPressed: () => cartState.clearCart(),
                  tooltip: 'Clear Bag',
                ),
            ],
          ),
          body: items.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.shopping_bag_outlined,
                          size: 64, color: AppColors.textMuted),
                      const SizedBox(height: 16),
                      const Text(
                        'Your shopping bag is empty',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 6),
                      const Text(
                        'Explore our clean botanical skincare catalog',
                        style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                      ),
                      const SizedBox(height: 20),
                      ElevatedButton(
                        onPressed: () => Navigator.pop(context),
                        child: const Text('Discover Formulations'),
                      ),
                    ],
                  ),
                )
              : Column(
                  children: [
                    Padding(
                      padding: const EdgeInsets.all(16),
                      child: FreeShippingMeter(
                        subtotal: cartState.subtotal,
                        progress: cartState.freeShippingProgress,
                        isFreeShipping: cartState.isFreeShipping,
                      ),
                    ),
                    Expanded(
                      child: ListView.separated(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        itemCount: items.length,
                        separatorBuilder: (_, __) => const Divider(color: AppColors.border),
                        itemBuilder: (context, index) {
                          final item = items[index];
                          return Padding(
                            padding: const EdgeInsets.symmetric(vertical: 8),
                            child: Row(
                              children: [
                                Container(
                                  width: 60,
                                  height: 60,
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFF0EDE8),
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(color: AppColors.border),
                                  ),
                                  child: const Icon(Icons.spa_outlined,
                                      color: AppColors.textMuted),
                                ),
                                const SizedBox(width: 14),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        item.product.name,
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: const TextStyle(
                                          fontSize: 13,
                                          fontWeight: FontWeight.w700,
                                          color: AppColors.textPrimary,
                                        ),
                                      ),
                                      Text(
                                        item.product.volume,
                                        style: const TextStyle(
                                          fontSize: 11,
                                          color: AppColors.textSecondary,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        '\$${item.totalPrice.toStringAsFixed(2)}',
                                        style: const TextStyle(
                                          fontSize: 13,
                                          fontFamily: 'monospace',
                                          fontWeight: FontWeight.w700,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                Row(
                                  children: [
                                    IconButton(
                                      icon: const Icon(Icons.remove, size: 16),
                                      onPressed: () => cartState.updateQuantity(
                                          item.product.id, item.quantity - 1),
                                    ),
                                    Text(
                                      '${item.quantity}',
                                      style: const TextStyle(
                                        fontFamily: 'monospace',
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                    IconButton(
                                      icon: const Icon(Icons.add, size: 16),
                                      onPressed: () => cartState.updateQuantity(
                                          item.product.id, item.quantity + 1),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                    ),

                    // Checkout Bottom Bar
                    SafeArea(
                      child: Container(
                        padding: const EdgeInsets.all(20),
                        decoration: const BoxDecoration(
                          color: AppColors.surface,
                          border: Border(top: BorderSide(color: AppColors.border)),
                        ),
                        child: Column(
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text('Subtotal',
                                    style: TextStyle(
                                        fontSize: 12, color: AppColors.textSecondary)),
                                Text('\$${cartState.subtotal.toStringAsFixed(2)}',
                                    style: const TextStyle(
                                        fontSize: 12,
                                        fontFamily: 'monospace',
                                        fontWeight: FontWeight.w600)),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text('Delivery Fee',
                                    style: TextStyle(
                                        fontSize: 12, color: AppColors.textSecondary)),
                                Text(
                                    cartState.isFreeShipping
                                        ? 'FREE'
                                        : '\$${cartState.shippingCost.toStringAsFixed(2)}',
                                    style: TextStyle(
                                        fontSize: 12,
                                        fontFamily: 'monospace',
                                        fontWeight: FontWeight.w600,
                                        color: cartState.isFreeShipping
                                            ? AppColors.accentEmerald
                                            : AppColors.textPrimary)),
                              ],
                            ),
                            const Divider(height: 16, color: AppColors.borderLight),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text('Total',
                                    style: TextStyle(
                                        fontSize: 15, fontWeight: FontWeight.w700)),
                                Text('\$${cartState.totalAmount.toStringAsFixed(2)}',
                                    style: const TextStyle(
                                        fontSize: 17,
                                        fontFamily: 'monospace',
                                        fontWeight: FontWeight.w800)),
                              ],
                            ),
                            const SizedBox(height: 14),
                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton(
                                onPressed: cartState.isSubmitting
                                    ? null
                                    : () => _showCheckoutDialog(context),
                                child: cartState.isSubmitting
                                    ? const SizedBox(
                                        height: 16,
                                        width: 16,
                                        child: CircularProgressIndicator(
                                            strokeWidth: 2, color: Colors.white),
                                      )
                                    : const Text('Proceed to Checkout (COD)'),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
        );
      },
    );
  }
}
