/**
 * API client for backend communication
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  product?: Product | null;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  updatedAt: string;
  total?: number;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  couponCode?: string;
  createdAt: string;
}

export interface Coupon {
  code: string;
  discountPercent: number;
  createdAt: string;
  usedAt?: string;
  isValid: boolean;
}

export interface AdminStats {
  activeCoupon: Coupon | null;
  totalItemsSold: number;
  totalRevenue: number;
  totalDiscountGiven: number;
  allCoupons: Coupon[];
  totalOrders: number;
}

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Cart operations
  addToCart: async (userId: string, productId: string, quantity: number): Promise<{ cart: Cart }> => {
    return fetchAPI('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ userId, productId, quantity }),
    });
  },

  viewCart: async (userId: string): Promise<{ cart: Cart | null }> => {
    return fetchAPI('/cart/view', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  },

  // Checkout
  validateCoupon: async (couponCode: string): Promise<{ valid: boolean; discountPercent: number }> => {
    return fetchAPI('/checkout/validate-coupon', {
      method: 'POST',
      body: JSON.stringify({ couponCode }),
    });
  },

  checkout: async (userId: string, couponCode?: string): Promise<{ order: Order; message: string }> => {
    return fetchAPI('/checkout', {
      method: 'POST',
      body: JSON.stringify({ userId, couponCode }),
    });
  },

  // Admin
  getStats: async (): Promise<AdminStats> => {
    return fetchAPI('/admin/stats');
  },

  generateCoupon: async (couponCode?: string): Promise<{ coupon: Omit<Coupon, 'usedAt'> }> => {
    return fetchAPI('/admin/generate-coupon', {
      method: 'POST',
      body: JSON.stringify({ couponCode }),
    });
  },
};
