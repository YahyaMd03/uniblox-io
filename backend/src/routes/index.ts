/**
 * Route index - Export all routes
 */

import { Router } from 'express';
import cartRoutes from './cart-routes';
import checkoutRoutes from './checkout-routes';
import adminRoutes from './admin-routes';
import couponRoutes from './coupon-routes';

const router = Router();

router.use('/cart', cartRoutes);
router.use('/checkout', checkoutRoutes);
router.use('/admin', adminRoutes);
router.use('/coupon', couponRoutes);

export default router;
