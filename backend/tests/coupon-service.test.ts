/**
 * Unit tests for Coupon Service
 * 
 * Tests the nth-order coupon generation logic and validation
 */

import { couponService } from '../src/services/coupon-service';
import { store } from '../src/store/memory-store';

describe('CouponService', () => {
  beforeEach(() => {
    // Clear store before each test
    // Note: In a real test, we'd use a test store instance
    // For simplicity, we'll test the logic
  });

  describe('shouldGenerateCoupon', () => {
    it('should return true for order count 5', () => {
      expect(couponService.shouldGenerateCoupon(5)).toBe(true);
    });

    it('should return true for order count 10', () => {
      expect(couponService.shouldGenerateCoupon(10)).toBe(true);
    });

    it('should return false for order count 4', () => {
      expect(couponService.shouldGenerateCoupon(4)).toBe(false);
    });

    it('should return false for order count 0', () => {
      expect(couponService.shouldGenerateCoupon(0)).toBe(false);
    });

    it('should return false for order count 1', () => {
      expect(couponService.shouldGenerateCoupon(1)).toBe(false);
    });
  });

  describe('generateNewCoupon', () => {
    it('should generate coupon codes with correct format', () => {
      const coupon = couponService.generateNewCoupon(5);
      
      // Codes should follow the pattern SAVE10-XXXX
      expect(coupon.code).toMatch(/^SAVE10-[A-Z0-9]{4}$/);
      expect(coupon.discountPercent).toBe(10);
      expect(coupon.isValid).toBe(true);
    });

    it('should generate valid coupon with correct discount', () => {
      const coupon = couponService.generateNewCoupon(10);
      
      expect(coupon.discountPercent).toBe(10);
      expect(coupon.isValid).toBe(true);
      expect(coupon.code).toMatch(/^SAVE10-/);
    });

    it('should invalidate existing coupon when generating new one', () => {
      const coupon1 = couponService.generateNewCoupon(5);
      expect(coupon1.isValid).toBe(true);
      
      const coupon2 = couponService.generateNewCoupon(10);
      expect(coupon2.isValid).toBe(true);
      
      // First coupon should be invalidated
      const validation = couponService.validateCoupon(coupon1.code);
      expect(validation.valid).toBe(false);
    });
  });

  describe('validateCoupon', () => {
    it('should validate an active coupon', () => {
      const coupon = couponService.generateNewCoupon(5);
      const validation = couponService.validateCoupon(coupon.code);
      
      expect(validation.valid).toBe(true);
      expect(validation.discountPercent).toBe(10);
    });

    it('should invalidate a used coupon', () => {
      const coupon = couponService.generateNewCoupon(5);
      couponService.applyCoupon(coupon.code);
      
      const validation = couponService.validateCoupon(coupon.code);
      expect(validation.valid).toBe(false);
    });

    it('should return false for non-existent coupon', () => {
      const validation = couponService.validateCoupon('INVALID-CODE');
      expect(validation.valid).toBe(false);
    });
  });

  describe('applyCoupon', () => {
    it('should mark coupon as used', () => {
      const coupon = couponService.generateNewCoupon(5);
      const applied = couponService.applyCoupon(coupon.code);
      
      expect(applied).toBe(true);
      
      const validation = couponService.validateCoupon(coupon.code);
      expect(validation.valid).toBe(false);
    });

    it('should return false for invalid coupon', () => {
      const applied = couponService.applyCoupon('INVALID-CODE');
      expect(applied).toBe(false);
    });
  });

  describe('getNthOrder and getDiscountPercent', () => {
    it('should return correct nth order value', () => {
      expect(couponService.getNthOrder()).toBe(5);
    });

    it('should return correct discount percent', () => {
      expect(couponService.getDiscountPercent()).toBe(10);
    });
  });
});
