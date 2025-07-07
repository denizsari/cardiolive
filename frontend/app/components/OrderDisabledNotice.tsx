'use client';

import React from 'react';
import { MessageCircle, Clock, Phone, Info } from 'lucide-react';

interface OrderDisabledNoticeProps {
  onWhatsAppClick?: () => void;
  className?: string;
  variant?: 'banner' | 'card' | 'modal';
}

const OrderDisabledNotice: React.FC<OrderDisabledNoticeProps> = ({
  onWhatsAppClick,
  className = '',
  variant = 'banner'
}) => {
  const handleWhatsAppClick = () => {
    const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+905XXXXXXXXX';
    const message = 'Merhaba! Kardiyolive ürünlerinden sipariş vermek istiyorum. Yardımcı olabilir misiniz?';
    const cleanPhoneNumber = phoneNumber.replace(/[^\d]/g, '');
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${cleanPhoneNumber}?text=${encodedMessage}`;
    
    window.open(url, '_blank');
    
    if (onWhatsAppClick) {
      onWhatsAppClick();
    }
  };

  if (variant === 'banner') {
    return (
      <div className={`bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 mb-6 ${className}`}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Info className="w-6 h-6 text-green-600 mt-1" />
          </div>
          <div className="flex-grow">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              📱 WhatsApp Üzerinden Sipariş
            </h3>
            <p className="text-gray-600 mb-3">
              Şu anda online sipariş sistemi geçici olarak kapalıdır. 
              Tüm siparişlerinizi WhatsApp üzerinden güvenle verebilirsiniz.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleWhatsAppClick}
                className="inline-flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors duration-200"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp'tan Sipariş Ver
              </button>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-1 text-green-500" />
                Hızlı yanıt garantisi
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-6 shadow-sm ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            WhatsApp Sipariş Hattı
          </h3>
          <p className="text-gray-600 mb-4">
            Ürünlerimizi WhatsApp üzerinden sipariş edebilir, 
            kargo ve ödeme seçeneklerini konuşabilirsiniz.
          </p>
          <button
            onClick={handleWhatsAppClick}
            className="inline-flex items-center px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors duration-200 mb-3"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Sipariş Vermek İçin Tıklayın
          </button>
          <div className="flex items-center justify-center text-sm text-gray-500">
            <Phone className="w-4 h-4 mr-1" />
            7/24 Müşteri Desteği
          </div>
        </div>
      </div>
    );
  }

  // Modal variant
  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${className}`}>
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">
            🛒 Sipariş Sistemi
          </h3>
          <p className="text-gray-600 mb-6">
            Online sipariş sistemi şu anda bakımdadır. 
            WhatsApp üzerinden sipariş vermeye devam edebilirsiniz!
          </p>
          
          <div className="space-y-3 mb-6">
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Hızlı ve güvenli sipariş
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Kargo ve ödeme seçenekleri
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Anında müşteri desteği
            </div>
          </div>

          <button
            onClick={handleWhatsAppClick}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 mb-3"
          >
            <div className="flex items-center justify-center">
              <MessageCircle className="w-5 h-5 mr-2" />
              WhatsApp'ta Sipariş Ver
            </div>
          </button>
          
          <p className="text-xs text-gray-500">
            Genellikle 5 dakika içinde yanıtlıyoruz
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderDisabledNotice; 