import { Product, FilterState, CartItem } from '../types/store';
import { MOCK_PRODUCTS } from '../data/mockProducts';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export interface OrderSubmissionPayload {
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  city: string;
  postalCode: string;
  paymentMethod: string;
  items: CartItem[];
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
    const timeoutId = setTimeout(() => controller.abort(), 2500); // 2.5s graceful timeout

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
      headers: { 'Content-Type': 'application/json' },
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
