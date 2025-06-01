'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign,
  Eye
} from 'lucide-react';
import { productAPI, orderAPI, userAPI } from '../utils/api';
import { Order } from '../types';
import { 
  DashboardStatsSkeleton, 
  TableSkeleton 
} from '../components/Loading';
import { 
  ApiErrorFallback 
} from '../components/ErrorBoundary';

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: Order[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      // Check if user is authenticated
      if (!token) {
        setError('Kimlik doğrulama gerekli. Lütfen tekrar giriş yapın.');
        return;
      }
      
      // Fetch basic stats using centralized API methods with error handling
      const [userCount, products, orders] = await Promise.all([
        userAPI.getUserCount().catch(err => {
          console.error('Failed to fetch user count:', err);
          return 0;
        }),
        productAPI.getAll().catch(err => {
          console.error('Failed to fetch products:', err);
          return [];
        }),
        orderAPI.getAll().catch(err => {
          console.error('Failed to fetch orders:', err);
          return [];
        })
      ]);
      
      // Calculate total revenue from non-cancelled orders
      const totalRevenue = orders.reduce((sum: number, order: Order) => {
        if (order.status !== 'cancelled') {
          return sum + (order.total || 0);
        }
        return sum;
      }, 0);
      
      setStats({
        totalUsers: userCount || 0,
        totalProducts: products.length,
        totalOrders: orders.length,
        totalRevenue,
        recentOrders: orders.slice(0, 5)
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error instanceof Error ? error.message : 'Veri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

    const getStatusText = (status: string) => {
    const statusMap = {
      pending: 'Beklemede',
      processing: 'Hazırlanıyor',
      shipped: 'Kargoda',
      delivered: 'Teslim Edildi',
      cancelled: 'İptal Edildi'
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Cardiolive yönetim paneline hoş geldiniz</p>
        </div>
        <DashboardStatsSkeleton />
        <TableSkeleton rows={5} columns={5} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Cardiolive yönetim paneline hoş geldiniz</p>
        </div>
        <ApiErrorFallback 
          error={new Error(error || 'Unknown error')} 
          reset={() => {
            setError(null);
            fetchDashboardData();
          }} 
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Cardiolive yönetim paneline hoş geldiniz</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Kullanıcı</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Ürün</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Sipariş</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Gelir</p>
              <p className="text-3xl font-bold text-gray-900">{formatPrice(stats.totalRevenue)}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Son Siparişler</h2>
            <a 
              href="/admin/orders" 
              className="text-[#70BB1B] hover:text-[#5ea516] font-medium text-sm flex items-center"
            >
              Tümünü Gör
              <Eye className="w-4 h-4 ml-1" />
            </a>
          </div>
        </div>
          <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sipariş No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Müşteri
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tarih
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tutar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.recentOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{order.orderNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {typeof order.user === 'object' ? order.user.name : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {formatPrice(order.total)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {stats.recentOrders.length === 0 && (
            <div className="text-center py-8">
              <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Henüz sipariş bulunmuyor</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hızlı İşlemler</h3>
          <div className="space-y-3">
            <a 
              href="/admin/products/add" 
              className="block w-full bg-[#70BB1B] text-white py-2 px-4 rounded-lg text-center hover:bg-[#5ea516] transition-colors"
            >
              Yeni Ürün Ekle
            </a>
            <a 
              href="/admin/blog/add" 
              className="block w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-center hover:bg-blue-700 transition-colors"
            >
              Yeni Blog Yazısı
            </a>
            <a 
              href="/admin/orders" 
              className="block w-full bg-purple-600 text-white py-2 px-4 rounded-lg text-center hover:bg-purple-700 transition-colors"
            >
              Siparişleri Yönet
            </a>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Son Aktiviteler</h3>
          <div className="space-y-3 text-sm">
            <p className="text-gray-600">• Yeni kullanıcı kaydı: Bugün 3 kişi</p>
            <p className="text-gray-600">• Sipariş tamamlandı: 2 adet</p>
            <p className="text-gray-600">• Blog yazısı yayınlandı: 1 adet</p>
            <p className="text-gray-600">• Ürün stoğu güncellendi: 5 adet</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sistem Durumu</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Sunucu</span>
              <span className="flex items-center text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Aktif
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Veritabanı</span>
              <span className="flex items-center text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Aktif
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">API</span>
              <span className="flex items-center text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Aktif
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
