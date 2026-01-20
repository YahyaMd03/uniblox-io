/**
 * Checkout Service - Handles order processing and coupon application
 * 
 * Business Logic (rolling counter):
 * - Validates coupon if provided
 * - Applies discount if coupon is valid
 * - On every checkout:
 *   1. Increment globalOrderCount
 *   2. Increment ordersSinceLastCouponUse
 *   3. If ordersSinceLastCouponUse === NTH_ORDER, generate a new coupon
 * - When a coupon is successfully applied:
 *   - Mark it as used
 *   - Reset ordersSinceLastCouponUse = 0
 * - If a coupon is not used, the counter does not reset
 * - Creates order
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
     * Rolling counter flow:
     * 1. Validate and apply coupon if provided
     * 2. On every checkout: Increment globalOrderCount and ordersSinceLastCouponUse
     * 3. If ordersSinceLastCouponUse === NTH_ORDER, generate a new coupon
     * 4. If coupon was successfully applied, reset ordersSinceLastCouponUse = 0
     * 5. Create order
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
        // Per assignment: "A coupon applies to the entire order"
        let discount = 0;
        let appliedCouponCode: string | undefined;
        let couponWasApplied = false;

        if (couponCode) {
            const validation = couponService.validateCoupon(couponCode);
            if (!validation.valid) {
                throw new Error('Invalid or expired coupon code');
            }

            // Apply coupon (marks it as invalid immediately after use)
            couponService.applyCoupon(couponCode);

            discount = (subtotal * validation.discountPercent) / 100;
            appliedCouponCode = couponCode;
            couponWasApplied = true;
        }

        // Calculate total
        const total = subtotal - discount;

        // On every checkout: Increment globalOrderCount and ordersSinceLastCouponUse
        store.incrementGlobalOrderCount();
        store.incrementOrdersSinceLastCouponUse();

        const globalOrderCount = store.getGlobalOrderCount();
        const ordersSinceLastCouponUse = store.getOrdersSinceLastCouponUse();

        // If ordersSinceLastCouponUse === NTH_ORDER, generate a new coupon
        couponService.maybeGenerateCoupon(ordersSinceLastCouponUse, globalOrderCount);

        // If coupon was successfully applied, reset the counter
        if (couponWasApplied) {
            store.resetOrdersSinceLastCouponUse();
        }

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

        return order;
    }
}

export const checkoutService = new CheckoutService();
