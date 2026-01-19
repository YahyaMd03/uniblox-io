'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useUser } from '@/lib/context';
import { api, Product } from '@/lib/api';
import Nav from './components/Nav';

export default function Home() {
  const { userId } = useUser();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    // In a real app, we'd fetch from an API
    // For now, we'll use a static list that matches backend products
    const staticProducts: Product[] = [
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
    setProducts(staticProducts);
    setLoading(false);
  }, []);

  const handleAddToCart = async (productId: string) => {
    if (!userId) {
      setMessage({ type: 'error', text: 'Please set a user ID' });
      return;
    }

    setAdding(productId);
    setMessage(null);

    try {
      await api.addToCart(userId, productId, 1);
      setMessage({ type: 'success', text: 'Item added to cart!' });
      setTimeout(() => setMessage(null), 3000);
      // Trigger a custom event to refresh cart count in Nav
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to add item to cart' 
      });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setAdding(null);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col overflow-hidden">
        <Nav />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-gray-400">Loading products...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Nav />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          {/* Toast Notification Tooltip */}
          {message && (
            <div
              className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm transition-all duration-300 ease-in-out ${
                message.type === 'success'
                  ? 'bg-green-500/90 border border-green-400/50 text-white'
                  : 'bg-red-500/90 border border-red-400/50 text-white'
              }`}
              style={{
                animation: 'slideInDown 0.3s ease-out',
              }}
            >
              <div className="flex items-center space-x-2">
                {message.type === 'success' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                <span className="text-sm font-medium">{message.text}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50 overflow-hidden hover:border-uniblox-teal/50 transition-all duration-300 hover:shadow-lg hover:shadow-uniblox-purple/20 flex flex-col"
            >
              {/* Product Image */}
              {product.imageUrl && (
                <div className="relative w-full h-40 bg-gray-900/50 overflow-hidden flex-shrink-0">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 16vw"
                    priority={product.id === '1' || product.id === '2' || product.id === '3'}
                    onError={(e) => {
                      // Fallback if image fails to load
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div className="p-3 flex flex-col flex-1">
                <h2 className="text-base font-semibold text-white mb-1 line-clamp-1">
                  {product.name}
                </h2>
                {product.description && (
                  <p className="text-gray-400 text-xs mb-2 line-clamp-1">{product.description}</p>
                )}
                <div className="flex justify-between items-center mt-auto pt-2">
                  <span className="text-base font-bold gradient-text">
                    ${product.price.toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleAddToCart(product.id)}
                    disabled={adding === product.id}
                    className={`px-3 py-1.5 text-xs rounded-md font-medium transition-all ${
                      adding === product.id
                        ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                        : 'bg-gradient-uniblox text-white hover:shadow-lg hover:shadow-uniblox-purple/50'
                    }`}
                  >
                    {adding === product.id ? 'Adding...' : '+ Add to Cart'}
                  </button>
                </div>
              </div>
            </div>
          ))}
          </div>
        </div>
      </div>
    </div>
  );
}
