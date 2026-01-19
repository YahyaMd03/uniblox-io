/**
 * Admin Service - Provides statistics and admin operations
 */

import { AdminStats } from '../models/types';
import { store } from '../store/memory-store';
import { couponService } from './coupon-service';

export class AdminService {
  /**
   * Get comprehensive admin statistics
   */
  getStats(): AdminStats {
    return {
      activeCoupon: couponService.getActiveCoupon(),
      totalItemsSold: store.getTotalItemsSold(),
      totalRevenue: store.getTotalRevenue(),
      totalDiscountGiven: store.getTotalDiscountGiven(),
      allCoupons: couponService.getAllCoupons(),
      totalOrders: store.getGlobalOrderCount(),
    };
  }

  /**
   * Manually generate a coupon (admin override)
   * This is useful for testing or manual coupon generation
   * 
   * @param customCode - Optional custom coupon code to use instead of auto-generated
   */
  generateCoupon(customCode?: string): { coupon: { code: string; discountPercent: number; createdAt: Date; isValid: boolean } } {
    const orderCount = store.getGlobalOrderCount();
    const coupon = couponService.generateNewCoupon(orderCount + 1, customCode); // Use next order count to avoid conflicts
    
    return {
      coupon: {
        code: coupon.code,
        discountPercent: coupon.discountPercent,
        createdAt: coupon.createdAt,
        isValid: coupon.isValid,
      },
    };
  }
}

export const adminService = new AdminService();
