import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';
import '../models/order_model.dart';

class OrderConfirmationScreen extends StatelessWidget {
  final OrderModel order;

  const OrderConfirmationScreen({
    super.key,
    required this.order,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Order Confirmed'),
        automaticallyImplyLeading: false,
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Spacer(),
              Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                  color: AppColors.accentEmerald.withOpacity(0.12),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.check_circle_rounded,
                  color: AppColors.accentEmerald,
                  size: 44,
                ),
              ),
              const SizedBox(height: 20),
              const Text(
                'Order Confirmed!',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w700,
                  fontFamily: 'serif',
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Thank you, ${order.customerName}. Your SmartGlow parcel has been scheduled for dispatch.',
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 13,
                  color: AppColors.textSecondary,
                  height: 1.4,
                ),
              ),
              const SizedBox(height: 24),

              // Order Summary Box
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  children: [
                    _buildRow('Order Reference', order.orderNumber, isMono: true),
                    const Divider(height: 20, color: AppColors.borderLight),
                    _buildRow('Payment Method', order.paymentMethod),
                    const Divider(height: 20, color: AppColors.borderLight),
                    _buildRow(
                      'Pipeline Status',
                      order.isLiveBackend ? 'FastAPI Verified' : 'Offline Prototype',
                      highlightColor: order.isLiveBackend
                          ? AppColors.accentEmerald
                          : AppColors.accentAmber,
                    ),
                    const Divider(height: 20, color: AppColors.borderLight),
                    _buildRow(
                      'Total Payable',
                      '\$${order.totalAmount.toStringAsFixed(2)}',
                      isBold: true,
                      isMono: true,
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.accentAmber.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppColors.accentAmber.withOpacity(0.3)),
                ),
                child: const Text(
                  'A dispatch rider will contact you prior to delivery for Cash on Delivery collection.',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 11, color: AppColors.accentAmber),
                ),
              ),

              const Spacer(),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.of(context).popUntil((route) => route.isFirst);
                  },
                  child: const Text('Continue Shopping'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRow(String label, String value,
      {bool isBold = false, bool isMono = false, Color? highlightColor}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: 13,
            fontWeight: isBold ? FontWeight.w700 : FontWeight.w600,
            fontFamily: isMono ? 'monospace' : null,
            color: highlightColor ?? AppColors.textPrimary,
          ),
        ),
      ],
    );
  }
}
