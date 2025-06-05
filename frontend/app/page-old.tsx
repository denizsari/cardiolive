'use client';

export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import Header from './components/Header';
import AboutPreview from './components/sections/AboutPreview';
import FeaturedProducts from './components/sections/FeaturedProducts';
import FAQ from './components/sections/FAQ';
import BlogPreview from './components/sections/BlogPreview';
import Testimonials from './components/sections/Testimonials';
import Footer from './components/Footer';

// Swiper stilleri
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

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
  // Debug: Log image paths on component mount
  useEffect(() => {
    console.log('🖼️ Slider images configuration:');
    images.forEach((image, index) => {
      console.log(`Image ${index + 1}: ${image.url}`);
    });
  }, []);

  // SEO ve Analytics için structured data injection
  useEffect(() => {
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
    };    // Structured data'yı head'e ekleme
    const addStructuredData = (data: Record<string, unknown>, id: string) => {
      const existingScript = document.getElementById(id);
      if (existingScript) {
        existingScript.remove();
      }
      
      const script = document.createElement('script');
      script.id = id;
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(data);
      document.head.appendChild(script);
    };

    addStructuredData(organizationData, 'organization-schema');
    addStructuredData(websiteData, 'website-schema');

    // Meta description ve keywords güncelleme
    const updateMetaTags = () => {
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
    };

    updateMetaTags();
  }, []);

  return (
    <>
      <main className="min-h-screen bg-white">
        <Header />
          {/* Hero Slider */}
        <div className="relative w-full h-screen">
          <Swiper
            modules={[Navigation, Pagination, Autoplay, EffectFade]}
            effect="fade"
            navigation
            pagination={{ clickable: true }}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            loop={true}
            className="w-full h-full"
            style={{ width: '100%', height: '100vh' }}
          >
            {images.map((image, index) => (
              <SwiperSlide key={index} style={{ width: '100%', height: '100%' }}>
                <div className="relative w-full h-full" style={{ width: '100%', height: '100%' }}>
                  {/* Görsel */}
                  <img 
                    src={image.url}
                    alt={image.title}
                    className="w-full h-full object-cover"
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover',
                      display: 'block'
                    }}
                    onLoad={() => {
                      console.log('✅ Slider image loaded successfully:', image.url);
                    }}
                    onError={(e) => {
                      console.error('❌ Slider image failed to load:', image.url);
                      console.error('Error details:', e);
                    }}
                  />
                  
                  {/* Karartma Katmanı */}
                  <div className="absolute inset-0 bg-black bg-opacity-30" />
                  
                  {/* İçerik */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white px-4">
                      <h2 className="text-4xl md:text-6xl font-bold mb-4">{image.title}</h2>
                      <p className="text-lg md:text-xl max-w-2xl mx-auto">{image.description}</p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
            {/* Özel Stil */}
          <style>{`
            .swiper {
              width: 100% !important;
              height: 100vh !important;
            }
            
            .swiper-slide {
              width: 100% !important;
              height: 100% !important;
            }
            
            .swiper-slide img {
              width: 100% !important;
              height: 100% !important;
              object-fit: cover !important;
              display: block !important;
            }
            
            .swiper-button-next,
            .swiper-button-prev {
              color: white !important;
              width: 32px !important;
              height: 32px !important;
              margin-top: -16px !important;
              background: rgba(0, 0, 0, 0.3) !important;
              border-radius: 50% !important;
              backdrop-filter: blur(10px) !important;
              transition: all 0.3s ease !important;
              z-index: 10 !important;
            }

            .swiper-button-next:hover,
            .swiper-button-prev:hover {
              background: rgba(0, 0, 0, 0.5) !important;
              transform: scale(1.1) !important;
            }
            
            .swiper-button-next:after,
            .swiper-button-prev:after {
              font-size: 14px !important;
              font-weight: bold !important;
            }

            .swiper-button-next:after {
              content: '→' !important;
            }

            .swiper-button-prev:after {
              content: '←' !important;
            }

            .swiper-button-next {
              right: 20px !important;
            }

            .swiper-button-prev {
              left: 20px !important;
            }

            .swiper-pagination-bullet {
              background: white !important;
              opacity: 0.6 !important;
            }

            .swiper-pagination-bullet-active {
              background: white !important;
              opacity: 1 !important;
            }

            .swiper-pagination {
              bottom: 20px !important;
              z-index: 10 !important;
            }
          `}</style>
        </div>

        {/* Diğer Bölümler */}
        <AboutPreview />
        <FeaturedProducts />
        <FAQ />
        <BlogPreview />
        <Testimonials />
      </main>
      <Footer />
    </>
  );
}
