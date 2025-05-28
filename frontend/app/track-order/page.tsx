'use client';

import { useState } from 'react';
import { FiSearch, FiPackage, FiTruck, FiCheckCircle, FiClock } from 'react-icons/fi';

interface OrderStatus {
  status: string;
  date: string;
  description: string;
}

interface TrackingInfo {
  orderId: string;
  status: string;
  estimatedDelivery: string;
  trackingNumber: string;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
  };
  statusHistory: OrderStatus[];
}

export default function OrderTrackingPage() {
  const [orderId, setOrderId] = useState('');
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/track/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTrackingInfo(data);
      } else {
        setError('Order not found or invalid order ID');
      }
    } catch (error) {
      setError('Error tracking order');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <FiClock className="text-yellow-500" />;
      case 'processing':
        return <FiPackage className="text-blue-500" />;
      case 'shipped':
        return <FiTruck className="text-purple-500" />;
      case 'delivered':
        return <FiCheckCircle className="text-green-500" />;
      default:
        return <FiClock className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Order Tracking</h1>
          <p className="text-gray-600 mt-2">Track your order status and delivery information</p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleTrackOrder} className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="orderId" className="block text-sm font-medium text-gray-700 mb-2">
                Order ID
              </label>
              <input
                type="text"
                id="orderId"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Enter your order ID (e.g., ORD-12345)"
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <FiSearch />
                )}
                Track Order
              </button>
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Tracking Information */}
        {trackingInfo && (
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Order #{trackingInfo.orderId}</h2>
                  <p className="text-gray-600">Tracking Number: {trackingInfo.trackingNumber}</p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(trackingInfo.status)}`}>
                    {trackingInfo.status}
                  </span>
                  <p className="text-sm text-gray-600 mt-1">
                    Estimated Delivery: {new Date(trackingInfo.estimatedDelivery).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-900 mb-2">Shipping Address</h3>
                <div className="text-gray-600">
                  <p>{trackingInfo.shippingAddress.name}</p>
                  <p>{trackingInfo.shippingAddress.address}</p>
                  <p>{trackingInfo.shippingAddress.city}, {trackingInfo.shippingAddress.postalCode}</p>
                </div>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Status Timeline</h3>
              <div className="space-y-4">
                {trackingInfo.statusHistory.map((status, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getStatusIcon(status.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900 capitalize">{status.status}</h4>
                          <p className="text-gray-600 text-sm">{status.description}</p>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(status.date).toLocaleDateString()} {new Date(status.date).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Progress</h3>
              <div className="flex justify-between items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    ['pending', 'processing', 'shipped', 'delivered'].includes(trackingInfo.status.toLowerCase()) 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-300'
                  }`}>
                    <FiClock size={16} />
                  </div>
                  <span className="text-xs text-gray-600 mt-1">Order Placed</span>
                </div>
                <div className="flex-1 h-1 bg-gray-300 mx-2">
                  <div className={`h-full bg-green-500 transition-all ${
                    ['processing', 'shipped', 'delivered'].includes(trackingInfo.status.toLowerCase()) 
                      ? 'w-full' 
                      : 'w-0'
                  }`}></div>
                </div>
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    ['processing', 'shipped', 'delivered'].includes(trackingInfo.status.toLowerCase()) 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-300'
                  }`}>
                    <FiPackage size={16} />
                  </div>
                  <span className="text-xs text-gray-600 mt-1">Processing</span>
                </div>
                <div className="flex-1 h-1 bg-gray-300 mx-2">
                  <div className={`h-full bg-green-500 transition-all ${
                    ['shipped', 'delivered'].includes(trackingInfo.status.toLowerCase()) 
                      ? 'w-full' 
                      : 'w-0'
                  }`}></div>
                </div>
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    ['shipped', 'delivered'].includes(trackingInfo.status.toLowerCase()) 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-300'
                  }`}>
                    <FiTruck size={16} />
                  </div>
                  <span className="text-xs text-gray-600 mt-1">Shipped</span>
                </div>
                <div className="flex-1 h-1 bg-gray-300 mx-2">
                  <div className={`h-full bg-green-500 transition-all ${
                    trackingInfo.status.toLowerCase() === 'delivered' 
                      ? 'w-full' 
                      : 'w-0'
                  }`}></div>
                </div>
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    trackingInfo.status.toLowerCase() === 'delivered' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-300'
                  }`}>
                    <FiCheckCircle size={16} />
                  </div>
                  <span className="text-xs text-gray-600 mt-1">Delivered</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
