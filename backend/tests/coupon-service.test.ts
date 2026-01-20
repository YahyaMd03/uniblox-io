/**
 * Unit tests for Coupon Service
 * 
 * Tests the rolling counter coupon generation logic and validation
 * Per assignment: NTH_ORDER = 3, coupon generated when ordersSinceLastCouponUse === 3
 */

/// <reference types="jest" />

import { couponService } from '../src/services/coupon-service';
import { store } from '../src/store/memory-store';

describe('CouponService', () => {
    beforeEach(() => {
        // Clear coupons before each test by invalidating all active coupons
        const allCoupons = store.getAllCoupons();
        allCoupons.forEach(coupon => {
            coupon.isValid = false;
        });
    });

    describe('maybeGenerateCoupon', () => {
        it('should generate coupon when ordersSinceLastCouponUse is 3', () => {
            const coupon = couponService.maybeGenerateCoupon(3, 3);

            expect(coupon).not.toBeNull();
            expect(coupon!.code).toMatch(/^SAVE10-[A-Z0-9]{4}$/);
            expect(coupon!.discountPercent).toBe(10);
            expect(coupon!.isValid).toBe(true);
        });

        it('should generate coupon when ordersSinceLastCouponUse is 3 (different globalOrderCount)', () => {
            const coupon = couponService.maybeGenerateCoupon(3, 10);

            expect(coupon).not.toBeNull();
            expect(coupon!.discountPercent).toBe(10);
            expect(coupon!.isValid).toBe(true);
            expect(coupon!.code).toMatch(/^SAVE10-/);
        });

        it('should return null when ordersSinceLastCouponUse is not 3', () => {
            expect(couponService.maybeGenerateCoupon(4, 4)).toBeNull();
            expect(couponService.maybeGenerateCoupon(5, 5)).toBeNull();
            expect(couponService.maybeGenerateCoupon(1, 1)).toBeNull();
            expect(couponService.maybeGenerateCoupon(2, 2)).toBeNull();
        });

        it('should invalidate existing coupon when generating new one', () => {
            const coupon1 = couponService.maybeGenerateCoupon(3, 3);
            expect(coupon1).not.toBeNull();
            expect(coupon1!.isValid).toBe(true);

            const coupon2 = couponService.maybeGenerateCoupon(3, 6);
            expect(coupon2).not.toBeNull();
            expect(coupon2!.isValid).toBe(true);

            // First coupon should be invalidated (only one active coupon at a time)
            const validation = couponService.validateCoupon(coupon1!.code);
            expect(validation.valid).toBe(false);
        });
    });

    describe('validateCoupon', () => {
        it('should validate an active coupon', () => {
            const coupon = couponService.maybeGenerateCoupon(3, 3);
            expect(coupon).not.toBeNull();

            const validation = couponService.validateCoupon(coupon!.code);
            expect(validation.valid).toBe(true);
            expect(validation.discountPercent).toBe(10);
        });

        it('should invalidate a used coupon', () => {
            const coupon = couponService.maybeGenerateCoupon(3, 3);
            expect(coupon).not.toBeNull();

            couponService.applyCoupon(coupon!.code);

            const validation = couponService.validateCoupon(coupon!.code);
            expect(validation.valid).toBe(false);
        });

        it('should return false for non-existent coupon', () => {
            const validation = couponService.validateCoupon('INVALID-CODE');
            expect(validation.valid).toBe(false);
        });
    });

    describe('applyCoupon', () => {
        it('should mark coupon as used (becomes invalid immediately after use)', () => {
            const coupon = couponService.maybeGenerateCoupon(3, 3);
            expect(coupon).not.toBeNull();

            couponService.applyCoupon(coupon!.code);

            const validation = couponService.validateCoupon(coupon!.code);
            expect(validation.valid).toBe(false);
        });
    });

    describe('getActiveCoupon', () => {
        it('should return active coupon when one exists', () => {
            const coupon = couponService.maybeGenerateCoupon(3, 3);
            expect(coupon).not.toBeNull();

            const activeCoupon = couponService.getActiveCoupon();
            expect(activeCoupon).not.toBeNull();
            expect(activeCoupon!.code).toBe(coupon!.code);
        });

        it('should return null when no active coupon exists', () => {
            // Ensure no active coupon exists by invalidating any existing ones
            const existingCoupon = couponService.getActiveCoupon();
            if (existingCoupon) {
                couponService.applyCoupon(existingCoupon.code);
            }

            const activeCoupon = couponService.getActiveCoupon();
            expect(activeCoupon).toBeNull();
        });
    });
});
