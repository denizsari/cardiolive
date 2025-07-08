import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductDetailClient from './ProductDetailClient';

// This would typically come from your API
async function getProduct(slug: string) {
  // Simulated product data
  const products = [
    {
      id: '1',
      name: 'Premium Soğuk Sıkım Zeytinyağı 500ml',
      slug: 'premium-soguk-sikim-zeytinyagi-500ml',
      price: '₺89,90',
      originalPrice: '₺99,90',
      image: '/images/products/olive-oil-500ml.jpg',
      images: [
        '/images/products/olive-oil-500ml.jpg',
        '/images/products/olive-oil-500ml-2.jpg',
        '/images/products/olive-oil-500ml-3.jpg'
      ],
      description: 'Ege\'nin bereketli topraklarından özenle hasat edilen zeytinlerden elde edilen premium kalite soğuk sıkım zeytinyağı.',
      longDescription: `
        Kardiyolive Premium Soğuk Sıkım Zeytinyağı, Ege bölgesinin en kaliteli zeytinlerinden özel soğuk sıkım yöntemiyle üretilmektedir. 
        
        18°C altında işlenen zeytinlerimiz, tüm doğal vitaminlerini ve antioksidanlarını korur. Her damla, doğanın saf tadını sofranıza getirir.
        
        Özellikler:
        • %100 Doğal ve Organik
        • Soğuk Sıkım Teknolojisi
        • Antioksidan Açısından Zengin
        • Kimyasal Katkı İçermez
        • Cam Şişede Korunmuş Kalite
      `,
      category: 'Zeytinyağı',
      stock: 45,
      rating: 4.8,
      reviewCount: 127,
      features: [
        'Soğuk sıkım yöntemiyle üretilmiştir',
        'Antioksidan açısından zengindir',
        '%100 doğal ve katkısızdır',
        'Cam şişede uzun ömürlüdür'
      ],
      nutritionInfo: {
        energy: '884 kcal',
        fat: '100g',
        saturatedFat: '14g',
        carbs: '0g',
        protein: '0g',
        vitaminE: '14mg'
      }
    },
    // Add more products as needed
  ];

  return products.find(product => product.slug === slug);
}

async function getAllProducts() {
  // Return the same product data for static generation
  return [
    {
      id: '1',
      name: 'Premium Soğuk Sıkım Zeytinyağı 500ml',
      slug: 'premium-soguk-sikim-zeytinyagi-500ml',
      price: '₺89,90',
      originalPrice: '₺99,90',
      image: '/images/products/olive-oil-500ml.jpg',
      images: [
        '/images/products/olive-oil-500ml.jpg',
        '/images/products/olive-oil-500ml-2.jpg',
        '/images/products/olive-oil-500ml-3.jpg'
      ],
      description: 'Ege\'nin bereketli topraklarından özenle hasat edilen zeytinlerden elde edilen premium kalite soğuk sıkım zeytinyağı.',
      longDescription: `
        Kardiyolive Premium Soğuk Sıkım Zeytinyağı, Ege bölgesinin en kaliteli zeytinlerinden özel soğuk sıkım yöntemiyle üretilmektedir. 
        
        18°C altında işlenen zeytinlerimiz, tüm doğal vitaminlerini ve antioksidanlarını korur. Her damla, doğanın saf tadını sofranıza getirir.
        
        Özellikler:
        • %100 Doğal ve Organik
        • Soğuk Sıkım Teknolojisi
        • Antioksidan Açısından Zengin
        • Kimyasal Katkı İçermez
        • Cam Şişede Korunmuş Kalite
      `,
      category: 'Zeytinyağı',
      stock: 45,
      rating: 4.8,
      reviewCount: 127,
      features: [
        'Soğuk sıkım yöntemiyle üretilmiştir',
        'Antioksidan açısından zengindir',
        '%100 doğal ve katkısızdır',
        'Cam şişede uzun ömürlüdür'
      ],
      nutritionInfo: {
        energy: '884 kcal',
        fat: '100g',
        saturatedFat: '14g',
        carbs: '0g',
        protein: '0g',
        vitaminE: '14mg'
      }
    },
    // Add more products as needed
  ];
}

// Generate static params for all products
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const products = await getAllProducts();
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProduct(params.slug);
  
  if (!product) {
    return {
      title: 'Ürün Bulunamadı'
    };
  }

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [product.image],
    },
  };
}

export default async function ProductDetail({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}