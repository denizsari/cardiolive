'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

// Swiper stilleri
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const images = [
  {
    url: '/slider/image1.jpg',
    title: 'Test Image 1',
    description: 'Testing first slider image'
  },
  {
    url: '/slider/image2.jpg',
    title: 'Test Image 2', 
    description: 'Testing second slider image'
  },
  {
    url: '/slider/image3.jpg',
    title: 'Test Image 3',
    description: 'Testing third slider image'
  },
];

export default function TestSlider() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Slider Test Page</h1>
        
        {/* Simple image grid first */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Static Images Test</h2>
          <div className="grid grid-cols-3 gap-4">
            {images.map((image, index) => (
              <div key={index} className="text-center">
                <img 
                  src={image.url}
                  alt={image.title}
                  className="w-full h-48 object-cover rounded-lg"
                  onLoad={() => console.log(`✅ Static image ${index + 1} loaded`)}
                  onError={() => console.error(`❌ Static image ${index + 1} failed`)}
                />
                <p className="mt-2 text-sm">{image.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Swiper test */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Swiper Test</h2>
          <div className="relative h-96 bg-gray-200 rounded-lg overflow-hidden">
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              navigation
              pagination={{ clickable: true }}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
              }}
              loop={true}
              className="h-full"
            >
              {images.map((image, index) => (
                <SwiperSlide key={index}>
                  <div className="relative w-full h-full">
                    <img 
                      src={image.url}
                      alt={image.title}
                      className="w-full h-full object-cover"
                      onLoad={() => console.log(`✅ Swiper image ${index + 1} loaded`)}
                      onError={() => console.error(`❌ Swiper image ${index + 1} failed`)}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                      <div className="text-center text-white">
                        <h3 className="text-2xl font-bold mb-2">{image.title}</h3>
                        <p className="text-lg">{image.description}</p>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>

        <div className="text-center">
          <a 
            href="/" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Homepage
          </a>
        </div>
      </div>

      <style>{`
        .swiper-button-next,
        .swiper-button-prev {
          color: white !important;
          background: rgba(0, 0, 0, 0.5) !important;
          width: 40px !important;
          height: 40px !important;
          border-radius: 50% !important;
        }
        
        .swiper-pagination-bullet {
          background: white !important;
        }
      `}</style>
    </div>
  );
}
