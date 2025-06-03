'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Building2, Banknote, Shield, AlertCircle, User, Hash, Lock } from 'lucide-react';
import { PaymentMethod, PaymentDetails, PaymentResult } from '@/types';
import { paymentAPI } from '@/utils/api';
import { FormInput, FormSelect } from './forms/FormComponents';
import Button from './ui/Button';

interface PaymentComponentProps {
  orderId: string;
  totalAmount: number;
  onPaymentSuccess: (result: PaymentResult) => void;
  onPaymentError: (error: string) => void;
}

export default function PaymentComponent({ 
  orderId, 
  totalAmount, 
  onPaymentSuccess, 
  onPaymentError 
}: PaymentComponentProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({});
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    loadPaymentMethods();
  }, []);  const loadPaymentMethods = async () => {
    try {
      // For now, using mock data since backend doesn't provide full PaymentMethod structure
      const mockPaymentMethods: PaymentMethod[] = [
        {
          id: 'credit_card',
          name: 'Kredi Kartı',
          description: 'Visa, Mastercard, American Express',
          icon: 'credit-card',
          enabled: true,
          fees: 0
        },
        {
          id: 'bank_transfer',
          name: 'Banka Havalesi',
          description: 'EFT/Havale ile ödeme',
          icon: 'bank',
          enabled: true,
          fees: 5
        },
        {
          id: 'cash_on_delivery',
          name: 'Kapıda Ödeme',
          description: 'Teslimat sırasında nakit ödeme',
          icon: 'cash',
          enabled: true,
          fees: 10
        }
      ];
      
      setPaymentMethods(mockPaymentMethods);
      if (mockPaymentMethods.length > 0) {
        setSelectedMethod(mockPaymentMethods[0].id);
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
    }
  };

  const handlePaymentDetailsChange = (field: string, value: string | number) => {
    setPaymentDetails(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };
  const validateAndProcessPayment = async () => {
    setLoading(true);
    setValidationErrors([]);

    try {
      // Convert PaymentDetails to APIPaymentDetails format
      const apiPaymentDetails: { [key: string]: unknown } = { ...paymentDetails };      // Validate payment details
      const validationResponse = await paymentAPI.validateDetails(selectedMethod, apiPaymentDetails);
      
      if (!validationResponse.valid) {
        setValidationErrors(validationResponse.errors || ['Ödeme bilgileri geçersiz']);
        setLoading(false);
        return;
      }

      // Process payment
      const paymentResponse = await paymentAPI.processPayment(orderId, selectedMethod, apiPaymentDetails);
      
      if (paymentResponse.success) {
        onPaymentSuccess({
          success: true,
          transactionId: paymentResponse.transactionId,
          method: selectedMethod
        });
      } else {
        onPaymentError(paymentResponse.message || 'Payment failed');
      }    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Payment processing error';
      onPaymentError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getMethodIcon = (methodId: string) => {
    switch (methodId) {
      case 'credit_card':
        return <CreditCard className="w-6 h-6" />;
      case 'bank_transfer':
        return <Building2 className="w-6 h-6" />;
      case 'cash_on_delivery':
        return <Banknote className="w-6 h-6" />;
      default:
        return <CreditCard className="w-6 h-6" />;
    }
  };

  const selectedMethodData = paymentMethods.find(m => m.id === selectedMethod);
  return (
    <div className="bg-white rounded-lg border p-6" style={{ backgroundColor: '#ffffff', color: '#1f2937' }}>
      <h3 className="text-lg font-semibold mb-4 flex items-center" style={{ color: '#1f2937' }}>
        <Shield className="w-5 h-5 mr-2 text-green-600" />
        Ödeme Yöntemi Seçin
      </h3>

      {/* Payment Method Selection */}
      <div className="space-y-3 mb-6">
        {paymentMethods.map((method) => (
          <label
            key={method.id}
            className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
              selectedMethod === method.id
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value={method.id}
              checked={selectedMethod === method.id}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="sr-only"
            />
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <div className="text-green-600 mr-3">
                  {getMethodIcon(method.id)}
                </div>                <div>
                  <div className="font-medium" style={{ color: '#1f2937' }}>{method.name}</div>
                  <div className="text-sm text-gray-500">{method.description}</div>
                </div>
              </div>
              {method.fees > 0 && (
                <div className="text-sm text-gray-600">
                  +₺{method.fees.toFixed(2)}
                </div>
              )}
            </div>
          </label>
        ))}
      </div>

      {/* Payment Details Form */}
      {selectedMethod === 'credit_card' && (        <div className="space-y-4 mb-6">
          <h4 className="font-medium" style={{ color: '#1f2937' }}>Kredi Kartı Bilgileri</h4>
            <div>
            <FormInput
              leftIcon={<User className="h-4 w-4 text-gray-400" />}
              label="Kart Üzerindeki İsim"
              type="text"
              value={paymentDetails.cardHolder || ''}
              onChange={(e) => handlePaymentDetailsChange('cardHolder', e.target.value)}
              placeholder="John Doe"
              className="w-full"
            />
          </div>          <div>
            <FormInput
              leftIcon={<CreditCard className="h-4 w-4 text-gray-400" />}
              label="Kart Numarası"
              type="text"
              value={paymentDetails.cardNumber || ''}
              onChange={(e) => handlePaymentDetailsChange('cardNumber', e.target.value.replace(/\s/g, ''))}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">            <div>
              <FormSelect
                label="Ay"
                value={paymentDetails.expiryMonth?.toString() || ''}
                onChange={(e) => handlePaymentDetailsChange('expiryMonth', parseInt(e.target.value))}
                options={Array.from({ length: 12 }, (_, i) => ({
                  value: (i + 1).toString(),
                  label: String(i + 1).padStart(2, '0')
                }))}
                placeholder="Ay"
                className="w-full"
              />
            </div>
              <div>
              <FormSelect
                label="Yıl"
                value={paymentDetails.expiryYear?.toString() || ''}
                onChange={(e) => handlePaymentDetailsChange('expiryYear', parseInt(e.target.value))}
                options={Array.from({ length: 10 }, (_, i) => {
                  const year = new Date().getFullYear() + i;
                  return {
                    value: year.toString(),
                    label: year.toString()
                  };
                })}
                placeholder="Yıl"
                className="w-full"
              />
            </div><div>
              <FormInput
                leftIcon={<Lock className="h-4 w-4 text-gray-400" />}
                label="CVV"
                type="text"
                value={paymentDetails.cvv || ''}
                onChange={(e) => handlePaymentDetailsChange('cvv', e.target.value)}
                placeholder="123"
                maxLength={4}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}

      {selectedMethod === 'bank_transfer' && (        <div className="space-y-4 mb-6">
          <h4 className="font-medium" style={{ color: '#1f2937' }}>Banka Havalesi Bilgileri</h4>
            <div>
            <FormInput
              leftIcon={<Building2 className="h-4 w-4 text-gray-400" />}
              label="Banka Hesap Numarası"
              type="text"
              value={paymentDetails.bankAccount || ''}
              onChange={(e) => handlePaymentDetailsChange('bankAccount', e.target.value)}
              placeholder="TR00 0000 0000 0000 0000 00"
              className="w-full"
            />
          </div>          <div>
            <FormInput
              leftIcon={<Hash className="h-4 w-4 text-gray-400" />}
              label="Routing Number"
              type="text"
              value={paymentDetails.routingNumber || ''}
              onChange={(e) => handlePaymentDetailsChange('routingNumber', e.target.value)}
              placeholder="123456789"
              className="w-full"
            />
          </div>
        </div>
      )}

      {selectedMethod === 'cash_on_delivery' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <Banknote className="w-5 h-5 text-blue-600 mr-2" />
            <div>
              <div className="font-medium text-blue-800">Kapıda Ödeme</div>
              <div className="text-sm text-blue-600">
                Ürün teslim edilirken nakit olarak ödeme yapabilirsiniz.
                {selectedMethodData?.fees && selectedMethodData.fees > 0 && (
                  <span className="block mt-1">
                    Kapıda ödeme ücreti: ₺{selectedMethodData.fees.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-red-800">Lütfen aşağıdaki hataları düzeltin:</div>
              <ul className="text-sm text-red-600 mt-1 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Payment Summary */}      <div className="border-t pt-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="font-medium" style={{ color: '#1f2937' }}>Toplam Tutar:</span>
          <span className="text-lg font-bold" style={{ color: '#1f2937' }}>
            ₺{(totalAmount + (selectedMethodData?.fees || 0)).toFixed(2)}
          </span>
        </div>
        {selectedMethodData?.fees && selectedMethodData.fees > 0 && (
          <div className="flex justify-between items-center text-sm text-gray-600 mt-1">
            <span>Ödeme ücreti:</span>
            <span>₺{selectedMethodData.fees.toFixed(2)}</span>
          </div>
        )}
      </div>      {/* Payment Button */}
      <Button
        onClick={validateAndProcessPayment}
        disabled={loading || !selectedMethod}
        loading={loading}
        loadingText="Ödeme İşleniyor..."
        variant="primary"
        size="lg"
        className="w-full flex items-center justify-center"
      >
        <Shield className="w-5 h-5 mr-2" />
        Güvenli Ödeme Yap
      </Button>

      {/* Security Note */}
      <div className="mt-4 text-center">
        <div className="text-sm text-gray-500 flex items-center justify-center">
          <Shield className="w-4 h-4 mr-1" />
          256-bit SSL ile güvenli ödeme
        </div>
      </div>
    </div>
  );
}
