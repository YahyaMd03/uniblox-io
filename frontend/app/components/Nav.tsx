'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@/lib/context';
import { api } from '@/lib/api';

export default function Nav() {
  const pathname = usePathname();
  const { userId } = useUser();
  const [cartItemCount, setCartItemCount] = useState(0);

  useEffect(() => {
    if (userId) {
      const fetchCartCount = async () => {
        try {
          const response = await api.viewCart(userId);
          if (response.cart && response.cart.items) {
            const totalItems = response.cart.items.reduce((sum, item) => sum + item.quantity, 0);
            setCartItemCount(totalItems);
          } else {
            setCartItemCount(0);
          }
        } catch (error) {
          setCartItemCount(0);
        }
      };
      fetchCartCount();
      // Refresh cart count every 2 seconds
      const interval = setInterval(fetchCartCount, 2000);
      // Also refresh when cart is updated
      window.addEventListener('cartUpdated', fetchCartCount);
      return () => {
        clearInterval(interval);
        window.removeEventListener('cartUpdated', fetchCartCount);
      };
    }
  }, [userId]);

  return (
    <nav className="bg-transparent border-b border-gray-800/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2 text-xl font-bold text-white">
              <img src="/uniblox-icon.svg" alt="Uniblox" className="h-8 w-8" />
              <span>Uniblox</span>
            </Link>
            {pathname !== '/admin' && (
              <Link 
                href="/admin" 
                className="text-sm transition-colors text-gray-400 hover:text-white"
              >
                Admin
              </Link>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {pathname === '/admin' && (
              <Link href="/">
                <button className="flex items-center space-x-2 px-4 py-2 bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/50 rounded-lg transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <span className="text-sm font-medium">Products</span>
                </button>
              </Link>
            )}
            <Link 
              href="/cart" 
              className="relative"
            >
              <button className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                pathname === '/cart'
                  ? 'bg-gradient-uniblox text-white'
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700/50'
              }`}>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-sm font-medium">Cart</span>
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-uniblox-teal text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
