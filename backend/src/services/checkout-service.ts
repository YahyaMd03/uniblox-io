/**
 * Checkout Service - Handles order processing and coupon application
 * 
 * Business Logic:
 * - Validates coupon if provided
 * - Applies discount if coupon is valid
 * - Creates order
 * - Increments global order count
 * - Generates new coupon if orderCount % n === 0
 */

import { Order, CheckoutRequest } from '../models/types';
import { store } from '../store/memory-store';
import { cartService } from './cart-service';
import { couponService } from './coupon-service';
import { productService } from './product-service';

export class CheckoutService {
  /**
   * Process checkout for a user
   * 
   * @param request - Checkout request with userId and optional couponCode
   */
  processCheckout(request: CheckoutRequest): Order {
    const { userId, couponCode } = request;

    // Get user's cart
    const cart = cartService.getCart(userId);
    if (!cart || cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    // Calculate subtotal
    const subtotal = cartService.calculateCartTotal(cart);

    // Validate and apply coupon if provided
    let discount = 0;
    let appliedCouponCode: string | undefined;

    if (couponCode) {
      const validation = couponService.validateCoupon(couponCode);
      if (!validation.valid) {
        throw new Error('Invalid or expired coupon code');
      }

      // Apply coupon
      const applied = couponService.applyCoupon(couponCode);
      if (!applied) {
        throw new Error('Coupon could not be applied');
      }

      discount = (subtotal * validation.discountPercent) / 100;
      appliedCouponCode = couponCode;
    }

    // Calculate total
    const total = subtotal - discount;

    // Create order
    const order: Order = {
      id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      items: [...cart.items],
      subtotal,
      discount,
      total,
      couponCode: appliedCouponCode,
      createdAt: new Date(),
    };

    // Save order
    store.createOrder(order);

    // Clear cart
    cartService.clearCart(userId);

    // Check if we should generate a new coupon
    const orderCount = store.getGlobalOrderCount();
    if (couponService.shouldGenerateCoupon(orderCount)) {
      couponService.generateNewCoupon(orderCount);
    }

    return order;
  }
}

export const checkoutService = new CheckoutService();
