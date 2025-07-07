'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useIsClient, safeDocument } from '@/utils/ssr';
import Header from './components/Header';
import AboutPreview from './components/sections/AboutPreview';
import FeaturedProducts from './components/sections/FeaturedProducts';
import FAQ from './components/sections/FAQ';
import BlogPreview from './components/sections/BlogPreview';
import Testimonials from './components/sections/Testimonials';
import Footer from './components/Footer';
import KardiyoliveGallery from './components/KardiyoliveGallery';
import OrderDisabledNotice from './components/OrderDisabledNotice';

const images = [
  {
    url: '/slider/image1.jpg',
    title: 'Premium Zeytinyağı',
    description: 'Doğanın en saf halinde, özenle üretilen premium kalite zeytinyağları'
  },
  {
    url: '/slider/image2.jpg',
    title: 'Geleneksel Üretim',
    description: 'Nesiller boyu süren geleneksel yöntemlerle işlenen doğal ürünler'
  },
  {
    url: '/slider/image3.jpg',
    title: 'Kalite Garantisi',
    description: 'Her damla kalitesiyle Kardiyolive güvencesi taşıyan ürünler'
  },
];

export default function Home() {
  const router = useRouter();
  const isClient = useIsClient();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);// Auto-advance slider
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isTransitioning) {
        setCurrentSlide((prev) => (prev + 1) % images.length);
      }
    }, 7000); // 7 saniyede bir geçiş

    return () => clearInterval(interval);
  }, [isTransitioning]);
  const nextSlide = () => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrentSlide((prev) => (prev + 1) % images.length);
      setTimeout(() => setIsTransitioning(false), 1000);
    }
  };

  const prevSlide = () => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
      setTimeout(() => setIsTransitioning(false), 1000);
    }
  };
  const goToSlide = (index: number) => {
    if (!isTransitioning && index !== currentSlide) {
      setIsTransitioning(true);
      setCurrentSlide(index);
      setTimeout(() => setIsTransitioning(false), 1000);
    }
  };  const handleProductsClick = () => {
    console.log('Navigating to products page...');
    router.push('/products');
  };

  const handleAboutClick = () => {
    console.log('Navigating to about page...');
    router.push('/about');
  };  // SEO ve Analytics için structured data injection
  useEffect(() => {
    if (!isClient) return;

    // Organization structured data
    const organizationData = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Kardiyolive',
      url: 'https://kardiyolive.com',
      logo: 'https://kardiyolive.com/logo.png',
      description: 'Premium zeytinyağı ve doğal ürünler üreticisi',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'TR',
        addressRegion: 'İzmir',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+90-XXX-XXX-XXXX',
        contactType: 'customer service',
        availableLanguage: 'Turkish',
      },
    };

    // WebSite structured data
    const websiteData = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Kardiyolive',
      url: 'https://kardiyolive.com',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://kardiyolive.com/products?search={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },    };    // Structured data'yı head'e ekleme
    const addStructuredData = (data: Record<string, unknown>, id: string) => {
      safeDocument((document) => {
        const existingScript = document.getElementById(id);
        if (existingScript) {
          existingScript.remove();
        }
        
        const script = document.createElement('script');
        script.id = id;
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(data);
        document.head.appendChild(script);
      });
    };

    if (isClient) {
      addStructuredData(organizationData, 'organization-schema');
      addStructuredData(websiteData, 'website-schema');
    }

    // Meta description ve keywords güncelleme
    const updateMetaTags = () => {
      safeDocument((document) => {
        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
          metaDescription = document.createElement('meta');
          metaDescription.setAttribute('name', 'description');
          document.head.appendChild(metaDescription);
        }
        metaDescription.setAttribute('content', 'Kardiyolive - Ege\'nin en kaliteli zeytinlerinden elde edilen organik zeytinyağları ve doğal ürünler. Premium kalite, doğal lezzet, hızlı teslimat.');

        let metaKeywords = document.querySelector('meta[name="keywords"]');
        if (!metaKeywords) {
          metaKeywords = document.createElement('meta');
          metaKeywords.setAttribute('name', 'keywords');
          document.head.appendChild(metaKeywords);
        }        metaKeywords.setAttribute('content', 'zeytinyağı, organik, doğal, kardiyolive, zeytin, premium, kalite, sızma, soğuk sıkım, ege, türkiye');
      });
    };

    if (isClient) {
      updateMetaTags();
    }
  }, [isClient]);
  return (
    <>
      <main className="min-h-screen bg-white">
        <Header />
        
        {/* Hero Slider - CSS Grid with Background Image */}
        <section 
          className="relative h-screen overflow-hidden"
        >
          {/* Background image layer */}
          <div 
            className="absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out"
            style={{
              backgroundImage: `url(${images[currentSlide].url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              zIndex: 1
            }}
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/40" style={{ zIndex: 2 }} />
          
          {/* Content */}
          <div className="absolute inset-0 flex items-center justify-center px-4" style={{ zIndex: 10 }}>
            <div className="text-center text-white max-w-4xl">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 drop-shadow-lg">
                {images[currentSlide].title}
              </h1>
              <p className="text-xl md:text-2xl mb-8 drop-shadow-md">
                {images[currentSlide].description}
              </p>              <div className="flex flex-col sm:flex-row gap-4 justify-center">                <button 
                  onClick={() => {
                    console.log('🟢 PRODUCTS BUTTON CLICKED - Going to /products page');
                    handleProductsClick();
                  }}
                  onMouseEnter={() => console.log('Products button hover')}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 text-lg transform hover:scale-105 shadow-lg cursor-pointer"
                  style={{ zIndex: 100 }}
                >
                  Ürünleri İncele
                </button>
                <button 
                  onClick={() => {
                    console.log('🔵 ABOUT BUTTON CLICKED - Going to /about page');
                    handleAboutClick();
                  }}
                  onMouseEnter={() => console.log('About button hover')}
                  className="border-2 border-white text-white hover:bg-white hover:text-green-600 px-8 py-4 rounded-lg font-semibold transition-all duration-300 text-lg transform hover:scale-105 backdrop-blur-sm cursor-pointer"
                  style={{ zIndex: 100 }}
                >
                  Hakkımızda
                </button>
              </div>
  
            </div>
          </div>          
          {/* Navigation - Prev/Next Arrows */}
          <div className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none" style={{ zIndex: 20 }}>
            <button 
              onClick={() => {
                console.log('◀️ PREV BUTTON CLICKED');
                prevSlide();
              }}
              className="w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl font-bold transition-all duration-300 pointer-events-auto"
            >
              ←
            </button>
            <button 
              onClick={() => {
                console.log('▶️ NEXT BUTTON CLICKED');
                nextSlide();
              }}
              className="w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl font-bold transition-all duration-300 pointer-events-auto"
            >
              →
            </button>
          </div>
          
          {/* Bottom controls - Slide indicators */}
          <div className="absolute bottom-8 left-0 right-0 flex items-end justify-center" style={{ zIndex: 20 }}>
            <div className="flex space-x-3">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    console.log(`🔴 DOT ${index + 1} CLICKED`);
                    goToSlide(index);
                  }}
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? 'bg-white scale-125' 
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                />
              ))}
            </div>
          </div>
          
          {/* Slide counter */}
          <div className="absolute top-4 right-4" style={{ zIndex: 20 }}>
            <div className="bg-black/30 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
              {currentSlide + 1} / {images.length}
            </div>
          </div>
        </section>

        {/* Diğer Bölümler */}
        <AboutPreview />
        <FeaturedProducts />
        <FAQ />
        <BlogPreview />
        <Testimonials />

        {/* Hero Section */}
        <section className="relative h-screen flex items-center justify-center">
          <KardiyoliveGallery />
          
          {/* Hero Content Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="text-center text-white px-4 max-w-4xl">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Premium Zeytinyağı ve Doğal Ürünler
              </h1>
              <p className="text-xl md:text-2xl mb-8 opacity-90">
                Ege'nin bereketli topraklarından sofranıza
              </p>
              
              {/* WhatsApp Order Notice */}
              <div className="max-w-md mx-auto">
                <OrderDisabledNotice variant="card" />
              </div>
            </div>
          </div>
        </section>

        {/* Order Notice Banner */}
        <section className="container mx-auto px-4 py-8">
          <OrderDisabledNotice variant="banner" />
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Neden Kardiyolive?
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Premium kaliteli ürünlerimizle sağlıklı yaşamınıza katkı sağlıyoruz
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🫒</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">%100 Doğal</h3>
                <p className="text-gray-600">
                  Kimyasal katkı maddesi içermeyen, tamamen doğal ürünler
                </p>
              </div>

              <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🥇</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Premium Kalite</h3>
                <p className="text-gray-600">
                  En yüksek kalite standartlarında üretilmiş ürünler
                </p>
              </div>

              <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🚚</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Hızlı Teslimat</h3>
                <p className="text-gray-600">
                  WhatsApp üzerinden sipariş, hızlı kargo ile kapınızda
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 bg-green-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Size Nasıl Yardımcı Olabiliriz?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              WhatsApp üzerinden 7/24 müşteri desteği
            </p>
            
            <div className="max-w-sm mx-auto">
              <OrderDisabledNotice 
                variant="card" 
                className="bg-white text-gray-800 border-0"
              />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
