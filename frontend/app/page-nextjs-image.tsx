'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Image from 'next/image';
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
  const [imageLoaded, setImageLoaded] = useState(false);

  // Debug: Log image paths on component mount
  useEffect(() => {
    console.log('🖼️ Next.js Image Slider - Images configuration:');
    images.forEach((image, index) => {
      console.log(`Image ${index + 1}: ${image.url}`);
    });
  }, []);

  // Auto-advance slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Reset image loaded state when slide changes
  useEffect(() => {
    setImageLoaded(false);
  }, [currentSlide]);

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
        
        {/* Hero Slider - Next.js Image Component */}
        <div className="relative w-full h-screen overflow-hidden bg-gray-900">
          {/* Loading indicator */}
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 z-5">
              <div className="text-white text-xl">Loading...</div>
            </div>
          )}
          
          {/* Image Container */}
          <div className="relative w-full h-full">
            <Image
              src={images[currentSlide].url}
              alt={images[currentSlide].title}
              fill
              priority
              quality={85}
              className="object-cover"
              sizes="100vw"
              onLoad={() => {
                console.log(`✅ Next.js Image loaded: ${images[currentSlide].url}`);
                setImageLoaded(true);
              }}
              onError={(e) => {
                console.error(`❌ Next.js Image failed: ${images[currentSlide].url}`, e);
                setImageLoaded(true); // Still show UI even if image fails
              }}
            />
          </div>
          
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/30 z-10" />
          
          {/* Content */}
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="text-center text-white px-4 max-w-4xl">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg">
                {images[currentSlide].title}
              </h1>
              <p className="text-lg md:text-xl mb-8 drop-shadow-md">
                {images[currentSlide].description}
              </p>
              <div className="space-x-4">
                <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
                  Ürünleri İncele
                </button>
                <button className="border-2 border-white text-white hover:bg-white hover:text-green-600 px-8 py-3 rounded-lg font-semibold transition-colors">
                  Hakkımızda
                </button>
              </div>
              
              {/* Debug info */}
              <div className="mt-4 text-sm bg-black/50 px-4 py-2 rounded">
                Slide {currentSlide + 1} / {images.length} | Loaded: {imageLoaded ? 'Yes' : 'No'}
              </div>
            </div>
          </div>
          
          {/* Navigation arrows */}
          <button 
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-2xl font-bold transition-all duration-300"
          >
            ←
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-2xl font-bold transition-all duration-300"
          >
            →
          </button>
          
          {/* Dots pagination */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex space-x-3">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'bg-white scale-125' 
                    : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
          
          {/* Slide counter */}
          <div className="absolute top-4 right-4 z-30 bg-black/30 text-white px-3 py-1 rounded-full text-sm">
            {currentSlide + 1} / {images.length}
          </div>
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
