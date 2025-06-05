'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Heart, ShoppingCart, Trash2, X, LoaderIcon } from 'lucide-react';
import { ProductImage } from '../components/ui/OptimizedImage';
import Link from 'next/link';
import { wishlistAPI } from '../utils/api';
import { WishlistItem } from '@/types';
import Button, { LinkButton } from '../components/ui/Button';
import { WishlistItemSkeleton } from '../components/ui/Skeleton';
import { useToast } from '../components/ui/Toast';

export const dynamic = 'force-dynamic';

export default function WishlistPage() {
  const { isLoggedIn } = useAuth();
  const { addToast } = useToast();
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
    setActionLoading(prev => ({ ...prev, [productId]: true }));    try {
      await wishlistAPI.removeFromWishlist(productId);
      setWishlistItems(prev => prev.filter(item => item.product._id !== productId));
      setSelectedItems(prev => prev.filter(id => id !== productId));
      addToast({ type: 'success', title: 'Ürün favorilerden çıkarıldı' });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      addToast({ type: 'error', title: 'Ürün favorilerden çıkarılırken bir hata oluştu' });
    } finally {
      setActionLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  const clearWishlist = async () => {
    const userConfirmed = window.confirm('Tüm favori ürünleri silmek istediğinizden emin misiniz?');

    if (!userConfirmed) {
      return;
    }

    setLoading(true);    try {
      await wishlistAPI.clearWishlist();
      setWishlistItems([]);
      setSelectedItems([]);
      addToast({ type: 'success', title: 'Tüm favoriler temizlendi' });
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      addToast({ type: 'error', title: 'Favoriler temizlenirken bir hata oluştu' });
    } finally {
      setLoading(false);
    }
  };
  const removeSelected = async () => {
    if (selectedItems.length === 0) {
      addToast({ type: 'warning', title: 'Lütfen silmek istediğiniz ürünleri seçin' });
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
      addToast({ type: 'success', title: `${selectedItems.length} ürün favorilerden çıkarıldı` });
    } catch (error) {
      console.error('Error removing selected items:', error);
      addToast({ type: 'error', title: 'Seçili ürünler çıkarılırken bir hata oluştu' });
    } finally {
      setActionLoading(prev => ({ ...prev, removeSelected: false }));
    }
  };  const moveToCart = async () => {
    if (selectedItems.length === 0) {
      addToast({ type: 'warning', title: 'Lütfen sepete taşımak istediğiniz ürünleri seçin' });
      return;
    }

    setActionLoading(prev => ({ ...prev, moveToCart: true }));
    try {
      // First add items to cart (this would require cart API integration)
      // For now, just remove from wishlist as moveToCart API doesn't exist
      await Promise.all(selectedItems.map(productId => wishlistAPI.removeFromWishlist(productId)));
      setWishlistItems(prev => prev.filter(item => !selectedItems.includes(item.product._id)));
      setSelectedItems([]);
      addToast({ 
        type: 'info', 
        title: `${selectedItems.length} ürün favorilerden kaldırıldı`, 
        description: 'Manuel olarak sepete ekleyebilirsiniz' 
      });
    } catch (error) {
      console.error('Error processing selected items:', error);
      addToast({ type: 'error', title: 'Ürünler işlenirken bir hata oluştu' });
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm">
            {/* Header Skeleton */}
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="flex space-x-2">
                  <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
            
            {/* Content Skeleton */}
            <div className="p-6">
              <div className="grid gap-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <WishlistItemSkeleton key={index} />
                ))}
              </div>
            </div>
          </div>
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
              
              {wishlistItems.length > 0 && (                <div className="flex items-center space-x-3">
                  <Button
                    onClick={selectAllItems}
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {selectedItems.length === wishlistItems.length ? 'Tümünü Kaldır' : 'Tümünü Seç'}
                  </Button>
                  <Button
                    onClick={clearWishlist}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-800"
                  >
                    Tümünü Sil
                  </Button>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {selectedItems.length > 0 && (
              <div className="mt-4 flex items-center space-x-3">                <Button
                  onClick={moveToCart}
                  disabled={actionLoading.moveToCart}
                  loading={actionLoading.moveToCart}
                  variant="primary"
                  size="md"
                  className="flex items-center space-x-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Sepete Taşı ({selectedItems.length})</span>
                </Button>
                
                <Button
                  onClick={removeSelected}
                  disabled={actionLoading.removeSelected}
                  loading={actionLoading.removeSelected}
                  variant="danger"
                  size="md"
                  className="flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Seçilenleri Sil</span>
                </Button>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6">            {wishlistItems.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-red-50 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <Heart className="w-12 h-12 text-red-300" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Henüz favori ürününüz yok
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Beğendiğiniz ürünleri favorilere ekleyerek buradan kolayca ulaşabilir ve takip edebilirsiniz.
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
                      ❤️ Kalp ikonuyla favori ekle
                    </span>
                    <span className="flex items-center gap-2">
                      🔔 Fiyat değişikliklerini takip et
                    </span>
                  </div>
                </div>
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
                    </div>                    {/* Remove Button */}
                    <Button
                      onClick={() => removeFromWishlist(item.product._id)}
                      disabled={actionLoading[item.product._id]}
                      variant="ghost"
                      size="sm"
                      className="absolute top-3 right-3 z-10 p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"
                    >
                      {actionLoading[item.product._id] ? (
                        <LoaderIcon className="w-4 h-4 animate-spin text-gray-600" />
                      ) : (
                        <X className="w-4 h-4 text-gray-600 hover:text-red-500" />
                      )}
                    </Button>                    {/* Product Image */}
                    <div className="relative aspect-square">
                      <ProductImage
                        src={item.product.images?.[0] || '/placeholder-product.jpg'}
                        alt={item.product.name}
                        className="object-cover w-full h-full"
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
