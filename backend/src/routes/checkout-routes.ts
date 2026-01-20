/**
 * Checkout routes - Handle order processing
 */

import { Router, Request, Response } from 'express';
import { checkoutService } from '../services/checkout-service';
import { couponService } from '../services/coupon-service';
import { CheckoutRequest } from '../models/types';

const router = Router();

/**
 * POST /checkout/validate-coupon
 * Validate a coupon code without applying it
 */
router.post('/validate-coupon', (req: Request, res: Response) => {
    try {
        const { couponCode } = req.body;

        if (!couponCode) {
            return res.status(400).json({ error: 'Missing required field: couponCode' });
        }

        const validation = couponService.validateCoupon(couponCode);
        res.json(validation);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(400).json({ error: message });
    }
});

/**
 * POST /checkout
 * Process checkout and create order
 */
router.post('/', (req: Request, res: Response) => {
    try {
        const { userId, couponCode } = req.body as CheckoutRequest;

        if (!userId) {
            return res.status(400).json({ error: 'Missing required field: userId' });
        }

        const order = checkoutService.processCheckout({ userId, couponCode });

        res.json({
            order,
            message: 'Order placed successfully',
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(400).json({ error: message });
    }
});

export default router;
