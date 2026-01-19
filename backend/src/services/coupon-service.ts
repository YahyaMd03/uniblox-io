/**
 * Coupon Service - Manages coupon generation and validation
 * 
 * Business Rules:
 * - Every nth order (n=5) generates a new coupon
 * - Only one active coupon exists at a time
 * - Coupons provide 10% discount
 * - Coupons can only be used once
 * - Coupons become invalid after use
 */

import { Coupon } from '../models/types';
import { store } from '../store/memory-store';

const NTH_ORDER = 5;
const DISCOUNT_PERCENT = 10;

export class CouponService {
  /**
   * Generate a deterministic coupon code
   * Format: SAVE10-XXXX where XXXX is a 4-character alphanumeric code
   * 
   * @param orderCount - The global order count used to generate deterministic code
   */
  private generateCouponCode(orderCount: number): string {
    // Deterministic generation based on order count
    // This ensures the same order count always generates the same code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'SAVE10-';
    
    // Use order count as seed for deterministic generation
    let seed = orderCount * 17 + 42; // Simple hash-like function
    
    for (let i = 0; i < 4; i++) {
      code += chars[seed % chars.length];
      seed = Math.floor(seed / chars.length) + i * 7;
    }
    
    return code;
  }

  /**
   * Check if a new coupon should be generated based on order count
   * 
   * @param orderCount - Current global order count
   */
  shouldGenerateCoupon(orderCount: number): boolean {
    return orderCount > 0 && orderCount % NTH_ORDER === 0;
  }

  /**
   * Generate a new coupon and invalidate any existing active coupon
   * 
   * @param orderCount - Current global order count (used for deterministic code generation)
   * @param customCode - Optional custom coupon code (admin override)
   */
  generateNewCoupon(orderCount: number, customCode?: string): Coupon {
    // Invalidate any existing active coupon
    const activeCoupon = store.getActiveCoupon();
    if (activeCoupon) {
      activeCoupon.isValid = false;
    }

    // Use custom code if provided, otherwise generate deterministically
    const code = customCode || this.generateCouponCode(orderCount);
    
    // Validate code format (optional: ensure it follows pattern)
    if (code.length < 3) {
      throw new Error('Coupon code must be at least 3 characters long');
    }

    const coupon: Coupon = {
      code: code.toUpperCase(),
      discountPercent: DISCOUNT_PERCENT,
      createdAt: new Date(),
      isValid: true,
    };

    store.addCoupon(coupon);
    return coupon;
  }

  /**
   * Validate a coupon code
   * 
   * @param code - Coupon code to validate
   */
  validateCoupon(code: string): { valid: boolean; discountPercent: number } {
    const coupon = store.getAllCoupons().find(c => c.code === code && c.isValid);
    
    if (!coupon) {
      return { valid: false, discountPercent: 0 };
    }

    return { valid: true, discountPercent: coupon.discountPercent };
  }

  /**
   * Apply a coupon (marks it as used)
   * 
   * @param code - Coupon code to apply
   */
  applyCoupon(code: string): boolean {
    return store.markCouponAsUsed(code);
  }

  /**
   * Get the active coupon (if any)
   */
  getActiveCoupon(): Coupon | null {
    return store.getActiveCoupon();
  }

  /**
   * Get all coupons (for admin)
   */
  getAllCoupons(): Coupon[] {
    return store.getAllCoupons();
  }

  /**
   * Get the nth order value
   */
  getNthOrder(): number {
    return NTH_ORDER;
  }

  /**
   * Get the discount percent
   */
  getDiscountPercent(): number {
    return DISCOUNT_PERCENT;
  }
}

export const couponService = new CouponService();
