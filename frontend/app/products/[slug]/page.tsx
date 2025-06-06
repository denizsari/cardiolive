'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Minus, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Header from '../../components/Header';
import ReviewsSection from '../../components/ReviewsSection';
import WishlistButton from '../../components/WishlistButton';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../contexts/CartContext';
import Button from '../../components/ui/Button';

// Bu veriyi normalde API'den alacağız
const product = {
  name: 'Naturel Sızma Zeytinyağı',
  price: '349.90',
  description: 'Erken hasat zeytinlerden elde edilen, soğuk sıkım naturel sızma zeytinyağı. Kendine has meyvemsi aroması ve düşük asit oranı ile sofranızın vazgeçilmezi olacak.',
  features: [
    'Soğuk sıkım',
    'Erken hasat',
    'Düşük asit oranı',
    'Meyvemsi aroma',
    'Ege bölgesi zeytinleri'
  ],
  images: [
    '/products/product1.jpg',
    '/products/product1-detail1.jpg',
    '/products/product1-detail2.jpg'
  ],
  sizes: [
    { value: '250ml', price: '349.90' },
    { value: '500ml', price: '649.90' },
    { value: '1000ml', price: '1199.90' }
  ]
};

export default function ProductDetail({ params }: { params: Promise<{ slug: string }> }) {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { isLoggedIn, token } = useAuth();
  const { addItem } = useCart();
  const [resolvedParams, setResolvedParams] = useState<{ slug: string } | null>(null);

  useEffect(() => {
    params.then(resolvedParams => {
      setResolvedParams(resolvedParams);
    });
  }, [params]);
  useEffect(() => {
    // Modern Next.js için params'ı handle et
    const resolveParams = async () => {
      const resolved = await Promise.resolve(params);
      setResolvedParams(resolved);
    };
    resolveParams();
  }, [params]);
  const handleAddToCart = () => {
    // Hard-coded product data'yı cart'a ekle
    addItem({
      _id: resolvedParams?.slug || 'default',
      name: product.name,
      price: Number(selectedSize.price),
      image: product.images[0],
      size: selectedSize.value
    }, quantity);
    
    // User feedback için bir toast notification eklenebilir
    toast.success(`${product.name} (${selectedSize.value}) sepete eklendi!`);
  };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'var(--font-inter)' }}>
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Sol: Ürün Görselleri */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-lg overflow-hidden">
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">              {product.images.map((image, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className={`relative aspect-square rounded-lg overflow-hidden p-0 ${
                    selectedImage === index ? 'ring-2 ring-[#70BB1B]' : ''
                  }`}
                  onClick={() => setSelectedImage(index)}
                >
                  <Image
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </Button>
              ))}
            </div>
          </div>

          {/* Sağ: Ürün Bilgileri */}
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-2xl font-bold text-[#70BB1B]">{selectedSize.price} TL</p>
            <p className="text-gray-600">{product.description}</p>

            {/* Özellikler */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Özellikler</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                {product.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>

            {/* Boyut Seçimi */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Boyut Seçimi</h3>              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size) => (
                  <Button
                    key={size.value}
                    variant="outline"
                    className={`px-4 py-2 rounded-full border-2 ${
                      selectedSize.value === size.value
                        ? 'border-[#70BB1B] text-[#70BB1B]'
                        : 'border-gray-300 text-gray-600 hover:border-[#70BB1B] hover:text-[#70BB1B]'
                    }`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size.value}
                  </Button>
                ))}
              </div>
            </div>

            {/* Miktar ve Sepete Ekle */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">                <div className="flex items-center border-2 border-[#70BB1B] rounded-full">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 text-[#70BB1B]"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus size={20} />
                  </Button>                  <span className="w-12 text-center text-[#70BB1B]">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 text-[#70BB1B]"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus size={20} />
                  </Button>                </div>                
                <Button 
                  className="flex-1 bg-[#70BB1B] text-white py-3 px-8 rounded-full hover:bg-opacity-90 transition-colors"
                  onClick={handleAddToCart}
                >
                  Sepete Ekle
                </Button><WishlistButton 
                  productId={resolvedParams?.slug || 'default'}
                  className="p-3 border-2 border-gray-300 rounded-full hover:border-[#70BB1B] transition-colors"
                  size={24}
                />
              </div>            </div>
          </div>
        </div>

        {/* Reviews Section */}        <div className="mt-16">          <ReviewsSection
            productId={resolvedParams?.slug || 'default'} // Using slug as productId for now
            isLoggedIn={isLoggedIn}
            userToken={token || undefined}
          />
        </div>
      </main>
    </div>
  );
}