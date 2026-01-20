/**
 * Coupon routes - Handle coupon operations
 * 
 * Per assignment: Coupons are generated only during checkout.
 * This endpoint simply returns the active coupon if one exists.
 */

import { Router, Request, Response } from 'express';
import { couponService } from '../services/coupon-service';

const router = Router();

/**
 * GET /coupon/active
 * Get the active coupon (if any exists)
 * Per assignment: Only one active coupon exists at a time
 */
router.get('/active', (req: Request, res: Response) => {
  try {
    const activeCoupon = couponService.getActiveCoupon();

    if (activeCoupon) {
      res.json({ coupon: activeCoupon });
    } else {
      res.json({ coupon: null });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: message });
  }
});

export default router;
