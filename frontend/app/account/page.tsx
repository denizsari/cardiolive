'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import OrderDetail from '../components/orders/OrderDetail';
import { FormInput, FormTextarea } from '../components/forms/FormComponents';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Edit, 
  MapPin, 
  Package, 
  Settings, 
  Lock,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Filter,
  Search
} from 'lucide-react';
import { userAPI } from '../utils/api';
import { ProductImage } from '../components/ui/OptimizedImage';

interface UserData {
  _id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  role: string;
  createdAt: string;
}

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
  paymentMethod?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

type ActiveTab = 'profile' | 'orders' | 'settings';

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<ActiveTab>('profile');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    address: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const userData = localStorage.getItem('user');
    if (userData && userData !== 'undefined') {
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser && typeof parsedUser === 'object' && parsedUser._id) {
          setUser(parsedUser);
          setFormData({
            name: parsedUser.name,
            email: parsedUser.email,
            phoneNumber: parsedUser.phoneNumber || '',
            address: parsedUser.address || ''
          });
        } else {
          console.warn('Invalid user data structure, clearing localStorage');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/login');
          return;
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
        return;
      }
    }
    setLoading(false);
  }, [router]);
  useEffect(() => {
    if (activeTab === 'orders' && orders.length === 0) {
      fetchOrders();
    }
  }, [activeTab, orders.length]);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });      if (response.ok) {
        const data = await response.json();
        setOrders(data.data?.orders || data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(!editing);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await userAPI.updateProfile(formData);
      
      if (response.success) {
        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
        setEditing(false);
        setSuccess('Profil başarıyla güncellendi');
      } else {
        setError(response.message || 'Profil güncellenirken bir hata oluştu');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="text-yellow-500" size={16} />;
      case 'processing':
        return <Package className="text-blue-500" size={16} />;
      case 'shipped':
        return <Truck className="text-purple-500" size={16} />;
      case 'delivered':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'cancelled':
        return <XCircle className="text-red-500" size={16} />;
      default:
        return <Clock className="text-gray-500" size={16} />;
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
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredOrders = orders.filter(order => {
    const matchesFilter = orderFilter === 'all' || order.status === orderFilter;
    const matchesSearch = searchQuery === '' || 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });
  const sidebarItems = [
    { id: 'profile' as ActiveTab, label: 'Profil Bilgileri', icon: User },
    { id: 'orders' as ActiveTab, label: 'Siparişlerim', icon: Package },
    { id: 'settings' as ActiveTab, label: 'Hesap Ayarları', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'var(--font-inter)' }}>
        <Header />
        <main className="pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
              <div className="grid lg:grid-cols-4 gap-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-300 rounded w-full"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  </div>
                </div>
                <div className="lg:col-span-3 bg-white rounded-lg shadow p-6">
                  <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-300 rounded w-full"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'var(--font-inter)' }}>
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Hesabım</h1>
            <p className="text-gray-600 mt-2">
              Hesap bilgilerinizi yönetin ve siparişlerinizi takip edin
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#70BB1B] rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{user.name}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                </div>
                
                <nav className="p-2">
                  {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                          activeTab === item.id
                            ? 'bg-[#70BB1B] text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        {item.label}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                  {success}
                </div>
              )}

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-medium text-gray-900">Kişisel Bilgiler</h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEdit}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {editing ? 'İptal' : 'Düzenle'}
                    </Button>
                  </div>

                  <div className="px-6 py-6">
                    <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <dt className="text-sm font-medium text-gray-500 flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          Ad Soyad
                        </dt>
                        <dd className="mt-1">
                          {editing ? (
                            <FormInput
                              leftIcon={<User className="h-4 w-4 text-gray-400" />}
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              placeholder="Ad Soyad"
                              className="w-full"
                            />
                          ) : (
                            <span className="text-sm text-gray-900">{user.name}</span>
                          )}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-sm font-medium text-gray-500 flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          E-posta
                        </dt>
                        <dd className="mt-1">
                          {editing ? (
                            <FormInput
                              leftIcon={<Mail className="h-4 w-4 text-gray-400" />}
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              placeholder="E-posta adresiniz"
                              className="w-full"
                            />
                          ) : (
                            <span className="text-sm text-gray-900">{user.email}</span>
                          )}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-sm font-medium text-gray-500 flex items-center">
                          <Phone className="h-4 w-4 mr-2" />
                          Telefon
                        </dt>
                        <dd className="mt-1">
                          {editing ? (
                            <FormInput
                              leftIcon={<Phone className="h-4 w-4 text-gray-400" />}
                              type="tel"
                              name="phoneNumber"
                              value={formData.phoneNumber}
                              onChange={handleChange}
                              placeholder="Telefon numaranız"
                              className="w-full"
                            />
                          ) : (
                            <span className="text-sm text-gray-900">
                              {user.phoneNumber || 'Telefon numarası belirtilmemiş'}
                            </span>
                          )}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-sm font-medium text-gray-500 flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Üyelik Tarihi
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                        </dd>
                      </div>

                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-gray-500 flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          Adres
                        </dt>
                        <dd className="mt-1">
                          {editing ? (
                            <FormTextarea
                              name="address"
                              value={formData.address}
                              onChange={handleChange}
                              rows={3}
                              placeholder="Adresiniz"
                              className="w-full"
                            />
                          ) : (
                            <span className="text-sm text-gray-900">
                              {user.address || 'Adres belirtilmemiş'}
                            </span>
                          )}
                        </dd>
                      </div>
                    </dl>

                    {editing && (
                      <div className="mt-6 flex justify-end space-x-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditing(false)}
                        >
                          İptal
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleSave}
                          loading={saving}
                          loadingText="Kaydediliyor..."
                        >
                          Kaydet
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <h2 className="text-lg font-medium text-gray-900">Siparişlerim</h2>
                      
                      {/* Filters and Search */}
                      <div className="flex gap-3">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Sipariş ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#70BB1B] focus:border-transparent"
                          />
                        </div>
                        
                        <div className="relative">
                          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <select
                            value={orderFilter}
                            onChange={(e) => setOrderFilter(e.target.value)}
                            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#70BB1B] focus:border-transparent appearance-none bg-white"
                          >
                            <option value="all">Tüm Siparişler</option>
                            <option value="pending">Beklemede</option>
                            <option value="processing">Hazırlanıyor</option>
                            <option value="shipped">Kargoda</option>
                            <option value="delivered">Teslim Edildi</option>
                            <option value="cancelled">İptal Edildi</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    {ordersLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="animate-pulse border border-gray-200 rounded-lg p-4">
                            <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                          </div>
                        ))}
                      </div>
                    ) : filteredOrders.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="bg-gray-50 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                          <Package size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {searchQuery || orderFilter !== 'all' ? 'Sipariş bulunamadı' : 'Henüz sipariş vermemişsiniz'}
                        </h3>
                        <p className="text-gray-600 mb-6">
                          {searchQuery || orderFilter !== 'all' 
                            ? 'Arama kriterlerinize uygun sipariş bulunamadı.'
                            : 'İlk siparişinizi vermek için alışverişe başlayın.'
                          }
                        </p>
                        {!searchQuery && orderFilter === 'all' && (
                          <Button
                            variant="primary"
                            onClick={() => router.push('/products')}
                          >
                            Alışverişe Başla
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredOrders.map((order) => (
                          <div key={order._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="font-medium text-gray-900">
                                    Sipariş #{order.orderNumber}
                                  </h3>
                                  <div className="flex items-center gap-1">
                                    {getStatusIcon(order.status)}
                                    <span className="text-sm text-gray-600">{getStatusText(order.status)}</span>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                  <span>{formatDate(order.createdAt)}</span>
                                  <span>{order.items.length} ürün</span>
                                  <span className="font-medium text-[#70BB1B]">{formatPrice(order.total)}</span>
                                </div>

                                <div className="flex items-center gap-2">                                  {order.items.slice(0, 3).map((item) => (
                                    <div key={item._id} className="relative w-8 h-8 rounded overflow-hidden">
                                      <ProductImage
                                        src={item.image}
                                        alt={item.name}
                                        className="object-cover w-full h-full"
                                      />
                                    </div>
                                  ))}
                                  {order.items.length > 3 && (
                                    <span className="text-xs text-gray-600">+{order.items.length - 3} diğer</span>
                                  )}
                                </div>
                              </div>

                              <div className="flex gap-2">
                                {order.trackingNumber && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(`https://www.ptt.gov.tr/kargo-sorgula?id=${order.trackingNumber}`, '_blank')}
                                  >
                                    <Truck className="h-4 w-4 mr-1" />
                                    Takip Et
                                  </Button>
                                )}
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => setSelectedOrder(order)}
                                >
                                  Detaylar
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Hesap Ayarları</h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push('/change-password')}
                        className="w-full justify-start"
                      >
                        <Lock className="h-4 w-4 mr-3" />
                        Şifre Değiştir
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Order Detail Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title=""
        size="xl"
      >        {selectedOrder && (
          <OrderDetail
            order={selectedOrder}
          />
        )}
      </Modal>
    </div>
  );
}
