class CategoryModel {
  final int id;
  final String name;
  final String slug;
  final String? description;
  final int productsCount;

  const CategoryModel({
    required this.id,
    required this.name,
    required this.slug,
    this.description,
    this.productsCount = 0,
  });

  factory CategoryModel.fromJson(Map<String, dynamic> json) {
    return CategoryModel(
      id: json['id'] as int? ?? 0,
      name: json['name'] as String? ?? '',
      slug: json['slug'] as String? ?? '',
      description: json['description'] as String?,
      productsCount: json['products_count'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'slug': slug,
      'description': description,
      'products_count': productsCount,
    };
  }
}
