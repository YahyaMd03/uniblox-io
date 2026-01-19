/**
 * In-memory data store for the e-commerce system
 * 
 * This store maintains:
 * - User carts
 * - Orders
 * - Coupons
 * - Global order counter
 */

import { Cart, Order, Coupon } from '../models/types';

export class MemoryStore {
  private carts: Map<string, Cart> = new Map();
  private orders: Order[] = [];
  private coupons: Coupon[] = [];
  private globalOrderCount: number = 0;

  // Cart operations
  getCart(userId: string): Cart | undefined {
    return this.carts.get(userId);
  }

  setCart(userId: string, cart: Cart): void {
    this.carts.set(userId, cart);
  }

  deleteCart(userId: string): void {
    this.carts.delete(userId);
  }

  // Order operations
  createOrder(order: Order): void {
    this.orders.push(order);
    this.globalOrderCount++;
  }

  getAllOrders(): Order[] {
    return [...this.orders];
  }

  getGlobalOrderCount(): number {
    return this.globalOrderCount;
  }

  // Coupon operations
  addCoupon(coupon: Coupon): void {
    this.coupons.push(coupon);
  }

  getActiveCoupon(): Coupon | null {
    const active = this.coupons.find(c => c.isValid);
    return active || null;
  }

  getAllCoupons(): Coupon[] {
    return [...this.coupons];
  }

  markCouponAsUsed(code: string): boolean {
    const coupon = this.coupons.find(c => c.code === code && c.isValid);
    if (coupon) {
      coupon.isValid = false;
      coupon.usedAt = new Date();
      return true;
    }
    return false;
  }

  // Statistics
  getTotalItemsSold(): number {
    return this.orders.reduce((total, order) => {
      return total + order.items.reduce((sum, item) => sum + item.quantity, 0);
    }, 0);
  }

  getTotalRevenue(): number {
    return this.orders.reduce((total, order) => total + order.total, 0);
  }

  getTotalDiscountGiven(): number {
    return this.orders.reduce((total, order) => total + order.discount, 0);
  }
}

// Singleton instance
export const store = new MemoryStore();
