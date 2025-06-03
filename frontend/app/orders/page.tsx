'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Package, Clock, CheckCircle, XCircle } from 'lucide-react';
import { LinkButton } from '../components/ui/Button';

// Force dynamic rendering to avoid prerender issues
export const dynamic = 'force-dynamic';

interface OrderItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    phone: string;
  };
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Lütfen giriş yapın');
        setLoading(false);
        return;
      }      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });      if (response.ok) {
        const data = await response.json();
        setOrders(data.data?.orders || data.orders || []);
      } else {
        setError('Siparişler yüklenirken hata oluştu');
      }    } catch {
      setError('Siparişler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="text-yellow-500" size={20} />;
      case 'processing':
        return <Package className="text-blue-500" size={20} />;
      case 'shipped':
        return <Package className="text-purple-500" size={20} />;
      case 'delivered':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'cancelled':
        return <XCircle className="text-red-500" size={20} />;
      default:
        return <Clock className="text-gray-500" size={20} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Beklemede';
      case 'processing':
        return 'Hazırlanıyor';
      case 'shipped':
        return 'Kargoda';
      case 'delivered':
        return 'Teslim Edildi';
      case 'cancelled':
        return 'İptal Edildi';
      default:
        return 'Bilinmeyen';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-300 rounded w-1/4"></div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-16">
              <XCircle size={64} className="mx-auto text-red-400 mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Hata</h1>
              <p className="text-gray-600">{error}</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Siparişlerim</h1>          {orders.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-blue-50 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <Package size={48} className="text-blue-400" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Henüz sipariş vermemişsiniz
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                İlk siparişinizi vermek için kaliteli kardiyoloji ürünlerimizi keşfedin ve güvenle alışveriş yapın.
              </p>
              <div className="space-y-4">
                <LinkButton
                  href="/products"
                  variant="primary"
                  size="lg"
                >
                  Alışverişe Başla
                </LinkButton>
                <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
                  <span className="flex items-center gap-2">
                    🚚 Hızlı Teslimat
                  </span>
                  <span className="flex items-center gap-2">
                    🔒 Güvenli Ödeme
                  </span>
                  <span className="flex items-center gap-2">
                    📞 7/24 Destek
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order._id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        Sipariş #{order.orderNumber}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-2 lg:mt-0">
                      {getStatusIcon(order.status)}
                      <span className="font-medium">{getStatusText(order.status)}</span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Order Items */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Ürünler</h4>
                      <div className="space-y-3">                        {order.items.map((item) => (
                          <div key={item._id} className="flex items-center gap-3">
                            <div className="relative w-12 h-12 rounded overflow-hidden">
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h5 className="text-sm font-medium text-gray-900">
                                {item.name}
                              </h5>
                              <p className="text-sm text-gray-600">
                                {item.quantity} adet × {formatPrice(item.price)}
                              </p>
                            </div>
                            <span className="text-sm font-medium">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Summary & Shipping */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Teslimat Adresi</h4>
                      <div className="text-sm text-gray-600 mb-4">
                        <p className="font-medium">{order.shippingAddress.fullName}</p>
                        <p>{order.shippingAddress.address}</p>
                        <p>{order.shippingAddress.city} {order.shippingAddress.postalCode}</p>
                        <p>{order.shippingAddress.phone}</p>
                      </div>
                      
                      <div className="border-t pt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold">Toplam:</span>
                          <span className="text-lg font-bold text-[#70BB1B]">
                            {formatPrice(order.total)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
