'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { Minus, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Header from '../../components/Header';
import ReviewsSection from '../../components/ReviewsSection';
import OptimizedImage from '../../components/ui/OptimizedImage';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../contexts/CartContext';
import Button from '../../components/ui/Button';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Star, Heart, Truck, Shield, Award } from 'lucide-react';
import OrderDisabledNotice from '../../components/OrderDisabledNotice';

// Product type definition
interface Product {
  id: string;
  name: string;
  slug: string;
  price: string;
  originalPrice?: string;
  image: string;
  images: string[];
  description: string;
  longDescription: string;
  category: string;
  stock: number;
  rating: number;
  reviewCount: number;
  features: string[];
  nutritionInfo: {
    energy: string;
    fat: string;
    saturatedFat: string;
    carbs: string;
    protein: string;
    vitaminE: string;
  };
}

interface ProductDetailClientProps {
  product: Product;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { isLoggedIn, token } = useAuth();
  const { addItem } = useCart();

  const handleAddToCart = () => {
    // Hard-coded product data'yı cart'a ekle
    addItem({
      _id: product.id,
      name: product.name,
      price: Number(product.price.replace('₺', '').replace(',', '.')),
      image: product.images[0],
    }, quantity);
    
    // User feedback için bir toast notification eklenebilir
    toast.success(`${product.name} sepete eklendi!`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-700 mb-6">
          <Link href="/" className="hover:text-green-600">Ana Sayfa</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-green-600">Ürünler</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        {/* Back Button */}
        <Link 
          href="/products" 
          className="inline-flex items-center text-green-600 hover:text-green-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Ürünlere Geri Dön
        </Link>

        {/* Order Disabled Notice */}
        <OrderDisabledNotice variant="banner" className="mb-8" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square relative bg-white rounded-lg overflow-hidden shadow-lg">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
              {product.originalPrice && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
                  İndirim
                </div>
              )}
            </div>
            
            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-3 gap-2">
                {product.images.slice(1).map((image, index) => (
                  <div key={index} className="aspect-square relative bg-white rounded overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 2}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-gray-700 text-lg">{product.description}</p>
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-700 font-medium">
                {product.rating} ({product.reviewCount} değerlendirme)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-3">
              <span className="text-3xl font-bold text-green-600">{product.price}</span>
              {product.originalPrice && (
                <span className="text-xl text-gray-500 line-through">{product.originalPrice}</span>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700 font-medium">Stokta ({product.stock} adet)</span>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800">Ürün Özellikleri</h3>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div className="text-center">
                <Truck className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-gray-700 font-medium">Hızlı Kargo</p>
              </div>
              <div className="text-center">
                <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-gray-700 font-medium">Güvenli Ödeme</p>
              </div>
              <div className="text-center">
                <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-gray-700 font-medium">Kalite Garantisi</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Ürün Detayları</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Açıklama</h3>
                <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {product.longDescription}
                </div>
              </div>

              {/* Nutrition Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Beslenme Değerleri (100g)</h3>
                <table className="w-full text-sm">
                  <tbody className="space-y-2">
                    <tr className="border-b border-gray-100">
                      <td className="py-2 text-gray-700">Enerji</td>
                      <td className="py-2 text-right font-medium text-gray-900">{product.nutritionInfo.energy}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 text-gray-700">Yağ</td>
                      <td className="py-2 text-right font-medium text-gray-900">{product.nutritionInfo.fat}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 text-gray-700">Doymuş Yağ</td>
                      <td className="py-2 text-right font-medium text-gray-900">{product.nutritionInfo.saturatedFat}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 text-gray-700">Karbonhidrat</td>
                      <td className="py-2 text-right font-medium text-gray-900">{product.nutritionInfo.carbs}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2 text-gray-700">Protein</td>
                      <td className="py-2 text-right font-medium text-gray-900">{product.nutritionInfo.protein}</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-gray-700">Vitamin E</td>
                      <td className="py-2 text-right font-medium text-gray-900">{product.nutritionInfo.vitaminE}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 