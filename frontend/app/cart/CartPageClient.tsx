'use client';

import React from 'react';
import { useCart } from '../contexts/CartContext';
import { ProductImage } from '../components/ui/OptimizedImage';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import Button, { LinkButton } from '../components/ui/Button';

export default function CartPageClient() {
  const { items, removeItem, updateQuantity, getCartTotal, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <ShoppingBag className="w-24 h-24 text-gray-400 mx-auto mb-6" />
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Sepetiniz boş</h2>
        <p className="text-gray-600 mb-8">Henüz sepetinize ürün eklemediniz.</p>
        <LinkButton href="/products" variant="primary">
          Alışverişe Başla
        </LinkButton>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Cart Items */}
      <div className="lg:col-span-2 space-y-4">
        {items.map((item) => (
          <div key={`${item._id}-${item.size || 'default'}`} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-4">
              <div className="relative w-20 h-20 rounded-md overflow-hidden bg-gray-100">
                <ProductImage
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                {item.size && (
                  <p className="text-sm text-gray-600">Boyut: {item.size}</p>
                )}
                <p className="text-lg font-semibold text-green-600">₺{item.price}</p>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => updateQuantity(item._id, item.quantity - 1, item.size)}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  disabled={item.quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </button>
                
                <span className="w-8 text-center font-medium">{item.quantity}</span>
                
                <button
                  onClick={() => updateQuantity(item._id, item.quantity + 1, item.size)}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              <button
                onClick={() => removeItem(item._id, item.size)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Sepetten Kaldır"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Order Summary */}
      <div className="bg-white rounded-lg shadow-sm p-6 h-fit">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Sipariş Özeti</h2>
        
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-gray-700">
            <span>Ara Toplam</span>
            <span>₺{getCartTotal()}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Kargo</span>
            <span>Ücretsiz</span>
          </div>
          <div className="border-t pt-3">
            <div className="flex justify-between text-lg font-semibold text-gray-900">
              <span>Toplam</span>
              <span>₺{getCartTotal()}</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={clearCart}
          >
            Sepeti Temizle
          </Button>
        </div>
        
        <p className="text-xs text-gray-600 mt-4 text-center">
          Siparişler WhatsApp üzerinden alınmaktadır
        </p>
      </div>
    </div>
  );
} 