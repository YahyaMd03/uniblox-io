/**
 * Cart Service - Manages user shopping carts
 */

import { Cart, CartItem } from '../models/types';
import { store } from '../store/memory-store';
import { productService } from './product-service';

export class CartService {
  /**
   * Add an item to the user's cart
   * 
   * @param userId - User identifier
   * @param productId - Product to add
   * @param quantity - Quantity to add
   */
  addToCart(userId: string, productId: string, quantity: number): Cart {
    // Validate product exists
    if (!productService.validateProduct(productId)) {
      throw new Error(`Product with id ${productId} not found`);
    }

    if (quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    // Get or create cart
    let cart = store.getCart(userId);
    if (!cart) {
      cart = {
        userId,
        items: [],
        updatedAt: new Date(),
      };
    }

    // Check if product already in cart
    const existingItemIndex = cart.items.findIndex(item => item.productId === productId);
    
    if (existingItemIndex >= 0) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({ productId, quantity });
    }

    cart.updatedAt = new Date();
    store.setCart(userId, cart);

    return cart;
  }

  /**
   * Get user's cart with product details
   * 
   * @param userId - User identifier
   */
  getCart(userId: string): Cart | null {
    return store.getCart(userId) || null;
  }

  /**
   * Calculate cart total
   * 
   * @param cart - Cart to calculate total for
   */
  calculateCartTotal(cart: Cart): number {
    return cart.items.reduce((total, item) => {
      const product = productService.getProductById(item.productId);
      if (!product) {
        return total;
      }
      return total + product.price * item.quantity;
    }, 0);
  }

  /**
   * Clear user's cart
   * 
   * @param userId - User identifier
   */
  clearCart(userId: string): void {
    store.deleteCart(userId);
  }
}

export const cartService = new CartService();
