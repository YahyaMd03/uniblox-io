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
            allCoupons: store.getAllCoupons(),
            totalOrders: store.getGlobalOrderCount(),
        };
    }
}

export const adminService = new AdminService();
