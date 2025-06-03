'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import Image from 'next/image';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart } from '../contexts/CartContext';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import Button, { LinkButton } from '../components/ui/Button';

export default function CartPage() {  const { items, updateQuantity, removeItem, getTotalPrice, clearCart } = useCart();

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    updateQuantity(productId, newQuantity);
  };

  const handleRemoveItem = (productId: string) => {
    removeItem(productId);
  };

  const handleClearCart = () => {
    if (window.confirm('Sepeti temizlemek istediğinizden emin misiniz?')) {
      clearCart();
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  if (items.length === 0) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">            <div className="text-center py-16">
              <div className="bg-gray-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <ShoppingBag size={48} className="text-gray-400" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Sepetiniz Boş
              </h1>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Henüz sepetinize ürün eklemediniz. Kaliteli kardiyoloji ürünlerimizi keşfetmek için mağazamızı ziyaret edin.
              </p>
              <div className="space-y-4">
                <LinkButton
                  href="/products"
                  variant="primary"
                  size="lg"
                >
                  Ürünleri Keşfet
                </LinkButton>
                <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
                  <span className="flex items-center gap-2">
                    ✓ Ücretsiz Kargo
                  </span>
                  <span className="flex items-center gap-2">
                    ✓ Hızlı Teslimat
                  </span>
                  <span className="flex items-center gap-2">
                    ✓ Güvenli Ödeme
                  </span>
                </div>
              </div>
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
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="lg:w-2/3">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Sepetim ({items.length} ürün)
                  </h1>                  <Button
                    onClick={handleClearCart}
                    variant="danger"
                    size="sm"
                  >
                    Sepeti Temizle
                  </Button>
                </div>

                <div className="space-y-4">                  {items.map((item) => (
                    <div key={`${item._id}-${item.size}`} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        {item.size && (
                          <p className="text-sm text-gray-600">Boyut: {item.size}</p>
                        )}
                        <p className="text-lg font-bold text-[#70BB1B]">
                          {formatPrice(item.price)}
                        </p>
                      </div>

                      {/* Quantity Controls */}                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                          variant="ghost"
                          size="sm"
                          className="p-1 rounded-full hover:bg-gray-100"
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={16} className={item.quantity <= 1 ? 'text-gray-400' : 'text-gray-600'} />
                        </Button>
                        
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        
                        <Button
                          onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                          variant="ghost"
                          size="sm"
                          className="p-1 rounded-full hover:bg-gray-100"
                        >
                          <Plus size={16} className="text-gray-600" />
                        </Button>
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>                      {/* Remove Button */}
                      <Button
                        onClick={() => handleRemoveItem(item._id)}
                        variant="ghost"
                        size="sm"
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Sipariş Özeti
                </h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ara Toplam</span>
                    <span className="font-medium">{formatPrice(getTotalPrice())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kargo</span>
                    <span className="font-medium text-green-600">Ücretsiz</span>
                  </div>
                  <hr />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Toplam</span>
                    <span className="text-[#70BB1B]">{formatPrice(getTotalPrice())}</span>
                  </div>
                </div>                <div className="space-y-3">
                  <LinkButton
                    href="/checkout"
                    variant="primary"
                    size="lg"
                    className="w-full"
                  >
                    Sipariş Ver
                  </LinkButton>
                  <LinkButton
                    href="/products"
                    variant="outline"
                    size="lg"
                    className="w-full"
                  >
                    Alışverişe Devam Et
                  </LinkButton>
                </div>

                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    🚚 150 TL ve üzeri siparişlerde ücretsiz kargo!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
