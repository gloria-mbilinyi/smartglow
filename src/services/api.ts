import { Product, FilterState, CartItem } from '../types/store';
import { MOCK_PRODUCTS } from '../data/mockProducts';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export interface UserProfile {
  id: number;
  email: string;
  fullName: string;
  phone?: string | null;
  role: 'customer' | 'admin';
  isActive: boolean;
  skinType: string;
  skinConcerns: string[];
  sensitivityLevel: string;
  knownAllergens: string[];
  preferredRoutine: string;
  createdAt: string;
}

export interface SkinPreferencesPayload {
  skinType?: string;
  skinConcerns?: string[];
  sensitivityLevel?: string;
  knownAllergens?: string[];
  preferredRoutine?: string;
}

export interface AuthTokenResult {
  accessToken: string;
  tokenType: string;
  user: UserProfile;
}

export interface InventoryItem {
  id: string;
  name: string;
  categoryName: string;
  price: number;
  stockCount: number;
  isActive: boolean;
  isLowStock: boolean;
}

export interface InventoryOverview {
  totalProducts: number;
  activeProducts: number;
  lowStockCount: number;
  items: InventoryItem[];
}

export interface OrderItemRecord {
  id: number;
  productId?: string | null;
  productName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface OrderRecord {
  id: number;
  orderNumber: string;
  userId?: number | null;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  city: string;
  postalCode: string;
  paymentMethod: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
  createdAt: string;
  items: OrderItemRecord[];
}

export interface OrderSubmissionPayload {
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  city: string;
  postalCode: string;
  paymentMethod: string;
  items: CartItem[];
  token?: string | null;
}

export interface OrderConfirmationResult {
  orderNumber: string;
  customerName: string;
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
  status: string;
  isBackendProcessed: boolean;
}

export async function fetchStorefrontProducts(
  filterState: FilterState
): Promise<{ products: Product[]; isLiveBackend: boolean }> {
  try {
    const params = new URLSearchParams();
    if (filterState.category && filterState.category !== 'All') {
      params.append('category', filterState.category);
    }
    if (filterState.skinType && filterState.skinType !== 'All') {
      params.append('skin_type', filterState.skinType);
    }
    if (filterState.skinConcern && filterState.skinConcern !== 'All') {
      params.append('skin_concern', filterState.skinConcern);
    }
    if (filterState.searchQuery && filterState.searchQuery.trim()) {
      params.append('search', filterState.searchQuery.trim());
    }
    if (filterState.sortBy) {
      params.append('sort_by', filterState.sortBy);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const response = await fetch(`${API_BASE_URL}/products/?${params.toString()}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const mappedItems: Product[] = (data.items || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        subtitle: item.subtitle || '',
        category: (item.category?.name || 'Skincare') as Product['category'],
        price: item.price,
        rating: item.rating,
        reviewsCount: item.reviews_count,
        skinTypes: item.skin_types || [],
        skinConcerns: item.skin_concerns || [],
        keyIngredients: item.key_ingredients_list || [],
        allIngredients: item.all_ingredients || '',
        description: item.description,
        benefits: item.benefits || [],
        usage: item.usage || '',
        volume: item.volume || '',
        stockCount: item.stock_count,
        imageUrl: item.image_url,
        tag: item.tag,
      }));

      return { products: mappedItems, isLiveBackend: true };
    }
  } catch {
    // Graceful fallback to client-side data
  }

  // Fallback to client-side filtered mock data
  const filtered = MOCK_PRODUCTS.filter((product) => {
    if (filterState.category !== 'All' && product.category !== filterState.category) return false;
    if (filterState.skinType !== 'All') {
      if (!product.skinTypes.includes('All') && !product.skinTypes.includes(filterState.skinType)) return false;
    }
    if (filterState.skinConcern !== 'All') {
      if (!product.skinConcerns.includes('All') && !product.skinConcerns.includes(filterState.skinConcern)) return false;
    }
    if (filterState.searchQuery.trim() !== '') {
      const q = filterState.searchQuery.toLowerCase();
      const match =
        product.name.toLowerCase().includes(q) ||
        product.subtitle.toLowerCase().includes(q) ||
        product.keyIngredients.some((i) => i.toLowerCase().includes(q)) ||
        product.description.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  }).sort((a, b) => {
    if (filterState.sortBy === 'price-asc') return a.price - b.price;
    if (filterState.sortBy === 'price-desc') return b.price - a.price;
    if (filterState.sortBy === 'rating') return b.rating - a.rating;
    return 0;
  });

  return { products: filtered, isLiveBackend: false };
}

export async function submitStorefrontOrder(
  payload: OrderSubmissionPayload
): Promise<OrderConfirmationResult> {
  const subtotal = payload.items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const isFreeShipping = subtotal >= 60.0;
  const shippingCost = payload.items.length === 0 || isFreeShipping ? 0.0 : 6.0;
  const totalAmount = subtotal + shippingCost;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (payload.token) {
      headers['Authorization'] = `Bearer ${payload.token}`;
    }

    const apiBody = {
      customer_name: payload.customerName,
      customer_phone: payload.customerPhone,
      delivery_address: payload.deliveryAddress,
      city: payload.city,
      postal_code: payload.postalCode,
      payment_method: payload.paymentMethod,
      items: payload.items.map((i) => ({
        product_id: i.product.id,
        quantity: i.quantity,
      })),
    };

    const res = await fetch(`${API_BASE_URL}/orders/`, {
      method: 'POST',
      headers,
      body: JSON.stringify(apiBody),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const order = await res.json();
      return {
        orderNumber: order.order_number,
        customerName: order.customer_name,
        subtotal: order.subtotal,
        shippingCost: order.shipping_cost,
        totalAmount: order.total_amount,
        status: order.status,
        isBackendProcessed: true,
      };
    }
  } catch {
    // Graceful fallback to client simulation
  }

  // Fallback client order generation
  const fallbackNum = 'SG-' + Math.floor(100000 + Math.random() * 900000);
  return {
    orderNumber: fallbackNum,
    customerName: payload.customerName,
    subtotal: Math.round(subtotal * 100) / 100,
    shippingCost,
    totalAmount: Math.round(totalAmount * 100) / 100,
    status: 'confirmed',
    isBackendProcessed: false,
  };
}

// ==========================================
// Phase 5 Customer Authentication & Profiles
// ==========================================

export async function loginCustomer(email: string, password: string): Promise<AuthTokenResult> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Authentication failed. Please verify credentials.');
  }

  const data = await res.json();
  return {
    accessToken: data.access_token,
    tokenType: data.token_type,
    user: {
      id: data.user.id,
      email: data.user.email,
      fullName: data.user.full_name,
      phone: data.user.phone,
      role: data.user.role,
      isActive: data.user.is_active,
      skinType: data.user.skin_type || 'All',
      skinConcerns: data.user.skin_concerns || [],
      sensitivityLevel: data.user.sensitivity_level || 'Moderate',
      knownAllergens: data.user.known_allergens || [],
      preferredRoutine: data.user.preferred_routine || 'Clean Botanical',
      createdAt: data.user.created_at,
    },
  };
}

export async function registerCustomer(
  email: string,
  password: string,
  fullName: string,
  phone?: string
): Promise<AuthTokenResult> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, full_name: fullName, phone }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Registration failed. Please check inputs.');
  }

  const data = await res.json();
  return {
    accessToken: data.access_token,
    tokenType: data.token_type,
    user: {
      id: data.user.id,
      email: data.user.email,
      fullName: data.user.full_name,
      phone: data.user.phone,
      role: data.user.role,
      isActive: data.user.is_active,
      skinType: data.user.skin_type || 'All',
      skinConcerns: data.user.skin_concerns || [],
      sensitivityLevel: data.user.sensitivity_level || 'Moderate',
      knownAllergens: data.user.known_allergens || [],
      preferredRoutine: data.user.preferred_routine || 'Clean Botanical',
      createdAt: data.user.created_at,
    },
  };
}

export async function getCurrentUser(token: string): Promise<UserProfile> {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error('Session expired. Please sign in again.');
  }

  const user = await res.json();
  return {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    phone: user.phone,
    role: user.role,
    isActive: user.is_active,
    skinType: user.skin_type || 'All',
    skinConcerns: user.skin_concerns || [],
    sensitivityLevel: user.sensitivity_level || 'Moderate',
    knownAllergens: user.known_allergens || [],
    preferredRoutine: user.preferred_routine || 'Clean Botanical',
    createdAt: user.created_at,
  };
}

export async function updateSkinPreferences(
  token: string,
  payload: SkinPreferencesPayload
): Promise<UserProfile> {
  const res = await fetch(`${API_BASE_URL}/users/me/skin-preferences`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      skin_type: payload.skinType,
      skin_concerns: payload.skinConcerns,
      sensitivity_level: payload.sensitivityLevel,
      known_allergens: payload.knownAllergens,
      preferred_routine: payload.preferredRoutine,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to update skin preferences.');
  }

  const user = await res.json();
  return {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    phone: user.phone,
    role: user.role,
    isActive: user.is_active,
    skinType: user.skin_type || 'All',
    skinConcerns: user.skin_concerns || [],
    sensitivityLevel: user.sensitivity_level || 'Moderate',
    knownAllergens: user.known_allergens || [],
    preferredRoutine: user.preferred_routine || 'Clean Botanical',
    createdAt: user.created_at,
  };
}

export async function getUserOrders(token: string): Promise<OrderRecord[]> {
  const res = await fetch(`${API_BASE_URL}/orders/my-orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    return [];
  }

  const data = await res.json();
  return data.map((o: any) => ({
    id: o.id,
    orderNumber: o.order_number,
    userId: o.user_id,
    customerName: o.customer_name,
    customerPhone: o.customer_phone,
    deliveryAddress: o.delivery_address,
    city: o.city,
    postalCode: o.postal_code,
    paymentMethod: o.payment_method,
    status: o.status,
    subtotal: o.subtotal,
    shippingCost: o.shipping_cost,
    totalAmount: o.total_amount,
    createdAt: o.created_at,
    items: (o.items || []).map((i: any) => ({
      id: i.id,
      productId: i.product_id,
      productName: i.product_name,
      unitPrice: i.unit_price,
      quantity: i.quantity,
      totalPrice: i.total_price,
    })),
  }));
}

export async function getPersonalizedRecommendations(token: string): Promise<Product[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/users/me/recommendations`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const items = await res.json();
      return items.map((item: any) => ({
        id: item.id,
        name: item.name,
        subtitle: item.subtitle || '',
        category: (item.category?.name || 'Skincare') as Product['category'],
        price: item.price,
        rating: item.rating,
        reviewsCount: item.reviews_count,
        skinTypes: item.skin_types || [],
        skinConcerns: item.skin_concerns || [],
        keyIngredients: item.key_ingredients_list || [],
        allIngredients: item.all_ingredients || '',
        description: item.description,
        benefits: item.benefits || [],
        usage: item.usage || '',
        volume: item.volume || '',
        stockCount: item.stock_count,
        imageUrl: item.image_url,
        tag: item.tag,
      }));
    }
  } catch {
    // Fallback
  }
  return MOCK_PRODUCTS.slice(0, 3);
}

// ==========================================
// Phase 5 Admin Inventory Controls
// ==========================================

export async function getAdminInventory(token: string): Promise<InventoryOverview> {
  const res = await fetch(`${API_BASE_URL}/admin/inventory`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Administrator access required.');
  }

  const data = await res.json();
  return {
    totalProducts: data.total_products,
    activeProducts: data.active_products,
    lowStockCount: data.low_stock_count,
    items: (data.items || []).map((i: any) => ({
      id: i.id,
      name: i.name,
      categoryName: i.category_name,
      price: i.price,
      stockCount: i.stock_count,
      isActive: i.is_active,
      isLowStock: i.is_low_stock,
    })),
  };
}

export async function updateAdminStock(
  token: string,
  productId: string,
  stockCount: number,
  price: number,
  isActive: boolean
): Promise<InventoryItem> {
  const res = await fetch(`${API_BASE_URL}/admin/products/${productId}/stock`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      stock_count: stockCount,
      price,
      is_active: isActive,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to update inventory.');
  }

  const data = await res.json();
  return {
    id: data.id,
    name: data.name,
    categoryName: data.category_name,
    price: data.price,
    stockCount: data.stock_count,
    isActive: data.is_active,
    isLowStock: data.is_low_stock,
  };
}

export async function updateOrderStatus(
  token: string,
  orderId: number,
  status: OrderRecord['status']
): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to update order status.');
  }
}

// ==========================================
// Phase 6 AI Skin Analysis API Integration
// ==========================================

export interface DiagnosticPreset {
  id: string;
  title: string;
  description: string;
  skin_type: string;
  skin_tone: string;
  measurements: {
    redness: number;
    shine: number;
    texture: number;
    pores: number;
  };
}

export interface BackendSkinAnalysisResult {
  quality: {
    is_adequate_resolution: boolean;
    is_sufficient_lighting: boolean;
    is_face_centered: boolean;
    is_acceptable: boolean;
    lighting_score: number;
    sharpness_score: number;
    feedback_message: string;
    uncertainty_reasons: string[];
  };
  observable_metrics: {
    redness_index: number;
    shine_index: number;
    texture_roughness_index: number;
    pore_prominence_index: number;
    overall_confidence: number;
    estimated_skin_tendency: string;
    is_reliable: boolean;
  };
  regions: Array<{
    region_name: string;
    relative_redness: number;
    specular_shine: number;
    texture_roughness: number;
    observation_summary: string;
  }>;
  recommendations: Array<{
    product_id: string;
    product_name: string;
    category: string;
    price: number;
    image_url: string;
    match_score: number;
    why_it_matches: string;
    target_trait: string;
    key_active_ingredients: string[];
    allergen_safety_status: string;
    skin_type_alignment: string;
  }>;
  disclaimer: string;
  processed_at: string;
}

export async function fetchDiagnosticPresets(): Promise<DiagnosticPreset[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/skin-analysis/presets`);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback if offline
  }
  return [
    {
      id: 'preset_balanced',
      title: 'Balanced & Radiant Surface',
      description: 'Uniform diffuse lighting, balanced micro-erythema and low surface shine.',
      skin_type: 'Normal',
      skin_tone: 'Medium Warm',
      measurements: { redness: 28.0, shine: 32.0, texture: 24.0, pores: 26.0 },
    },
    {
      id: 'preset_reactive_redness',
      title: 'Reactive Redness & Sensitive Barrier',
      description: 'Elevated cheek chromatic redness, sensitive vascular reactivity, moderate dryness.',
      skin_type: 'Sensitive',
      skin_tone: 'Fair Neutral',
      measurements: { redness: 68.0, shine: 22.0, texture: 42.0, pores: 30.0 },
    },
    {
      id: 'preset_tzone_shine',
      title: 'T-Zone Shine & Pore Prominence',
      description: 'Prominent nasal specular shine, enlarged pore density, and combination cheeks.',
      skin_type: 'Combination',
      skin_tone: 'Deep Cool',
      measurements: { redness: 34.0, shine: 72.0, texture: 38.0, pores: 65.0 },
    },
    {
      id: 'preset_dehydrated_texture',
      title: 'Micro-Texture Unevenness & Dehydration',
      description: 'Low surface specular shine, visible high-frequency micro-roughness on cheeks and forehead.',
      skin_type: 'Dry',
      skin_tone: 'Rich Deep',
      measurements: { redness: 38.0, shine: 18.0, texture: 66.0, pores: 34.0 },
    },
  ];
}

export async function analyzeSkinImageBackend(
  payload: {
    imageBase64?: string;
    manualMeasurements?: { redness: number; shine: number; texture: number; pores: number };
    userSkinType?: string;
    userConcerns?: string[];
    knownAllergens?: string[];
    sensitivityLevel?: string;
  },
  token?: string | null
): Promise<BackendSkinAnalysisResult> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/skin-analysis/analyze`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      image_base64: payload.imageBase64,
      manual_optical_measurements: payload.manualMeasurements,
      user_skin_type: payload.userSkinType,
      user_concerns: payload.userConcerns,
      known_allergens: payload.knownAllergens,
      sensitivity_level: payload.sensitivityLevel,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to complete skin analysis');
  }

  return await res.json();
}
