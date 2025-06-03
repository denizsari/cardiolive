'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart } from '../contexts/CartContext';
import { FormInput, FormTextarea } from '../components/forms/FormComponents';
import { ArrowLeft, ArrowRight, Package, Truck, Shield, User, Mail, Phone, MapPin, Building, FileText } from 'lucide-react';
import PaymentComponent from '../components/PaymentComponent';
import Button from '../components/ui/Button';
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

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  district?: string;
  postalCode?: string;
}

interface FormTouched {
  [key: string]: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdOrderId, setCreatedOrderId] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [formTouched, setFormTouched] = useState<FormTouched>({});

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
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'fullName':
        if (!value.trim()) return 'Ad soyad zorunludur';
        if (value.trim().length < 2) return 'Ad soyad en az 2 karakter olmalıdır';
        if (!/^[a-zA-ZçÇğĞıİöÖşŞüÜ\s]+$/.test(value)) return 'Ad soyad sadece harf içermelidir';
        return '';
      
      case 'email':
        if (!value.trim()) return 'E-posta zorunludur';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Geçerli bir e-posta adresi girin';
        return '';
      
      case 'phone':
        if (!value.trim()) return 'Telefon numarası zorunludur';
        const phoneClean = value.replace(/[^\d]/g, '');
        if (phoneClean.length < 10) return 'Telefon numarası en az 10 haneli olmalıdır';
        if (phoneClean.length > 11) return 'Telefon numarası 11 haneden fazla olamaz';
        return '';
      
      case 'address':
        if (!value.trim()) return 'Adres zorunludur';
        if (value.trim().length < 10) return 'Adres detayı en az 10 karakter olmalıdır';
        return '';
      
      case 'city':
        if (!value.trim()) return 'İl zorunludur';
        if (!/^[a-zA-ZçÇğĞıİöÖşŞüÜ\s]+$/.test(value)) return 'İl adı sadece harf içermelidir';
        return '';
      
      case 'district':
        if (!value.trim()) return 'İlçe zorunludur';
        if (!/^[a-zA-ZçÇğĞıİöÖşŞüÜ\s]+$/.test(value)) return 'İlçe adı sadece harf içermelidir';
        return '';
      
      case 'postalCode':
        if (value && value.length !== 5) return 'Posta kodu 5 haneli olmalıdır';
        if (value && !/^\d+$/.test(value)) return 'Posta kodu sadece rakam içermelidir';
        return '';
      
      default:
        return '';
    }
  };

  const validateAllFields = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;
    
    Object.keys(shippingForm).forEach((key) => {
      if (key !== 'notes') { // Notes is optional
        const error = validateField(key, shippingForm[key as keyof ShippingForm]);
        if (error) {
          errors[key as keyof FormErrors] = error;
          isValid = false;
        }
      }
    });
    
    setFormErrors(errors);
    return isValid;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setShippingForm(prev => ({
      ...prev,
      [name]: value
    }));

    // Mark field as touched
    setFormTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Real-time validation
    if (formTouched[name] || value.length > 0) {
      const error = validateField(name, value);
      setFormErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Mark field as touched on blur
    setFormTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Validate on blur
    const error = validateField(name, value);
    setFormErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };  const validateShippingForm = () => {
    const isValid = validateAllFields();
    if (!isValid) {
      setError('Lütfen tüm zorunlu alanları doğru şekilde doldurun.');
    }
    return isValid;
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
                  
                  <form onSubmit={handleShippingSubmit} className="space-y-4">                    <div className="grid md:grid-cols-2 gap-4">                      <div>
                        <FormInput
                          leftIcon={<User className="h-4 w-4 text-gray-400" />}
                          label="Ad Soyad"
                          type="text"
                          id="fullName"
                          name="fullName"
                          value={shippingForm.fullName}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          required
                          error={formErrors.fullName ? { message: formErrors.fullName } : undefined}
                          className="w-full"
                        />
                      </div>                      <div>
                        <FormInput
                          leftIcon={<Mail className="h-4 w-4 text-gray-400" />}
                          label="E-posta"
                          type="email"
                          id="email"
                          name="email"
                          value={shippingForm.email}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          required
                          error={formErrors.email ? { message: formErrors.email } : undefined}
                          className="w-full"
                        />
                      </div>
                    </div>                    <div>
                      <FormInput
                        leftIcon={<Phone className="h-4 w-4 text-gray-400" />}
                        label="Telefon"
                        type="tel"
                        id="phone"
                        name="phone"
                        value={shippingForm.phone}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        required
                        placeholder="0555 123 45 67"
                        error={formErrors.phone ? { message: formErrors.phone } : undefined}
                        className="w-full"
                      />
                    </div>                    <div>
                      <FormTextarea
                        label="Adres"
                        id="address"
                        name="address"
                        value={shippingForm.address}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        required
                        rows={3}
                        placeholder="Detaylı adres bilgisi girin..."
                        error={formErrors.address ? { message: formErrors.address } : undefined}
                        className="w-full"
                      />
                    </div><div className="grid md:grid-cols-3 gap-4">                      <div>
                        <FormInput
                          leftIcon={<Building className="h-4 w-4 text-gray-400" />}
                          label="İl"
                          type="text"
                          id="city"
                          name="city"
                          value={shippingForm.city}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          required
                          placeholder="İstanbul"
                          error={formErrors.city ? { message: formErrors.city } : undefined}
                          className="w-full"
                        />
                      </div>                      <div>
                        <FormInput
                          leftIcon={<MapPin className="h-4 w-4 text-gray-400" />}
                          label="İlçe"
                          type="text"
                          id="district"
                          name="district"
                          value={shippingForm.district}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          required
                          placeholder="Kadıköy"
                          error={formErrors.district ? { message: formErrors.district } : undefined}
                          className="w-full"
                        />
                      </div>                      <div>
                        <FormInput
                          leftIcon={<FileText className="h-4 w-4 text-gray-400" />}
                          label="Posta Kodu"
                          type="text"
                          id="postalCode"
                          name="postalCode"
                          value={shippingForm.postalCode}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          placeholder="34000"
                          maxLength={5}
                          error={formErrors.postalCode ? { message: formErrors.postalCode } : undefined}
                          className="w-full"
                        />
                      </div>
                    </div>                    <div>
                      <FormTextarea
                        label="Sipariş Notu (Opsiyonel)"
                        id="notes"
                        name="notes"
                        value={shippingForm.notes}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Kapı kodu, kat bilgisi vb."
                        className="w-full"
                      />
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-600 text-sm">{error}</p>
                      </div>
                    )}                    <Button
                      type="submit"
                      disabled={isLoading}
                      loading={isLoading}
                      className="w-full"
                      size="lg"
                    >
                      {!isLoading && (
                        <>
                          Ödeme Adımına Geç
                          <ArrowRight className="ml-2" size={16} />
                        </>
                      )}
                    </Button>
                  </form>
                </>
              )}

              {currentStep === 2 && (
                <>                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Ödeme Bilgileri</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={goBackToShipping}
                      className="flex items-center text-[#70BB1B] hover:text-[#5ea516] transition-colors"
                    >
                      <ArrowLeft className="mr-1" size={16} />
                      Geri Dön
                    </Button>
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
