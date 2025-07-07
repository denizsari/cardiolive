'use client';

import React, { useState, useEffect } from 'react';
import { X, MessageCircle, Phone, Clock, ShoppingCart } from 'lucide-react';

interface WhatsAppWidgetProps {
  phoneNumber?: string;
  message?: string;
  position?: 'bottom-right' | 'bottom-left';
  showPopup?: boolean;
  productName?: string;
  productPrice?: string;
  className?: string;
}

const WhatsAppWidget: React.FC<WhatsAppWidgetProps> = ({
  phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+905XXXXXXXXX',
  message = 'Merhaba! Kardiyolive ürünleri hakkında bilgi almak istiyorum.',
  position = 'bottom-right',
  showPopup = true,
  productName,
  productPrice,
  className = ''
}) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [hasShown, setHasShown] = useState(false);

  // Auto-show popup after 3 seconds (only once per session)
  useEffect(() => {
    if (showPopup && !hasShown) {
      const timer = setTimeout(() => {
        setIsPopupOpen(true);
        setHasShown(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showPopup, hasShown]);

  const generateWhatsAppURL = (customMessage?: string) => {
    const baseMessage = customMessage || message;
    let finalMessage = baseMessage;

    if (productName) {
      finalMessage = `Merhaba! "${productName}" ürünü hakkında bilgi almak istiyorum.`;
      if (productPrice) {
        finalMessage += ` (Fiyat: ${productPrice})`;
      }
    }

    const encodedMessage = encodeURIComponent(finalMessage);
    const cleanPhoneNumber = phoneNumber.replace(/[^\d]/g, '');
    
    return `https://wa.me/${cleanPhoneNumber}?text=${encodedMessage}`;
  };

  const handleWhatsAppClick = (customMessage?: string) => {
    const url = generateWhatsAppURL(customMessage);
    window.open(url, '_blank');
    setIsPopupOpen(false);
  };

  const quickMessages = [
    {
      icon: <ShoppingCart className="w-4 h-4" />,
      text: 'Ürün bilgisi istiyorum',
      message: 'Merhaba! Kardiyolive ürünleri hakkında detaylı bilgi alabilir miyim?'
    },
    {
      icon: <Phone className="w-4 h-4" />,
      text: 'Fiyat öğrenmek istiyorum',
      message: 'Merhaba! Kardiyolive ürünlerinin güncel fiyat listesini alabilir miyim?'
    },
    {
      icon: <Clock className="w-4 h-4" />,
      text: 'Sipariş vermek istiyorum',
      message: 'Merhaba! Kardiyolive ürünlerinden sipariş vermek istiyorum. Yardımcı olabilir misiniz?'
    }
  ];

  if (!isVisible) return null;

  const positionClasses = position === 'bottom-right' 
    ? 'bottom-4 right-4' 
    : 'bottom-4 left-4';

  return (
    <div className={`fixed ${positionClasses} z-50 ${className}`}>
      {/* Popup Modal */}
      {isPopupOpen && (
        <div className="absolute bottom-16 right-0 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 p-4 mb-2 animate-in slide-in-from-bottom-2">
          {/* Header */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Kardiyolive Destek</h3>
                <p className="text-xs text-green-600 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                  Çevrimiçi
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsPopupOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Merhaba! 👋 Kardiyolive ürünleri hakkında nasıl yardımcı olabilirim?
            </p>

            {productName && (
              <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                <p className="text-sm font-medium text-green-800">İlgilendiğiniz Ürün:</p>
                <p className="text-sm text-green-700">{productName}</p>
                {productPrice && (
                  <p className="text-sm text-green-600 font-semibold">{productPrice}</p>
                )}
              </div>
            )}

            {/* Quick Action Buttons */}
            <div className="space-y-2">
              {quickMessages.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleWhatsAppClick(item.message)}
                  className="w-full flex items-center space-x-2 p-2 text-left text-sm bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-200 rounded-lg transition-all duration-200"
                >
                  <span className="text-green-600">{item.icon}</span>
                  <span className="text-gray-700">{item.text}</span>
                </button>
              ))}
            </div>

            {/* Main WhatsApp Button */}
            <button
              onClick={() => handleWhatsAppClick()}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp'ta Sohbet Et</span>
            </button>

            <p className="text-xs text-gray-500 text-center">
              Genellikle birkaç dakika içinde yanıtlıyoruz
            </p>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsPopupOpen(!isPopupOpen)}
        className="w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group animate-bounce"
        style={{ animationDuration: '2s', animationIterationCount: 'infinite' }}
      >
        <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
        
        {/* Online indicator */}
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full animate-pulse"></span>
        
        {/* Message notification badge */}
        {!hasShown && (
          <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-ping">
            1
          </span>
        )}
      </button>

      {/* Tooltip */}
      {!isPopupOpen && (
        <div className="absolute bottom-16 right-0 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          WhatsApp'ta mesaj gönderin
        </div>
      )}
    </div>
  );
};

export default WhatsAppWidget; 