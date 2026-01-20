'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/lib/context';
import { api, AdminStats } from '@/lib/api';
import Nav from '../components/Nav';

export default function AdminPage() {
  const { userId } = useUser();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

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
    loadStats();
    // Refresh stats every 5 seconds
    const interval = setInterval(loadStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const data = await api.getStats();
      setStats(data);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to load stats',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCoupon = async () => {
    setGenerating(true);
    setMessage(null);

    try {
      await api.generateCoupon(couponCode.trim() || undefined);
      setMessage({ type: 'success', text: 'Coupon generated successfully!' });
      setTimeout(() => setMessage(null), 3000);
      setCouponCode(''); // Clear the input after successful generation
      loadStats();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to generate coupon',
      });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col overflow-hidden">
        <Nav />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-gray-400">Loading admin stats...</div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="h-screen flex flex-col overflow-hidden">
        <Nav />
        <div className="flex-1 flex justify-center items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-red-400">Failed to load statistics</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Nav />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
          <div className="flex justify-between items-center mb-4 lg:mb-6">
            <div>
              <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold mb-1">
                <span className="text-white">Admin</span>
                <span className="gradient-text"> Dashboard</span>
              </h1>
              <p className="text-gray-400 text-xs lg:text-sm">Monitor your store performance</p>
            </div>
            <div className="flex items-end space-x-3">
              <div className="flex flex-col">
                <label className="text-xs text-gray-400 mb-1.5">Coupon Code (optional)</label>
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Leave empty for auto"
                  className="px-3 py-2 text-sm bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-uniblox-teal focus:border-transparent w-48"
                  disabled={generating}
                />
              </div>
              <button
                onClick={handleGenerateCoupon}
                disabled={generating}
                className={`px-4 py-2 text-xs lg:text-sm rounded-lg font-medium transition-all h-[42px] ${
                  generating
                    ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                    : 'bg-gradient-uniblox text-white hover:shadow-lg hover:shadow-uniblox-purple/50'
                }`}
              >
                {generating ? 'Generating...' : 'Generate Coupon'}
              </button>
            </div>
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

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-4">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-3 lg:p-4 hover:border-uniblox-teal/50 transition-all">
            <h3 className="text-xs lg:text-sm font-medium text-gray-400 mb-1">Total Orders</h3>
            <p className="text-xl lg:text-2xl xl:text-3xl font-bold gradient-text">{stats.totalOrders}</p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-3 lg:p-4 hover:border-uniblox-teal/50 transition-all">
            <h3 className="text-xs lg:text-sm font-medium text-gray-400 mb-1">Total Items Sold</h3>
            <p className="text-xl lg:text-2xl xl:text-3xl font-bold gradient-text">{stats.totalItemsSold}</p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-3 lg:p-4 hover:border-uniblox-teal/50 transition-all">
            <h3 className="text-xs lg:text-sm font-medium text-gray-400 mb-1">Total Revenue</h3>
            <p className="text-xl lg:text-2xl xl:text-3xl font-bold gradient-text">
              ${stats.totalRevenue.toFixed(2)}
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-3 lg:p-4 hover:border-uniblox-teal/50 transition-all">
            <h3 className="text-xs lg:text-sm font-medium text-gray-400 mb-1">Total Discount Given</h3>
            <p className="text-xl lg:text-2xl xl:text-3xl font-bold text-uniblox-teal">
              ${stats.totalDiscountGiven.toFixed(2)}
            </p>
          </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4 lg:p-5 mb-4">
            <h2 className="text-lg lg:text-xl font-semibold text-white mb-3">Active Coupon</h2>
          {stats.activeCoupon ? (
            <div className="bg-gradient-uniblox/20 border border-uniblox-teal/50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <p className="text-lg font-bold text-white">
                      {stats.activeCoupon.code}
                    </p>
                    <button
                      onClick={() => copyToClipboard(stats.activeCoupon!.code)}
                      className="p-1.5 hover:bg-white/10 rounded transition-colors group"
                      title="Copy to clipboard"
                    >
                      {copiedCode === stats.activeCoupon.code ? (
                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-uniblox-teal transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <p className="text-sm text-uniblox-teal">
                    {stats.activeCoupon.discountPercent}% discount
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Created: {new Date(stats.activeCoupon.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className="px-3 py-1 bg-gradient-uniblox text-white rounded-full text-sm font-medium">
                  Active
                </span>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No active coupon available</p>
          )}
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4 lg:p-5">
            <h2 className="text-lg lg:text-xl font-semibold text-white mb-3">
              All Generated Coupons ({stats.allCoupons.length})
            </h2>
            {stats.allCoupons.length === 0 ? (
              <p className="text-gray-400 text-sm">No coupons generated yet</p>
            ) : (
              <div className="overflow-x-auto max-h-[calc(100vh-500px)]">
                <table className="min-w-full divide-y divide-gray-700/50">
                  <thead className="bg-gray-900/50 sticky top-0">
                    <tr>
                      <th className="px-3 lg:px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Code
                      </th>
                      <th className="px-3 lg:px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Discount
                      </th>
                      <th className="px-3 lg:px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-3 lg:px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-3 lg:px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Used
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-transparent divide-y divide-gray-700/50">
                    {stats.allCoupons.map((coupon, index) => (
                      <tr key={index} className="hover:bg-gray-700/30 transition-colors">
                        <td className="px-3 lg:px-4 py-2 whitespace-nowrap text-xs lg:text-sm font-medium text-white">
                          <div className="flex items-center space-x-2">
                            <span>{coupon.code}</span>
                            <button
                              onClick={() => copyToClipboard(coupon.code)}
                              className="p-1 hover:bg-white/10 rounded transition-colors group"
                              title="Copy to clipboard"
                            >
                              {copiedCode === coupon.code ? (
                                <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <svg className="w-3.5 h-3.5 text-gray-500 group-hover:text-uniblox-teal transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="px-3 lg:px-4 py-2 whitespace-nowrap text-xs lg:text-sm text-gray-400">
                          {coupon.discountPercent}%
                        </td>
                        <td className="px-3 lg:px-4 py-2 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              coupon.isValid
                                ? 'bg-uniblox-teal/20 text-uniblox-teal border border-uniblox-teal/50'
                                : 'bg-red-500/20 text-red-400 border border-red-500/50'
                            }`}
                          >
                            {coupon.isValid ? 'Active' : 'Used'}
                          </span>
                        </td>
                        <td className="px-3 lg:px-4 py-2 whitespace-nowrap text-xs lg:text-sm text-gray-400">
                          {new Date(coupon.createdAt).toLocaleString()}
                        </td>
                        <td className="px-3 lg:px-4 py-2 whitespace-nowrap text-xs lg:text-sm text-gray-400">
                          {coupon.usedAt
                            ? new Date(coupon.usedAt).toLocaleString()
                            : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
