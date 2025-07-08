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


const images = [
  {
    url: '/images/gallery/771A9890.JPG',
    title: 'Premium Zeytinyağı',
    description: 'Doğanın en saf halinde, özenle üretilen premium kalite zeytinyağları'
  },
  {
    url: '/images/gallery/771A9891.JPG',
    title: 'Geleneksel Üretim',
    description: 'Nesiller boyu süren geleneksel yöntemlerle işlenen doğal ürünler'
  },
  {
    url: '/images/gallery/771A9892.JPG',
    title: 'Kalite Garantisi',
    description: 'Her damla kalitesiyle Kardiyolive güvencesi taşıyan ürünler'
  },
];

export default function Home() {
  const router = useRouter();
  const isClient = useIsClient();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Auto-advance slider
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isTransitioning) {
        setCurrentSlide((prev) => (prev + 1) % images.length);
      }
    }, 7000); // 7 saniyede bir geçiş

    return () => clearInterval(interval);
  }, [isTransitioning]);

  const goToSlide = (index: number) => {
    if (!isTransitioning && index !== currentSlide) {
      setIsTransitioning(true);
      setCurrentSlide(index);
      setTimeout(() => setIsTransitioning(false), 1000);
    }
  };

  const handleProductsClick = () => {
    console.log('Navigating to products page...');
    router.push('/products');
  };

  const handleAboutClick = () => {
    console.log('Navigating to about page...');
    router.push('/about');
  };

  // SEO ve Analytics için structured data injection
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
      },
    };

    // Structured data'yı head'e ekleme
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
        }
        metaKeywords.setAttribute('content', 'zeytinyağı, organik, doğal, kardiyolive, zeytin, premium, kalite, sızma, soğuk sıkım, ege, türkiye');
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
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => {
                    console.log('🟢 PRODUCTS BUTTON CLICKED - Going to /products page');
                    handleProductsClick();
                  }}
                  onMouseEnter={() => console.log('Products button hover')}
                  className="text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 text-lg transform hover:scale-105 shadow-lg cursor-pointer"
                  style={{ 
                    zIndex: 100,
                    backgroundColor: 'var(--primary-green)',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--primary-green-hover)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--primary-green)';
                  }}
                >
                  Ürünleri İncele
                </button>
                <button 
                  onClick={() => {
                    console.log('🔵 ABOUT BUTTON CLICKED - Going to /about page');
                    handleAboutClick();
                  }}
                  onMouseEnter={() => console.log('About button hover')}
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 text-lg transform hover:scale-105 backdrop-blur-sm cursor-pointer"
                  style={{ 
                    zIndex: 100,
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.color = 'var(--primary-green)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'white';
                  }}
                >
                  Hakkımızda
                </button>
              </div>
            </div>
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



        {/* Features Section */}
        <section className="py-16" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--neutral-800)' }}>
                Neden Kardiyolive?
              </h2>
              <p className="max-w-2xl mx-auto" style={{ color: 'var(--neutral-600)' }}>
                Premium kaliteli ürünlerimizle sağlıklı yaşamınıza katkı sağlıyoruz
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--bg-accent)' }}>
                  <span className="text-2xl">🫒</span>
                </div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--neutral-800)' }}>%100 Doğal</h3>
                <p style={{ color: 'var(--neutral-600)' }}>
                  Kimyasal katkı maddesi içermeyen, tamamen doğal ürünler
                </p>
              </div>

              <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--bg-accent)' }}>
                  <span className="text-2xl">🥇</span>
                </div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--neutral-800)' }}>Premium Kalite</h3>
                <p style={{ color: 'var(--neutral-600)' }}>
                  En yüksek kalite standartlarında üretilmiş ürünler
                </p>
              </div>

              <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--bg-accent)' }}>
                  <span className="text-2xl">🚚</span>
                </div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--neutral-800)' }}>Hızlı Teslimat</h3>
                <p style={{ color: 'var(--neutral-600)' }}>
                  WhatsApp üzerinden sipariş, hızlı kargo ile kapınızda
                </p>
              </div>
            </div>
          </div>
        </section>


      </main>
      <Footer />
    </>
  );
}
