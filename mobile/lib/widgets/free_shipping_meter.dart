import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';
import '../core/constants/api_constants.dart';

class FreeShippingMeter extends StatelessWidget {
  final double subtotal;
  final double progress;
  final bool isFreeShipping;

  const FreeShippingMeter({
    super.key,
    required this.subtotal,
    required this.progress,
    required this.isFreeShipping,
  });

  @override
  Widget build(BuildContext context) {
    final remaining = (ApiConstants.freeShippingThreshold - subtotal).clamp(0.0, 9999.0);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.surface,
        border: Border.all(color: AppColors.border),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Icon(
                    Icons.local_shipping_outlined,
                    size: 16,
                    color: isFreeShipping ? AppColors.accentEmerald : AppColors.textSecondary,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    isFreeShipping
                      ? 'Complimentary standard delivery unlocked!'
                      : 'Add \$${remaining.toStringAsFixed(2)} more for free delivery',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: isFreeShipping ? AppColors.accentEmerald : AppColors.textPrimary,
                    ),
                  ),
                ],
              ),
              Text(
                '${(progress * 100).toInt()}%',
                style: const TextStyle(
                  fontSize: 12,
                  fontFamily: 'monospace',
                  fontWeight: FontWeight.w600,
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: progress,
              minHeight: 6,
              backgroundColor: AppColors.borderLight,
              valueColor: AlwaysStoppedAnimation<Color>(
                isFreeShipping ? AppColors.accentEmerald : AppColors.primary,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
