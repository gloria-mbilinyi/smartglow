export type ProductCategory = 'All' | 'Skincare' | 'Serums' | 'Cleansers' | 'Sun Care' | 'Makeup';

export type SkinType = 'All' | 'Normal' | 'Dry' | 'Oily' | 'Combination' | 'Sensitive';

export type SkinConcern =
  | 'All'
  | 'Dullness'
  | 'Hyperpigmentation'
  | 'Dehydration'
  | 'Acne & Pores'
  | 'Redness'
  | 'Fine Lines';

export interface Product {
  id: string;
  name: string;
  subtitle: string;
  category: 'Skincare' | 'Serums' | 'Cleansers' | 'Sun Care' | 'Makeup';
  price: number;
  rating: number;
  reviewsCount: number;
  skinTypes: SkinType[];
  skinConcerns: SkinConcern[];
  keyIngredients: string[];
  allIngredients: string;
  description: string;
  benefits: string[];
  usage: string;
  volume: string;
  stockCount: number;
  imageUrl: string;
  tag?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface FilterState {
  category: ProductCategory;
  skinType: SkinType;
  skinConcern: SkinConcern;
  searchQuery: string;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'rating';
}
