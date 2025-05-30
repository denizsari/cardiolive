'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart } from '../contexts/CartContext';
import { ArrowLeft, ArrowRight, Package, Truck, Shield } from 'lucide-react';
import PaymentComponent from '../components/PaymentComponent';
import { PaymentResult } from '../types';
import { orderAPI } from '../utils/api';

interface ShippingForm {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  postalCode: string;
  notes: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCart();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdOrderId, setCreatedOrderId] = useState('');
  const [orderNumber, setOrderNumber] = useState('');

  const [shippingForm, setShippingForm] = useState<ShippingForm>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    postalCode: '',
    notes: ''
  });

  useEffect(() => {
    // Redirect if cart is empty
    if (items.length === 0) {
      router.push('/cart');
      return;
    }

    // Load user data if available
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsed = JSON.parse(userData);
      setShippingForm(prev => ({
        ...prev,
        fullName: parsed.name || '',
        email: parsed.email || ''
      }));
    }
  }, [items, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setShippingForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };
  const validateShippingForm = () => {
    const requiredFields = ['fullName', 'email', 'phone', 'address', 'city', 'district'];
    const fieldNames: { [key: string]: string } = {
      fullName: 'ad soyad',
      email: 'e-posta',
      phone: 'telefon',
      address: 'adres',
      city: 'il',
      district: 'ilçe'
    };
    
    for (const field of requiredFields) {
      if (!shippingForm[field as keyof ShippingForm].trim()) {
        setError(`Lütfen ${fieldNames[field]} alanını doldurun.`);
        return false;
      }
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shippingForm.email)) {
      setError('Lütfen geçerli bir e-posta adresi girin.');
      return false;
    }
    
    return true;
  };
  const createPendingOrder = async () => {
    setIsLoading(true);
    setError('');

    try {
      const orderData = {
        items: items.map(item => ({
          product: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        total: getTotalPrice(),
        shippingAddress: {
          fullName: shippingForm.fullName,
          email: shippingForm.email,
          phone: shippingForm.phone,
          address: shippingForm.address,
          city: shippingForm.city,
          state: shippingForm.district,
          zipCode: shippingForm.postalCode,
          country: 'Türkiye'
        },
        paymentMethod: 'cash_on_delivery'
      };      const order = await orderAPI.create(orderData);
      setCreatedOrderId(order._id);
      setOrderNumber(order.orderNumber);
      setCurrentStep(2);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Sipariş oluşturulurken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (validateShippingForm()) {
      createPendingOrder();
    }
  };
  const handlePaymentSuccess = async (result: PaymentResult) => {
    try {
      // Update order with payment information
      await orderAPI.updatePayment(createdOrderId, {
        paymentMethod: result.method || 'unknown',
        paymentStatus: 'paid',
        paymentReference: result.transactionId || result.reference,
        paidAt: new Date().toISOString()
      });

      clearCart();
      router.push(`/order-success?orderNumber=${orderNumber}`);
    } catch {
      setError('Ödeme başarılı ancak sipariş güncellenirken hata oluştu. Lütfen müşteri hizmetleri ile iletişime geçin.');
    }
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const goBackToShipping = () => {
    setCurrentStep(1);
    setError('');
  };

  if (items.length === 0) {
    return null; // Will redirect
  }  return (
    <div className="min-h-screen bg-gray-50 text-gray-900" style={{ backgroundColor: '#f8fafc', color: '#1f2937' }}>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-20" style={{ backgroundColor: '#f8fafc' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-4">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep >= 1 ? 'bg-[#70BB1B] text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  1
                </div>
                <span className={`text-sm font-medium ${
                  currentStep >= 1 ? 'text-[#70BB1B]' : 'text-gray-500'
                }`}>
                  Teslimat Bilgileri
                </span>
                <div className={`w-12 h-0.5 ${
                  currentStep >= 2 ? 'bg-[#70BB1B]' : 'bg-gray-300'
                }`}></div>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep >= 2 ? 'bg-[#70BB1B] text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  2
                </div>
                <span className={`text-sm font-medium ${
                  currentStep >= 2 ? 'text-[#70BB1B]' : 'text-gray-500'
                }`}>
                  Ödeme
                </span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Main Content */}
            <div className="bg-white rounded-lg shadow-sm p-6" style={{ backgroundColor: '#ffffff', color: '#1f2937' }}>
              {currentStep === 1 && (
                <>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6" style={{ color: '#1f2937' }}>Teslimat Bilgileri</h2>
                  
                  <form onSubmit={handleShippingSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                          Ad Soyad *
                        </label>
                        <input
                          type="text"
                          id="fullName"
                          name="fullName"
                          value={shippingForm.fullName}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#70BB1B] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          E-posta *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={shippingForm.email}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#70BB1B] focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Telefon *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={shippingForm.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#70BB1B] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                        Adres *
                      </label>
                      <textarea
                        id="address"
                        name="address"
                        value={shippingForm.address}
                        onChange={handleInputChange}
                        required
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#70BB1B] focus:border-transparent"
                      />
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                          İl *
                        </label>
                        <input
                          type="text"
                          id="city"
                          name="city"
                          value={shippingForm.city}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#70BB1B] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
                          İlçe *
                        </label>
                        <input
                          type="text"
                          id="district"
                          name="district"
                          value={shippingForm.district}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#70BB1B] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                          Posta Kodu
                        </label>
                        <input
                          type="text"
                          id="postalCode"
                          name="postalCode"
                          value={shippingForm.postalCode}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#70BB1B] focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                        Sipariş Notu (Opsiyonel)
                      </label>
                      <textarea
                        id="notes"
                        name="notes"
                        value={shippingForm.notes}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#70BB1B] focus:border-transparent"
                        placeholder="Kapı kodu, kat bilgisi vb."
                      />
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-600 text-sm">{error}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-[#70BB1B] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#5ea516] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isLoading ? (
                        'Devam Ediliyor...'
                      ) : (
                        <>
                          Ödeme Adımına Geç
                          <ArrowRight className="ml-2" size={16} />
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}

              {currentStep === 2 && (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Ödeme Bilgileri</h2>
                    <button
                      onClick={goBackToShipping}
                      className="flex items-center text-[#70BB1B] hover:text-[#5ea516] transition-colors"
                    >
                      <ArrowLeft className="mr-1" size={16} />
                      Geri Dön
                    </button>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  )}

                  <PaymentComponent
                    orderId={createdOrderId}
                    totalAmount={getTotalPrice()}
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentError={handlePaymentError}
                  />
                </>
              )}
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6 h-fit" style={{ backgroundColor: '#ffffff', color: '#1f2937' }}>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Sipariş Özeti</h2>
              
              <div className="space-y-4 mb-6">                {items.map((item) => (
                  <div key={`${item._id}-${item.size}`} className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      {item.size && <p className="text-sm text-gray-600">Boyut: {item.size}</p>}
                      <p className="text-sm text-gray-600">{item.quantity} adet</p>
                    </div>
                    <span className="font-medium">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ara Toplam</span>
                  <span>{formatPrice(getTotalPrice())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Kargo</span>
                  <span className="text-green-600">Ücretsiz</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Toplam</span>
                  <span className="text-[#70BB1B]">{formatPrice(getTotalPrice())}</span>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Shield className="text-green-600" size={16} />
                  <span>Güvenli Ödeme</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Truck className="text-blue-600" size={16} />
                  <span>Hızlı Teslimat</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Package className="text-purple-600" size={16} />
                  <span>Sipariş Takibi</span>
                </div>
              </div>

              {/* Order Info (if order created) */}
              {orderNumber && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <h3 className="font-medium text-green-800 mb-1">Sipariş Oluşturuldu</h3>
                  <p className="text-sm text-green-600">
                    Sipariş No: <span className="font-bold">#{orderNumber}</span>
                  </p>
                </div>              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
