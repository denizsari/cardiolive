'use client';

export const dynamic = 'force-dynamic';

import React, { Suspense } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ProductImage } from '../components/ui/OptimizedImage';
import { useCart } from '../contexts/CartContext';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import Button, { LinkButton } from '../components/ui/Button';
import CartPageClient from './CartPageClient';
import OrderDisabledNotice from '../components/OrderDisabledNotice';

export default function CartPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Alışveriş Sepeti</h1>
        
        {/* Order Disabled Notice */}
        <OrderDisabledNotice variant="banner" className="mb-8" />
        
        <Suspense fallback={<div>Loading...</div>}>
          <CartPageClient />
        </Suspense>
      </div>
    </div>
  );
}
