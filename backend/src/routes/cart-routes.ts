/**
 * Cart routes - Handle cart operations
 */

import { Router, Request, Response } from 'express';
import { cartService } from '../services/cart-service';
import { productService } from '../services/product-service';
import { AddToCartRequest, ViewCartRequest } from '../models/types';

const router = Router();

/**
 * POST /cart/add
 * Add item to cart
 */
router.post('/add', (req: Request, res: Response) => {
    try {
        const { userId, productId, quantity } = req.body as AddToCartRequest;

        // Validation
        if (!userId || !productId || quantity === undefined) {
            return res.status(400).json({ error: 'Missing required fields: userId, productId, quantity' });
        }

        if (typeof quantity !== 'number' || quantity <= 0) {
            return res.status(400).json({ error: 'Quantity must be a positive number' });
        }

        const cart = cartService.addToCart(userId, productId, quantity);

        // Enrich cart with product details for response
        const enrichedCart = {
            ...cart,
            items: cart.items.map(item => {
                const product = productService.getProductById(item.productId);
                return {
                    ...item,
                    product: product || null,
                };
            }),
        };

        res.json({ cart: enrichedCart });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(400).json({ error: message });
    }
});

/**
 * POST /cart/view
 * View user's cart
 */
router.post('/view', (req: Request, res: Response) => {
    try {
        const { userId } = req.body as ViewCartRequest;

        if (!userId) {
            return res.status(400).json({ error: 'Missing required field: userId' });
        }

        const cart = cartService.getCart(userId);

        if (!cart) {
            return res.json({ cart: null });
        }

        // Enrich cart with product details
        const enrichedCart = {
            ...cart,
            items: cart.items.map(item => {
                const product = productService.getProductById(item.productId);
                return {
                    ...item,
                    product: product || null,
                };
            }),
            total: cartService.calculateCartTotal(cart),
        };

        res.json({ cart: enrichedCart });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ error: message });
    }
});

export default router;
