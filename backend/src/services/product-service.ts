/**
 * Product service - manages available products
 * 
 * In a real system, this would fetch from a database.
 * For this demo, we maintain a static product catalog.
 */

import { Product } from '../models/types';

// Static product catalog
const PRODUCTS: Product[] = [
  { 
    id: '1', 
    name: 'Laptop', 
    price: 999.99, 
    description: 'High-performance laptop',
    imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&h=500&fit=crop'
  },
  { 
    id: '2', 
    name: 'Mouse', 
    price: 29.99, 
    description: 'Wireless mouse',
    imageUrl: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=500&h=500&fit=crop'
  },
  { 
    id: '3', 
    name: 'Keyboard', 
    price: 79.99, 
    description: 'Mechanical keyboard',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&h=500&fit=crop'
  },
  { 
    id: '4', 
    name: 'Monitor', 
    price: 299.99, 
    description: '27-inch 4K monitor',
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&h=500&fit=crop'
  },
  { 
    id: '5', 
    name: 'Headphones', 
    price: 149.99, 
    description: 'Noise-cancelling headphones',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop'
  },
  { 
    id: '6', 
    name: 'Webcam', 
    price: 89.99, 
    description: 'HD webcam with microphone',
    imageUrl: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=500&h=500&fit=crop'
  },
];

export class ProductService {
  /**
   * Get all available products
   */
  getAllProducts(): Product[] {
    return [...PRODUCTS];
  }

  /**
   * Get a product by ID
   */
  getProductById(id: string): Product | undefined {
    return PRODUCTS.find(p => p.id === id);
  }

  /**
   * Validate that a product exists
   */
  validateProduct(productId: string): boolean {
    return PRODUCTS.some(p => p.id === productId);
  }
}

export const productService = new ProductService();
