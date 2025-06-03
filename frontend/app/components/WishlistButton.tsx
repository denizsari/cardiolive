'use client';

import { useState, useEffect, useCallback } from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { wishlistAPI } from '../utils/api';
import Button from './ui/Button';

interface WishlistButtonProps {
  productId: string;
  className?: string;
  size?: number;
}

export default function WishlistButton({ 
  productId, 
  className = '', 
  size = 24 
}: WishlistButtonProps) {
  const { isLoggedIn } = useAuth();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);  const checkWishlistStatus = useCallback(async () => {
    if (!isLoggedIn) return;
    
    // Skip check if productId is not a valid ObjectId format
    if (!productId || productId === 'default' || productId.length !== 24) {
      return;
    }
      try {
      const result = await wishlistAPI.checkWishlistStatus(productId);
      setIsInWishlist(result.inWishlist);
    } catch (error) {
      console.error('Error checking wishlist status:', error);
      // If it's an authentication error, don't show the error to user
      if (error instanceof Error && error.message.includes('token')) {
        console.log('Authentication issue, user may need to re-login');
        return;
      }
    }
  }, [productId, isLoggedIn]);

  useEffect(() => {
    checkWishlistStatus();
  }, [checkWishlistStatus]);
  const toggleWishlist = async () => {
    if (!isLoggedIn) {
      alert('Favori listesine eklemek için giriş yapmanız gerekiyor.');
      return;
    }

    // Skip action if productId is not a valid ObjectId format
    if (!productId || productId === 'default' || productId.length !== 24) {
      alert('Bu ürün için favori listesi özelliği kullanılamıyor.');
      return;
    }

    setLoading(true);
    try {
      if (isInWishlist) {
        await wishlistAPI.removeFromWishlist(productId);
        setIsInWishlist(false);
      } else {
        await wishlistAPI.addToWishlist(productId);
        setIsInWishlist(true);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      alert('İşlem sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <Button
      onClick={toggleWishlist}
      disabled={loading}
      variant="ghost"
      size="sm"
      className={`transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        isInWishlist
          ? 'text-red-500 hover:text-red-600'
          : 'text-gray-400 hover:text-red-500'
      } ${className}`}
      title={isInWishlist ? 'Favorilerden çıkar' : 'Favorilere ekle'}
    >
      <Heart
        size={size}
        className={isInWishlist ? 'fill-current' : ''}
      />
    </Button>
  );
}
