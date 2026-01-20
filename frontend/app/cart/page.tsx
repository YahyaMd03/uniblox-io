'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/context';
import { api, Cart, Order, CouponResponse } from '@/lib/api';
import Nav from '../components/Nav';

export default function CartPage() {
  const { userId } = useUser();
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [orderResult, setOrderResult] = useState<{ order: Order; message: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [loadingCoupon, setLoadingCoupon] = useState(false);
  const [activeCoupon, setActiveCoupon] = useState<CouponResponse | null>(null);
  const [couponApplied, setCouponApplied] = useState(false);

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to copy to clipboard' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  useEffect(() => {
    if (userId) {
      loadCart();
      loadActiveCoupon();
    }
  }, [userId]);

  const loadActiveCoupon = async () => {
    setLoadingCoupon(true);
    try {
      const response = await api.getActiveCoupon();
      setActiveCoupon(response);
      // Don't auto-apply - user must click "Apply Coupon" button
    } catch (error) {
      // Silently fail - coupon is optional
      setActiveCoupon(null);
    } finally {
      setLoadingCoupon(false);
    }
  };


  const loadCart = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const response = await api.viewCart(userId);
      setCart(response.cart);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to load cart',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!activeCoupon?.coupon) {
      setMessage({ type: 'error', text: 'Coupon code not available' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    // Validate the coupon
    setValidatingCoupon(true);
    try {
      const validation = await api.validateCoupon(activeCoupon.coupon.code);
      if (validation.valid) {
        setCouponCode(activeCoupon.coupon.code);
        setCouponApplied(true);
        setMessage({ type: 'success', text: 'Coupon applied successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setCouponApplied(false);
        setCouponCode('');
        setMessage({ type: 'error', text: 'Coupon code not available' });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      setCouponApplied(false);
      setCouponCode('');
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to apply coupon',
      });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setCouponApplied(false);
    setMessage({ type: 'success', text: 'Coupon removed' });
    setTimeout(() => setMessage(null), 2000);
  };

  const handleCheckout = async () => {
    if (!userId || !cart || cart.items.length === 0) {
      setMessage({ type: 'error', text: 'Cart is empty' });
      return;
    }

    setCheckingOut(true);
    setMessage(null);

    try {
      const response = await api.checkout(userId, couponApplied && couponCode ? couponCode : undefined);
      setOrderResult(response);
      setCart(null);
      setCouponCode('');
      setCouponApplied(false);
      setActiveCoupon(null);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Checkout failed',
      });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col overflow-hidden">
        <Nav />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-gray-400">Loading cart...</div>
        </div>
      </div>
    );
  }

  // Show checkout success result
  if (orderResult) {
    const { order } = orderResult;
    const couponUsed = order.couponCode && order.discount > 0;
    
    return (
      <div className="h-screen flex flex-col overflow-hidden">
        <Nav />
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
            <div className="text-center mb-6">
              <div className="inline-block mb-4">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                <span className="text-white">Order</span>
                <span className="gradient-text"> Successful!</span>
              </h1>
              <p className="text-gray-400">Your order has been placed successfully</p>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 mb-4">
              <h2 className="text-xl font-semibold text-white mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-gray-300">
                  <span>Order ID:</span>
                  <span className="text-white font-mono">{order.id}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-300">
                  <span>Items:</span>
                  <span className="text-white">{order.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-300">
                  <span>Subtotal:</span>
                  <span className="text-white">${order.subtotal.toFixed(2)}</span>
                </div>
                {couponUsed && (
                  <>
                    <div className="flex justify-between items-center text-sm text-uniblox-teal">
                      <span>Coupon Code:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{order.couponCode}</span>
                        <button
                          onClick={() => copyToClipboard(order.couponCode!)}
                          className="p-1 hover:bg-white/10 rounded transition-colors group"
                          title="Copy to clipboard"
                        >
                          {copiedCode === order.couponCode ? (
                            <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-3.5 h-3.5 text-uniblox-teal/70 group-hover:text-uniblox-teal transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm text-uniblox-teal">
                      <span>Discount Applied:</span>
                      <span className="font-semibold">-${order.discount.toFixed(2)}</span>
                    </div>
                    <div className="pt-2 border-t border-gray-700/50">
                      <div className="flex items-center space-x-2 text-green-400 text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Coupon code was valid and successfully applied!</span>
                      </div>
                    </div>
                  </>
                )}
                {couponCode && !couponUsed && (
                  <div className="pt-2 border-t border-gray-700/50">
                    <div className="flex items-center space-x-2 text-red-400 text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span>Coupon code "{couponCode}" was invalid or expired</span>
                    </div>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-white pt-2 border-t border-gray-700/50">
                  <span>Total:</span>
                  <span className="gradient-text">${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => router.push('/')}
                className="px-6 py-3 bg-gradient-uniblox text-white rounded-lg hover:shadow-lg hover:shadow-uniblox-purple/50 transition-all font-medium"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="h-screen flex flex-col overflow-hidden">
        <Nav />
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="text-center mb-6">
              <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                <span className="text-white">Your</span>
                <span className="gradient-text"> Cart</span>
              </h1>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-8 text-center">
              <p className="text-gray-400 text-base mb-4">Your cart is empty</p>
              <button
                onClick={() => router.push('/')}
                className="px-6 py-3 bg-gradient-uniblox text-white rounded-lg hover:shadow-lg hover:shadow-uniblox-purple/50 transition-all"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = cart.total || cart.items.reduce((sum, item) => {
    const price = item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Nav />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
          <div className="text-center mb-4 lg:mb-6">
            <h1 className="text-3xl lg:text-4xl font-bold mb-2">
              <span className="text-white">Your</span>
              <span className="gradient-text"> Cart</span>
            </h1>
          </div>

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

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
            <div className="p-4 lg:p-6">
              <div className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto">
              {cart.items.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center border-b border-gray-700/50 pb-4"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    {/* Product Image */}
                    {item.product?.imageUrl && (
                      <div className="relative w-20 h-20 bg-gray-900/50 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          fill
                          className="object-cover rounded-lg"
                          sizes="80px"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">
                        {item.product?.name || 'Unknown Product'}
                      </h3>
                      {item.product?.description && (
                        <p className="text-sm text-gray-400">{item.product.description}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-1">Quantity: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold gradient-text">
                      ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-400">
                      ${(item.product?.price || 0).toFixed(2)} each
                    </p>
                  </div>
                </div>
              ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-700/50">
                <div className="mb-3">
                  <label className="block text-xs lg:text-sm font-medium text-gray-300 mb-2">
                    Coupon
                  </label>
                  
                  {/* Display active coupon with apply button */}
                  {loadingCoupon ? (
                    <div className="p-3 bg-gray-900/50 border border-gray-700 rounded-lg text-center">
                      <p className="text-xs text-gray-400">Loading coupon...</p>
                    </div>
                  ) : activeCoupon?.coupon ? (
                    <div className="space-y-2">
                      <div className={`flex items-center justify-between p-3 rounded-lg border ${
                        couponApplied 
                          ? 'bg-green-500/10 border-green-500/30' 
                          : 'bg-gray-900/50 border-gray-700'
                      }`}>
                        <div className="flex items-center space-x-2 flex-1">
                          <span className={`text-sm font-semibold ${
                            couponApplied ? 'text-green-400' : 'text-gray-300'
                          }`}>
                            {activeCoupon.coupon.code}
                          </span>
                          {couponApplied && (
                            <span className="text-xs text-green-400">(10% off)</span>
                          )}
                        </div>
                        {couponApplied ? (
                          <button
                            onClick={handleRemoveCoupon}
                            className="text-xs px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/50 transition-all"
                          >
                            Remove
                          </button>
                        ) : (
                          <button
                            onClick={handleApplyCoupon}
                            disabled={validatingCoupon}
                            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                              validatingCoupon
                                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                : 'bg-uniblox-teal/20 text-uniblox-teal hover:bg-uniblox-teal/30 border border-uniblox-teal/50'
                            }`}
                          >
                            {validatingCoupon ? 'Applying...' : 'Apply Coupon'}
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-900/50 border border-gray-700 rounded-lg text-center">
                      <p className="text-xs text-gray-400">Coupon code not available</p>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  {couponApplied && couponCode && (
                    <div className="flex justify-between text-sm text-uniblox-teal">
                      <span>Discount (10%):</span>
                      <span>-${(subtotal * 0.1).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg lg:text-xl font-bold text-white pt-2 border-t border-gray-700/50">
                    <span>Total:</span>
                    <span className="gradient-text">
                      ${(couponApplied && couponCode ? subtotal * 0.9 : subtotal).toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={checkingOut}
                  className={`w-full py-2.5 rounded-lg font-medium text-white transition-all ${
                    checkingOut
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-gradient-uniblox hover:shadow-lg hover:shadow-uniblox-purple/50'
                  }`}
                >
                  {checkingOut ? 'Processing...' : 'Checkout'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
