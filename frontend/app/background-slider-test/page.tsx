'use client';

import { useEffect, useState } from 'react';
import Header from '../components/Header';
import AboutPreview from '../components/sections/AboutPreview';
import FeaturedProducts from '../components/sections/FeaturedProducts';
import FAQ from '../components/sections/FAQ';
import BlogPreview from '../components/sections/BlogPreview';
import Testimonials from '../components/sections/Testimonials';
import Footer from '../components/Footer';

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

export default function BackgroundSliderTest() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imageLoaded, setImageLoaded] = useState<Record<number, boolean>>({});

  // Preload images
  useEffect(() => {
    images.forEach((image, index) => {
      const img = new Image();
      img.onload = () => {
        console.log(`✅ Image ${index + 1} preloaded: ${image.url}`);
        setImageLoaded(prev => ({ ...prev, [index]: true }));
      };
      img.onerror = () => {
        console.error(`❌ Image ${index + 1} failed to preload: ${image.url}`);
      };
      img.src = image.url;
    });
  }, []);

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
        
        {/* Hero Slider - Background Image Method */}
        <div className="relative w-full h-screen overflow-hidden">
          {/* Background Image Container */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-500"
            style={{
              backgroundImage: `url('${images[currentSlide].url}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          />
          
          {/* Loading indicator */}
          {!imageLoaded[currentSlide] && (
            <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
              <div className="text-gray-600 text-xl">Loading image...</div>
            </div>
          )}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-30 z-10" />
          
          {/* Content */}
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="text-center text-white px-4">
              <h2 className="text-4xl md:text-6xl font-bold mb-4">
                {images[currentSlide].title}
              </h2>
              <p className="text-lg md:text-xl max-w-2xl mx-auto mb-4">
                {images[currentSlide].description}
              </p>
              <div className="text-sm bg-black bg-opacity-50 px-4 py-2 rounded inline-block">
                Slide {currentSlide + 1} of {images.length} | 
                {imageLoaded[currentSlide] ? ' ✅ Loaded' : ' ⏳ Loading...'}
              </div>
            </div>
          </div>
          
          {/* Navigation arrows */}
          <button 
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full flex items-center justify-center text-white text-xl font-bold transition-all duration-300 z-30"
          >
            ←
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full flex items-center justify-center text-white text-xl font-bold transition-all duration-300 z-30"
          >
            →
          </button>
          
          {/* Dots pagination */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-30">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'bg-white' 
                    : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Debug section - Image preload status */}
        <div className="bg-gray-100 p-4">
          <h3 className="font-bold mb-2">Debug: Image Preload Status</h3>
          <div className="flex gap-4">
            {images.map((image, index) => (
              <div key={index} className="flex items-center gap-2">
                <span>{image.url}</span>
                <span className={imageLoaded[index] ? 'text-green-600' : 'text-red-600'}>
                  {imageLoaded[index] ? '✅' : '❌'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Other sections */}
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
