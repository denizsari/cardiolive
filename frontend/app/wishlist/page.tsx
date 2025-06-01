'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Heart, ShoppingCart, Trash2, X, LoaderIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { wishlistAPI } from '../utils/api';
import { WishlistItem } from '@/types';

export const dynamic = 'force-dynamic';

export default function WishlistPage() {
  const { isLoggedIn } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);
      const result = await wishlistAPI.getWishlist();
      setWishlistItems(result || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchWishlist();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn, fetchWishlist]);

  const removeFromWishlist = async (productId: string) => {
    setActionLoading(prev => ({ ...prev, [productId]: true }));
    try {
      await wishlistAPI.removeFromWishlist(productId);
      setWishlistItems(prev => prev.filter(item => item.product._id !== productId));
      setSelectedItems(prev => prev.filter(id => id !== productId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      alert('Ürün favorilerden çıkarılırken bir hata oluştu.');
    } finally {
      setActionLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  const clearWishlist = async () => {
    if (!confirm('Tüm favori ürünleri silmek istediğinizden emin misiniz?')) {
      return;
    }

    setLoading(true);
    try {
      await wishlistAPI.clearWishlist();
      setWishlistItems([]);
      setSelectedItems([]);
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      alert('Favoriler temizlenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const removeSelected = async () => {
    if (selectedItems.length === 0) {
      alert('Lütfen silmek istediğiniz ürünleri seçin.');
      return;
    }

    if (!confirm(`Seçili ${selectedItems.length} ürünü favorilerden çıkarmak istediğinizden emin misiniz?`)) {
      return;
    }

    setActionLoading(prev => ({ ...prev, removeSelected: true }));
    try {
      await Promise.all(selectedItems.map(productId => wishlistAPI.removeFromWishlist(productId)));
      setWishlistItems(prev => prev.filter(item => !selectedItems.includes(item.product._id)));
      setSelectedItems([]);
    } catch (error) {
      console.error('Error removing selected items:', error);
      alert('Seçili ürünler çıkarılırken bir hata oluştu.');
    } finally {
      setActionLoading(prev => ({ ...prev, removeSelected: false }));
    }
  };
  const moveToCart = async () => {
    if (selectedItems.length === 0) {
      alert('Lütfen sepete taşımak istediğiniz ürünleri seçin.');
      return;
    }

    setActionLoading(prev => ({ ...prev, moveToCart: true }));
    try {
      // First add items to cart (this would require cart API integration)
      // For now, just remove from wishlist as moveToCart API doesn't exist
      await Promise.all(selectedItems.map(productId => wishlistAPI.removeFromWishlist(productId)));
      setWishlistItems(prev => prev.filter(item => !selectedItems.includes(item.product._id)));
      setSelectedItems([]);
      alert(`${selectedItems.length} ürün favorilerden kaldırıldı. Manuel olarak sepete ekleyebilirsiniz.`);
    } catch (error) {
      console.error('Error processing selected items:', error);
      alert('Ürünler işlenirken bir hata oluştu.');
    } finally {
      setActionLoading(prev => ({ ...prev, moveToCart: false }));
    }
  };

  const toggleSelectItem = (productId: string) => {
    setSelectedItems(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const selectAllItems = () => {
    if (selectedItems.length === wishlistItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(wishlistItems.map(item => item.product._id));
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
      day: 'numeric'
    });
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md mx-4">
          <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Giriş Yapın</h2>
          <p className="text-gray-600 mb-6">
            Favori ürünlerinizi görüntülemek için lütfen giriş yapın.
          </p>
          <Link 
            href="/login"
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Giriş Yap
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoaderIcon className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-600">Favoriler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Header */}
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Heart className="w-6 h-6 text-red-500" />
                <h1 className="text-2xl font-bold text-gray-900">
                  Favori Ürünlerim ({wishlistItems.length})
                </h1>
              </div>
              
              {wishlistItems.length > 0 && (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={selectAllItems}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {selectedItems.length === wishlistItems.length ? 'Tümünü Kaldır' : 'Tümünü Seç'}
                  </button>
                  <button
                    onClick={clearWishlist}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Tümünü Sil
                  </button>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {selectedItems.length > 0 && (
              <div className="mt-4 flex items-center space-x-3">
                <button
                  onClick={moveToCart}
                  disabled={actionLoading.moveToCart}
                  className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
                >
                  {actionLoading.moveToCart ? (
                    <LoaderIcon className="w-4 h-4 animate-spin" />
                  ) : (
                    <ShoppingCart className="w-4 h-4" />
                  )}
                  <span>Sepete Taşı ({selectedItems.length})</span>
                </button>
                
                <button
                  onClick={removeSelected}
                  disabled={actionLoading.removeSelected}
                  className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {actionLoading.removeSelected ? (
                    <LoaderIcon className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  <span>Seçilenleri Sil</span>
                </button>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {wishlistItems.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="w-24 h-24 mx-auto mb-6 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-700 mb-3">
                  Henüz favori ürününüz yok
                </h3>
                <p className="text-gray-500 mb-6">
                  Beğendiğiniz ürünleri favorilere ekleyerek buradan kolayca ulaşabilirsiniz.
                </p>
                <Link 
                  href="/products"
                  className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors inline-block"
                >
                  Ürünleri Keşfet
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {wishlistItems.map((item) => (
                  <div key={item._id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow relative">
                    {/* Selection Checkbox */}
                    <div className="absolute top-3 left-3 z-10">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.product._id)}
                        onChange={() => toggleSelectItem(item.product._id)}
                        className="w-4 h-4 text-primary bg-white border-2 border-gray-300 rounded focus:ring-primary focus:ring-2"
                      />
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromWishlist(item.product._id)}
                      disabled={actionLoading[item.product._id]}
                      className="absolute top-3 right-3 z-10 p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"
                    >
                      {actionLoading[item.product._id] ? (
                        <LoaderIcon className="w-4 h-4 animate-spin text-gray-600" />
                      ) : (
                        <X className="w-4 h-4 text-gray-600 hover:text-red-500" />
                      )}
                    </button>

                    {/* Product Image */}
                    <div className="relative aspect-square">
                      <Image
                        src={item.product.images?.[0] || '/placeholder-product.jpg'}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <Link href={`/products/${item.product._id}`}>
                        <h3 className="font-semibold text-gray-900 mb-2 hover:text-primary transition-colors line-clamp-2">
                          {item.product.name}
                        </h3>
                      </Link>
                      
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-bold text-primary">
                          {formatPrice(item.product.price)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {item.product.category}
                        </span>
                      </div>

                      <div className="text-xs text-gray-500 mb-3">
                        Eklenme: {formatDate(item.addedAt)}
                      </div>

                      {/* Stock Status */}
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          item.product.stock > 0 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>                          {item.product.stock > 0 ? 'Stokta' : 'Stok Yok'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
