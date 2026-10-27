import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';
import '../state/catalog_state.dart';
import '../state/cart_state.dart';
import '../widgets/product_card.dart';
import '../widgets/category_chip_bar.dart';
import '../widgets/filter_bottom_sheet.dart';
import 'product_detail_screen.dart';
import 'cart_screen.dart';

class HomeScreen extends StatefulWidget {
  final CatalogState catalogState;
  final CartState cartState;

  const HomeScreen({
    super.key,
    required this.catalogState,
    required this.cartState,
  });

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final TextEditingController _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _openFilterSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => FilterBottomSheet(
        currentSkinType: widget.catalogState.selectedSkinType,
        currentSkinConcern: widget.catalogState.selectedSkinConcern,
        currentSortBy: widget.catalogState.sortBy,
        onApply: ({required skinType, required skinConcern, required sortBy}) {
          widget.catalogState.setFilters(
            skinType: skinType,
            skinConcern: skinConcern,
            sortBy: sortBy,
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: Listenable.merge([widget.catalogState, widget.cartState]),
      builder: (context, _) {
        final catState = widget.catalogState;
        final cartState = widget.cartState;
        final products = catState.products;

        return Scaffold(
          backgroundColor: AppColors.background,
          appBar: AppBar(
            title: const Text('SmartGlow'),
            actions: [
              // Shopping Bag Action with badge
              Stack(
                alignment: Alignment.center,
                children: [
                  IconButton(
                    icon: const Icon(Icons.shopping_bag_outlined),
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => CartScreen(cartState: cartState),
                        ),
                      );
                    },
                  ),
                  if (cartState.totalItemCount > 0)
                    Positioned(
                      right: 8,
                      top: 8,
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: const BoxDecoration(
                          color: AppColors.primary,
                          shape: BoxShape.circle,
                        ),
                        child: Text(
                          '${cartState.totalItemCount}',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontFamily: 'monospace',
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(width: 8),
            ],
          ),
          body: RefreshIndicator(
            onRefresh: () => catState.fetchProducts(),
            child: CustomScrollView(
              slivers: [
                // Search & Filter Header
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    child: Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _searchController,
                            onChanged: (val) => catState.setSearchQuery(val),
                            decoration: InputDecoration(
                              hintText: 'Search formulations or actives...',
                              prefixIcon: const Icon(Icons.search, size: 20),
                              suffixIcon: _searchController.text.isNotEmpty
                                  ? IconButton(
                                      icon: const Icon(Icons.clear, size: 18),
                                      onPressed: () {
                                        _searchController.clear();
                                        catState.setSearchQuery('');
                                      },
                                    )
                                  : null,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        IconButton.filledTonal(
                          icon: Icon(
                            Icons.tune,
                            color: catState.hasActiveFilters
                                ? AppColors.accentAmber
                                : AppColors.textPrimary,
                          ),
                          onPressed: _openFilterSheet,
                          tooltip: 'Filters & Sorting',
                        ),
                      ],
                    ),
                  ),
                ),

                // Editorial Campaign Hero Banner
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: const Color(0xFFEFECE6),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Row(
                            children: [
                              Icon(Icons.spa, size: 14, color: AppColors.accentAmber),
                              SizedBox(width: 6),
                              Text(
                                'CLEAN BOTANICAL FORMULATIONS',
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w700,
                                  letterSpacing: 0.8,
                                  color: AppColors.accentAmber,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          const Text(
                            'Luminous skincare calibrated for your skin.',
                            style: TextStyle(
                              fontSize: 18,
                              fontFamily: 'serif',
                              fontWeight: FontWeight.w700,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          const SizedBox(height: 6),
                          const Text(
                            'Science-backed bio-actives tailored to your complexion and lipid barrier.',
                            style: TextStyle(
                              fontSize: 12,
                              color: AppColors.textSecondary,
                              height: 1.4,
                            ),
                          ),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              Container(
                                width: 8,
                                height: 8,
                                decoration: BoxDecoration(
                                  color: catState.isLiveBackend
                                      ? AppColors.accentEmerald
                                      : Colors.grey,
                                  shape: BoxShape.circle,
                                ),
                              ),
                              const SizedBox(width: 6),
                              Text(
                                catState.isLiveBackend
                                    ? 'FastAPI Backend Connected'
                                    : 'Demo Mode (Offline Fallback)',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                  color: catState.isLiveBackend
                                      ? AppColors.accentEmerald
                                      : AppColors.textSecondary,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ),

                // Category Tabs Bar
                SliverToBoxAdapter(
                  child: CategoryChipBar(
                    categories: catState.categories,
                    selectedCategory: catState.selectedCategory,
                    onSelected: (cat) => catState.selectCategory(cat),
                  ),
                ),

                const SliverToBoxAdapter(child: SizedBox(height: 12)),

                // Active Filter Summary Row
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          '${products.length} ${products.length == 1 ? "Formulation" : "Formulations"}',
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: AppColors.textSecondary,
                          ),
                        ),
                        if (catState.hasActiveFilters)
                          GestureDetector(
                            onTap: () {
                              _searchController.clear();
                              catState.resetFilters();
                            },
                            child: const Text(
                              'Reset Filters',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                color: AppColors.accentAmber,
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                ),

                const SliverToBoxAdapter(child: SizedBox(height: 8)),

                // Products Grid
                if (catState.isLoading)
                  const SliverFillRemaining(
                    child: Center(
                      child: CircularProgressIndicator(strokeWidth: 2),
                    ),
                  )
                else if (products.isEmpty)
                  SliverFillRemaining(
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.search_off, size: 48, color: AppColors.textMuted),
                          const SizedBox(height: 12),
                          const Text(
                            'No matching cosmetics found',
                            style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
                          ),
                          const SizedBox(height: 4),
                          const Text(
                            'Try clearing active filters or search terms',
                            style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                          ),
                          const SizedBox(height: 16),
                          ElevatedButton(
                            onPressed: () {
                              _searchController.clear();
                              catState.resetFilters();
                            },
                            child: const Text('Reset All Filters'),
                          ),
                        ],
                      ),
                    ),
                  )
                else
                  SliverPadding(
                    padding: const EdgeInsets.all(16),
                    sliver: SliverGrid(
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        childAspectRatio: 0.65,
                        crossAxisSpacing: 12,
                        mainAxisSpacing: 12,
                      ),
                      delegate: SliverChildBuilderDelegate(
                        (context, index) {
                          final product = products[index];
                          return ProductCard(
                            product: product,
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => ProductDetailScreen(
                                    product: product,
                                    cartState: cartState,
                                  ),
                                ),
                              );
                            },
                            onQuickAdd: () {
                              cartState.addToCart(product);
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text('Added ${product.name} to bag'),
                                  duration: const Duration(seconds: 1),
                                ),
                              );
                            },
                          );
                        },
                        childCount: products.length,
                      ),
                    ),
                  ),

                const SliverToBoxAdapter(child: SizedBox(height: 40)),
              ],
            ),
          ),
        );
      },
    );
  }
}
