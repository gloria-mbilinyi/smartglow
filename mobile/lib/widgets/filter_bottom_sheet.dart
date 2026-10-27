import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';

class FilterBottomSheet extends StatefulWidget {
  final String currentSkinType;
  final String currentSkinConcern;
  final String currentSortBy;
  final Function({required String skinType, required String skinConcern, required String sortBy})
      onApply;

  const FilterBottomSheet({
    super.key,
    required this.currentSkinType,
    required this.currentSkinConcern,
    required this.currentSortBy,
    required this.onApply,
  });

  @override
  State<FilterBottomSheet> createState() => _FilterBottomSheetState();
}

class _FilterBottomSheetState extends State<FilterBottomSheet> {
  late String _skinType;
  late String _skinConcern;
  late String _sortBy;

  final List<String> _skinTypes = ['All', 'Normal', 'Dry', 'Oily', 'Combination', 'Sensitive'];
  final List<String> _skinConcerns = [
    'All',
    'Dullness',
    'Hyperpigmentation',
    'Dehydration',
    'Acne & Pores',
    'Redness',
    'Fine Lines',
  ];

  @override
  void initState() {
    super.initState();
    _skinType = widget.currentSkinType;
    _skinConcern = widget.currentSkinConcern;
    _sortBy = widget.currentSortBy;
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: 16,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Drag handle
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

          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Filters & Sorting',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
              TextButton(
                onPressed: () {
                  setState(() {
                    _skinType = 'All';
                    _skinConcern = 'All';
                    _sortBy = 'featured';
                  });
                },
                child: const Text('Reset'),
              ),
            ],
          ),

          const SizedBox(height: 12),
          const Text(
            'TARGET SKIN TYPE',
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.8,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _skinTypes.map((type) {
              final isSel = _skinType == type;
              return ChoiceChip(
                label: Text(type),
                selected: isSel,
                onSelected: (_) => setState(() => _skinType = type),
                selectedColor: AppColors.primary,
                labelStyle: TextStyle(
                  color: isSel ? Colors.white : AppColors.textPrimary,
                  fontSize: 12,
                  fontWeight: isSel ? FontWeight.w600 : FontWeight.w500,
                ),
              );
            }).toList(),
          ),

          const SizedBox(height: 16),
          const Text(
            'PRIMARY SKIN CONCERN',
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.8,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _skinConcerns.map((concern) {
              final isSel = _skinConcern == concern;
              return ChoiceChip(
                label: Text(concern),
                selected: isSel,
                onSelected: (_) => setState(() => _skinConcern = concern),
                selectedColor: AppColors.primary,
                labelStyle: TextStyle(
                  color: isSel ? Colors.white : AppColors.textPrimary,
                  fontSize: 12,
                  fontWeight: isSel ? FontWeight.w600 : FontWeight.w500,
                ),
              );
            }).toList(),
          ),

          const SizedBox(height: 16),
          const Text(
            'SORT BY',
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.8,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 8),
          DropdownButtonFormField<String>(
            value: _sortBy,
            decoration: const InputDecoration(
              isDense: true,
              contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            ),
            items: const [
              DropdownMenuItem(value: 'featured', child: Text('Featured First')),
              DropdownMenuItem(value: 'price-asc', child: Text('Price: Low to High')),
              DropdownMenuItem(value: 'price-desc', child: Text('Price: High to Low')),
              DropdownMenuItem(value: 'rating', child: Text('Top Customer Rating')),
            ],
            onChanged: (val) {
              if (val != null) setState(() => _sortBy = val);
            },
          ),

          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () {
                widget.onApply(
                  skinType: _skinType,
                  skinConcern: _skinConcern,
                  sortBy: _sortBy,
                );
                Navigator.pop(context);
              },
              child: const Text('Apply Filters'),
            ),
          ),
        ],
      ),
    );
  }
}
