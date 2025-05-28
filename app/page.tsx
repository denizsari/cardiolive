'use client';

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
    title: 'Doğal Zeytinyağı',
    description: 'Ege\'nin en kaliteli zeytinlerinden elde edilmiştir'
  },
  {
    url: '/slider/image2.jpg',
    title: 'Organik Üretim',
    description: 'Geleneksel yöntemlerle işlenen zeytinyağları'
  },
  {
    url: '/slider/image3.jpg',
    title: 'Sızma Zeytinyağı',
    description: 'İlk soğuk sıkım, doğal aromayı korur'
  },
];

export default function Home() {
  return (
    <>
      <main className="min-h-screen bg-white">
        <Header />
        
        {/* Hero Slider */}
        <div className="relative">
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
            className="h-screen"
          >
            {images.map((image, index) => (
              <SwiperSlide key={index}>
                <div className="relative w-full h-full">
                  {/* Görsel */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ 
                      backgroundImage: `url(${image.url})`,
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
            .swiper-button-next,
            .swiper-button-prev {
              color: white !important;
            }

            .swiper-pagination-bullet {
              background: white !important;
            }

            .swiper-pagination-bullet-active {
              background: white !important;
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
