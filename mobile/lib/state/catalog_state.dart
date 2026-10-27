import 'package:flutter/foundation.dart';
import '../models/product_model.dart';
import '../models/category_model.dart';
import '../services/api_service.dart';

class CatalogState extends ChangeNotifier {
  final ApiService _apiService;

  List<ProductModel> _products = [];
  List<CategoryModel> _categories = [];
  bool _isLoading = false;
  bool _isLiveBackend = false;
  String? _errorMessage;

  String _selectedCategory = 'All';
  String _selectedSkinType = 'All';
  String _selectedSkinConcern = 'All';
  String _searchQuery = '';
  String _sortBy = 'featured';

  CatalogState({ApiService? apiService}) : _apiService = apiService ?? ApiService();

  List<ProductModel> get products => List.unmodifiable(_products);
  List<CategoryModel> get categories => List.unmodifiable(_categories);
  bool get isLoading => _isLoading;
  bool get isLiveBackend => _isLiveBackend;
  String? get errorMessage => _errorMessage;

  String get selectedCategory => _selectedCategory;
  String get selectedSkinType => _selectedSkinType;
  String get selectedSkinConcern => _selectedSkinConcern;
  String get searchQuery => _searchQuery;
  String get sortBy => _sortBy;

  bool get hasActiveFilters =>
      _selectedCategory != 'All' ||
      _selectedSkinType != 'All' ||
      _selectedSkinConcern != 'All' ||
      _searchQuery.isNotEmpty ||
      _sortBy != 'featured';

  Future<void> initialize() async {
    _isLoading = true;
    notifyListeners();

    try {
      _categories = await _apiService.getCategories();
      await fetchProducts();
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchProducts() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final result = await _apiService.getProducts(
        category: _selectedCategory,
        skinType: _selectedSkinType,
        skinConcern: _selectedSkinConcern,
        search: _searchQuery,
        sortBy: _sortBy,
      );

      _products = result.products;
      _isLiveBackend = result.isLiveBackend;
    } catch (e) {
      _errorMessage = 'Failed to load cosmetics catalog. Using offline fallback.';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void selectCategory(String category) {
    if (_selectedCategory == category) return;
    _selectedCategory = category;
    fetchProducts();
  }

  void setFilters({
    String? skinType,
    String? skinConcern,
    String? sortBy,
  }) {
    if (skinType != null) _selectedSkinType = skinType;
    if (skinConcern != null) _selectedSkinConcern = skinConcern;
    if (sortBy != null) _sortBy = sortBy;
    fetchProducts();
  }

  void setSearchQuery(String query) {
    _searchQuery = query;
    fetchProducts();
  }

  void resetFilters() {
    _selectedCategory = 'All';
    _selectedSkinType = 'All';
    _selectedSkinConcern = 'All';
    _searchQuery = '';
    _sortBy = 'featured';
    fetchProducts();
  }
}
