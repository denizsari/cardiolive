'use client';

import React from 'react';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck, 
  MapPin, 
  Calendar,
  CreditCard,
  Phone,
  Copy
} from 'lucide-react';
import { ProductImage } from '../ui/OptimizedImage';
import Button from '../ui/Button';
import { useToast } from '../ui/Toast';

interface OrderItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
}

interface OrderDetailProps {
  order: {
    _id: string;
    orderNumber: string;
    items: OrderItem[];
    total: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    createdAt: string;
    shippingAddress: ShippingAddress;
    paymentMethod?: string;
    trackingNumber?: string;
    estimatedDelivery?: string;
  };
}

const OrderDetail: React.FC<OrderDetailProps> = ({ order }) => {
  const { addToast } = useToast();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="text-yellow-500" size={20} />;
      case 'processing':
        return <Package className="text-blue-500" size={20} />;
      case 'shipped':
        return <Truck className="text-purple-500" size={20} />;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    addToast({ type: 'success', title: 'Kargo takip numarası kopyalandı' });
  };

  const canCancelOrder = () => {
    return order.status === 'pending' || order.status === 'processing';
  };

  const canReturnOrder = () => {
    return order.status === 'delivered';
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      {/* Order Header */}
      <div className="border-b border-gray-200 pb-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold text-gray-900">
            Sipariş #{order.orderNumber}
          </h2>
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
            {getStatusIcon(order.status)}
            {getStatusText(order.status)}
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(order.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Package className="h-4 w-4" />
            <span>{order.items.length} ürün</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Order Items */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Sipariş Detayları</h3>
          
          {/* Order Items */}
          <div className="space-y-4 mb-6">
            {order.items.map((item) => (
              <div key={item._id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">                <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                  <ProductImage
                    src={item.image}
                    alt={item.name}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{item.name}</h4>
                  <p className="text-sm text-gray-600">
                    {item.quantity} adet × {formatPrice(item.price)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-medium text-gray-900">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-2">
              <span className="text-sm text-gray-600">Ara Toplam:</span>
              <span className="text-sm">{formatPrice(order.total * 0.85)}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-2">
              <span className="text-sm text-gray-600">Kargo:</span>
              <span className="text-sm">{formatPrice(order.total * 0.05)}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-2">
              <span className="text-sm text-gray-600">KDV:</span>
              <span className="text-sm">{formatPrice(order.total * 0.1)}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-lg font-semibold">Toplam:</span>
              <span className="text-lg font-bold text-[#70BB1B]">
                {formatPrice(order.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column - Shipping & Payment */}
        <div className="space-y-6">
          {/* Shipping Address */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Teslimat Adresi
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-medium text-gray-900">{order.shippingAddress.fullName}</p>
              <p className="text-gray-600 mt-1">{order.shippingAddress.address}</p>
              <p className="text-gray-600">{order.shippingAddress.city} {order.shippingAddress.postalCode}</p>
              <div className="flex items-center gap-2 mt-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">{order.shippingAddress.phone}</span>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Ödeme Bilgileri
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-600">
                Ödeme Yöntemi: <span className="font-medium">{order.paymentMethod || 'Kredi Kartı'}</span>
              </p>
              <p className="text-gray-600 mt-1">
                Ödeme Durumu: <span className="font-medium text-green-600">Tamamlandı</span>
              </p>
            </div>
          </div>

          {/* Tracking Information */}
          {order.trackingNumber && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Kargo Takibi
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Takip Numarası:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">{order.trackingNumber}</span>
                    <button
                      onClick={() => copyToClipboard(order.trackingNumber!)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {order.estimatedDelivery && (
                  <p className="text-gray-600">
                    Tahmini Teslimat: <span className="font-medium">{formatDate(order.estimatedDelivery)}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Order Timeline */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Sipariş Durumu</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Sipariş Alındı</p>
                  <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                </div>
              </div>
              
              {order.status !== 'pending' && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Package className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Hazırlanıyor</p>
                    <p className="text-sm text-gray-600">Siparişiniz hazırlanmaya başlandı</p>
                  </div>
                </div>
              )}

              {(order.status === 'shipped' || order.status === 'delivered') && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <Truck className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Kargoya Verildi</p>
                    <p className="text-sm text-gray-600">Siparişiniz kargo yolunda</p>
                  </div>
                </div>
              )}

              {order.status === 'delivered' && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Teslim Edildi</p>
                    <p className="text-sm text-gray-600">Siparişiniz başarıyla teslim edildi</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {canCancelOrder() && (
              <Button
                variant="outline"
                size="sm"
                className="w-full text-red-600 border-red-600 hover:bg-red-50"
              >
                Siparişi İptal Et
              </Button>
            )}
            
            {canReturnOrder() && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
              >
                İade Talebi Oluştur
              </Button>
            )}
            
            {order.trackingNumber && (
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                onClick={() => window.open(`https://www.ptt.gov.tr/kargo-sorgula?id=${order.trackingNumber}`, '_blank')}
              >
                Kargo Takip Et
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
