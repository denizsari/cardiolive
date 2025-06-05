'use client';

import { useState, useEffect } from 'react';

interface SliderImage {
  url: string;
  title: string;
  description: string;
}

interface SimpleSliderProps {
  images: SliderImage[];
}

export default function SimpleSlider({ images }: SimpleSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageLoadStatus, setImageLoadStatus] = useState<{ [key: number]: boolean }>({});

  // Debug: Log when component mounts
  useEffect(() => {
    console.log('🎬 SimpleSlider mounted with images:', images);
    console.log('📁 Image paths:');
    images.forEach((img, idx) => {
      console.log(`  ${idx + 1}. ${img.url} - ${img.title}`);
    });
  }, [images]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [images.length]);

  const handleImageLoad = (index: number, url: string) => {
    console.log(`✅ Image ${index + 1} loaded successfully: ${url}`);
    setImageLoadStatus(prev => ({ ...prev, [index]: true }));
  };

  const handleImageError = (index: number, url: string) => {
    console.error(`❌ Image ${index + 1} failed to load: ${url}`);
    setImageLoadStatus(prev => ({ ...prev, [index]: false }));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Slider Images */}
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >          <img
            src={image.url}
            alt={image.title}
            className="w-full h-full object-cover"
            onLoad={() => handleImageLoad(index, image.url)}
            onError={() => handleImageError(index, image.url)}
            style={{
              backgroundColor: '#f0f0f0', // Fallback background
              minHeight: '100vh'
            }}
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-30" />
          
          {/* Content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white px-4">
              <h2 className="text-4xl md:text-6xl font-bold mb-4">{image.title}</h2>
              <p className="text-lg md:text-xl max-w-2xl mx-auto">{image.description}</p>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black bg-opacity-30 hover:bg-opacity-50 rounded-full flex items-center justify-center text-white text-xl font-bold transition-all duration-300 hover:scale-110 z-10"
      >
        ←
      </button>
      
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black bg-opacity-30 hover:bg-opacity-50 rounded-full flex items-center justify-center text-white text-xl font-bold transition-all duration-300 hover:scale-110 z-10"
      >
        →
      </button>

      {/* Dots Pagination */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-white' 
                : 'bg-white bg-opacity-50 hover:bg-opacity-75'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
