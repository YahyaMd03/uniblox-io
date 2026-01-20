/**
 * Coupon Service - Manages coupon generation and validation
 * 
 * Business Rules (rolling counter):
 * - Use NTH_ORDER = 3
 * - Maintain ordersSinceLastCouponUse counter
 * - On every checkout:
 *   1. Increment globalOrderCount
 *   2. Increment ordersSinceLastCouponUse
 *   3. If ordersSinceLastCouponUse === NTH_ORDER, generate a new coupon
 * - When a coupon is successfully applied:
 *   - Mark it as used
 *   - Reset ordersSinceLastCouponUse = 0
 * - If a coupon is not used, the counter does not reset
 * - Only one active coupon exists at a time
 * - A coupon:
 *   - Applies to the entire order
 *   - Is valid only once
 *   - Becomes invalid immediately after use
 */

import { Coupon } from '../models/types';
import { store } from '../store/memory-store';

const NTH_ORDER = 3;
const DISCOUNT_PERCENT = 10;

export class CouponService {
    /**
     * Get the NTH_ORDER value (for use in checkout service)
     */
    getNthOrder(): number {
        return NTH_ORDER;
    }
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
     * Generate a new coupon if ordersSinceLastCouponUse === NTH_ORDER.
     * This is called during checkout after incrementing ordersSinceLastCouponUse.
     * 
     * Rolling counter logic: Coupons appear ON the Nth order since the last coupon was used.
     * 
     * @param ordersSinceLastCouponUse - The current count of orders since last coupon use (already incremented)
     * @param globalOrderCount - The global order count (for deterministic code generation)
     * @returns The generated coupon, or null if no coupon should be generated
     */
    maybeGenerateCoupon(ordersSinceLastCouponUse: number, globalOrderCount: number): Coupon | null {
        // Generate coupon only when ordersSinceLastCouponUse === NTH_ORDER
        // This means: coupon generated ON the Nth order (counter goes 0→1→2→3, generates on 3rd order when NTH_ORDER=3)
        if (ordersSinceLastCouponUse !== NTH_ORDER) {
            return null;
        }

        // Per assignment: "Only one active coupon exists at a time"
        // Invalidate any existing active coupon before creating a new one
        const activeCoupon = store.getActiveCoupon();
        if (activeCoupon) {
            activeCoupon.isValid = false;
        }

        // Generate deterministic coupon code based on global order count
        const code = this.generateCouponCode(globalOrderCount);

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
     * Validate a coupon code.
     * Per assignment: "A coupon is valid only once" and "becomes invalid immediately after use"
     * 
     * @param code - Coupon code to validate
     * @returns Validation result with valid flag and discount percent
     */
    validateCoupon(code: string): { valid: boolean; discountPercent: number } {
        const coupon = store.getAllCoupons().find(c => c.code === code && c.isValid);

        if (!coupon) {
            return { valid: false, discountPercent: 0 };
        }

        return { valid: true, discountPercent: coupon.discountPercent };
    }

    /**
     * Apply a coupon (marks it as used).
     * Per assignment: "A coupon becomes invalid immediately after use"
     * 
     * @param code - Coupon code to apply
     */
    applyCoupon(code: string): void {
        store.markCouponAsUsed(code);
    }

    /**
     * Get the active coupon (if any).
     * Per assignment: "Only one active coupon exists at a time"
     * 
     * @returns The active coupon, or null if none exists
     */
    getActiveCoupon(): Coupon | null {
        return store.getActiveCoupon();
    }
}

export const couponService = new CouponService();
