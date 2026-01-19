/**
 * Core type definitions for the e-commerce system
 */

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
}

export interface Cart {
  userId: string;
  items: CartItem[];
  updatedAt: Date;
}

export interface Coupon {
  code: string;
  discountPercent: number;
  createdAt: Date;
  usedAt?: Date;
  isValid: boolean;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  couponCode?: string;
  createdAt: Date;
}

export interface CheckoutRequest {
  userId: string;
  couponCode?: string;
}

export interface AddToCartRequest {
  userId: string;
  productId: string;
  quantity: number;
}

export interface ViewCartRequest {
  userId: string;
}

export interface AdminStats {
  activeCoupon: Coupon | null;
  totalItemsSold: number;
  totalRevenue: number;
  totalDiscountGiven: number;
  allCoupons: Coupon[];
  totalOrders: number;
}
