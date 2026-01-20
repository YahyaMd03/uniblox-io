/**
 * Unit tests for Checkout Service
 * 
 * Tests checkout logic including coupon application and order creation
 */

/// <reference types="jest" />

import { checkoutService } from '../src/services/checkout-service';
import { cartService } from '../src/services/cart-service';
import { couponService } from '../src/services/coupon-service';
import { store } from '../src/store/memory-store';

describe('CheckoutService', () => {
  beforeEach(() => {
    // Clear carts and orders before each test
    // Note: In production, use a test store instance
  });

  describe('processCheckout', () => {
    it('should throw error for empty cart', () => {
      expect(() => {
        checkoutService.processCheckout({ userId: 'user1' });
      }).toThrow('Cart is empty');
    });

    it('should create order without coupon', () => {
      // Add items to cart
      cartService.addToCart('user1', '1', 2); // 2 laptops at 999.99 each = 1999.98
      
      const order = checkoutService.processCheckout({ userId: 'user1' });
      
      expect(order).toBeDefined();
      expect(order.userId).toBe('user1');
      expect(order.items.length).toBe(1);
      expect(order.subtotal).toBe(1999.98);
      expect(order.discount).toBe(0);
      expect(order.total).toBe(1999.98);
      expect(order.couponCode).toBeUndefined();
    });

    it('should apply valid coupon and calculate discount', () => {
      // Generate a coupon using the new API
      const coupon = couponService.maybeGenerateCoupon(4, 5);
      expect(coupon).not.toBeNull();
      
      // Add items to cart
      cartService.addToCart('user2', '1', 1); // 1 laptop at 999.99
      
      const order = checkoutService.processCheckout({ 
        userId: 'user2', 
        couponCode: coupon!.code 
      });
      
      expect(order.discount).toBe(99.999); // 10% of 999.99
      expect(order.total).toBe(899.991); // 999.99 - 99.999
      expect(order.couponCode).toBe(coupon!.code);
    });

    it('should throw error for invalid coupon', () => {
      cartService.addToCart('user3', '1', 1);
      
      expect(() => {
        checkoutService.processCheckout({ 
          userId: 'user3', 
          couponCode: 'INVALID-CODE' 
        });
      }).toThrow('Invalid or expired coupon code');
    });

    it('should generate new coupon when ordersSinceLastCouponUse reaches 4', () => {
      // Reset the counter to start fresh
      store.resetOrdersSinceLastCouponUse();
      
      // Add items and checkout 4 times to trigger coupon generation (NTH_ORDER = 4)
      for (let i = 0; i < 4; i++) {
        cartService.addToCart(`user${i}`, '2', 1); // Add mouse
        checkoutService.processCheckout({ userId: `user${i}` });
      }
      
      // Check if coupon was generated after 4th order
      const activeCoupon = couponService.getActiveCoupon();
      expect(activeCoupon).not.toBeNull();
      expect(activeCoupon?.isValid).toBe(true);
    });
  });
});
