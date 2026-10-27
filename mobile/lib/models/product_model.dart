import 'category_model.dart';

class ProductModel {
  final String id;
  final String name;
  final String subtitle;
  final String slug;
  final double price;
  final double rating;
  final int reviewsCount;
  final List<String> skinTypes;
  final List<String> skinConcerns;
  final List<String> keyIngredients;
  final String allIngredients;
  final String description;
  final List<String> benefits;
  final String usage;
  final String volume;
  final int stockCount;
  final String imageUrl;
  final String? tag;
  final CategoryModel? category;

  const ProductModel({
    required this.id,
    required this.name,
    this.subtitle = '',
    required this.slug,
    required this.price,
    this.rating = 5.0,
    this.reviewsCount = 0,
    this.skinTypes = const [],
    this.skinConcerns = const [],
    this.keyIngredients = const [],
    this.allIngredients = '',
    required this.description,
    this.benefits = const [],
    this.usage = '',
    this.volume = '',
    this.stockCount = 0,
    required this.imageUrl,
    this.tag,
    this.category,
  });

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    return ProductModel(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      subtitle: json['subtitle'] as String? ?? '',
      slug: json['slug'] as String? ?? '',
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      rating: (json['rating'] as num?)?.toDouble() ?? 5.0,
      reviewsCount: json['reviews_count'] as int? ?? 0,
      skinTypes: (json['skin_types'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          const [],
      skinConcerns: (json['skin_concerns'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          const [],
      keyIngredients: (json['key_ingredients_list'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          const [],
      allIngredients: json['all_ingredients'] as String? ?? '',
      description: json['description'] as String? ?? '',
      benefits: (json['benefits'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          const [],
      usage: json['usage'] as String? ?? '',
      volume: json['volume'] as String? ?? '',
      stockCount: json['stock_count'] as int? ?? 0,
      imageUrl: json['image_url'] as String? ?? '',
      tag: json['tag'] as String?,
      category: json['category'] != null
          ? CategoryModel.fromJson(json['category'] as Map<String, dynamic>)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'subtitle': subtitle,
      'slug': slug,
      'price': price,
      'rating': rating,
      'reviews_count': reviewsCount,
      'skin_types': skinTypes,
      'skin_concerns': skinConcerns,
      'key_ingredients_list': keyIngredients,
      'all_ingredients': allIngredients,
      'description': description,
      'benefits': benefits,
      'usage': usage,
      'volume': volume,
      'stock_count': stockCount,
      'image_url': imageUrl,
      'tag': tag,
      'category': category?.toJson(),
    };
  }
}
