/**
 * Route index - Export all routes
 */

import { Router } from 'express';
import cartRoutes from './cart-routes';
import checkoutRoutes from './checkout-routes';
import adminRoutes from './admin-routes';

const router = Router();

router.use('/cart', cartRoutes);
router.use('/checkout', checkoutRoutes);
router.use('/admin', adminRoutes);

export default router;
