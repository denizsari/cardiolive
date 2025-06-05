'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Header from './components/Header';
import AboutPreview from './components/sections/AboutPreview';
import FeaturedProducts from './components/sections/FeaturedProducts';
import FAQ from './components/sections/FAQ';
import BlogPreview from './components/sections/BlogPreview';
import Testimonials from './components/sections/Testimonials';
import Footer from './components/Footer';

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
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <>
      <main className="min-h-screen bg-white">
        <Header />
        
        {/* Hero Slider - CSS Grid Layout */}
        <section 
          className="grid grid-cols-1 h-screen"
          style={{
            background: `url(${images[currentSlide].url}) center/cover no-repeat`,
            transition: 'background 0.5s ease-in-out'
          }}
        >
          {/* Dark overlay */}
          <div className="col-start-1 row-start-1 bg-black/40" />
          
          {/* Content */}
          <div className="col-start-1 row-start-1 flex items-center justify-center px-4">
            <div className="text-center text-white max-w-4xl">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 drop-shadow-lg">
                {images[currentSlide].title}
              </h1>
              <p className="text-xl md:text-2xl mb-8 drop-shadow-md">
                {images[currentSlide].description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors text-lg">
                  Ürünleri İncele
                </button>
                <button className="border-2 border-white text-white hover:bg-white hover:text-green-600 px-8 py-4 rounded-lg font-semibold transition-colors text-lg">
                  Hakkımızda
                </button>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <div className="col-start-1 row-start-1 flex items-center justify-between px-6">
            <button 
              onClick={prevSlide}
              className="w-14 h-14 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-2xl font-bold transition-all duration-300"
            >
              ←
            </button>
            <button 
              onClick={nextSlide}
              className="w-14 h-14 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-2xl font-bold transition-all duration-300"
            >
              →
            </button>
          </div>
          
          {/* Bottom controls */}
          <div className="col-start-1 row-start-1 flex items-end justify-center pb-8">
            <div className="flex space-x-3">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? 'bg-white scale-125' 
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                />
              ))}
            </div>
          </div>
          
          {/* Debug counter */}
          <div className="col-start-1 row-start-1 flex justify-end items-start p-4">
            <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              CSS Grid: {currentSlide + 1} / {images.length}
            </div>
          </div>
        </section>

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
