'use client';

import { useState } from 'react';

const images = [
  '/slider/image1.jpg',
  '/slider/image2.jpg', 
  '/slider/image3.jpg'
];

export default function DebugImages() {
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [errorImages, setErrorImages] = useState<Record<string, boolean>>({});

  const handleImageLoad = (src: string) => {
    console.log(`✅ Image loaded: ${src}`);
    setLoadedImages(prev => ({ ...prev, [src]: true }));
  };

  const handleImageError = (src: string) => {
    console.error(`❌ Image failed: ${src}`);
    setErrorImages(prev => ({ ...prev, [src]: true }));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8">Image Debug Page</h1>
      
      <div className="grid gap-8">
        {images.map((src, index) => (
          <div key={src} className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Image {index + 1}: {src}</h2>
            
            {/* Status indicators */}
            <div className="flex gap-4 mb-4">
              <span className={`px-3 py-1 rounded ${
                loadedImages[src] ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
              }`}>
                {loadedImages[src] ? '✅ Loaded' : '⏳ Loading...'}
              </span>
              <span className={`px-3 py-1 rounded ${
                errorImages[src] ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'
              }`}>
                {errorImages[src] ? '❌ Error' : '✅ No Error'}
              </span>
            </div>

            {/* Regular img tag */}
            <div className="border border-gray-300 mb-4">
              <h3 className="text-lg font-medium mb-2">Regular &lt;img&gt; tag:</h3>
              <div className="bg-red-100 p-4" style={{ width: '400px', height: '300px' }}>
                <img 
                  src={src}
                  alt={`Test image ${index + 1}`}
                  className="w-full h-full object-cover"
                  onLoad={() => handleImageLoad(src)}
                  onError={() => handleImageError(src)}
                  style={{
                    display: 'block',
                    maxWidth: '100%',
                    height: 'auto'
                  }}
                />
              </div>
            </div>

            {/* Background image div */}
            <div className="border border-gray-300 mb-4">
              <h3 className="text-lg font-medium mb-2">Background image:</h3>
              <div 
                className="bg-blue-100"
                style={{ 
                  width: '400px', 
                  height: '300px',
                  backgroundImage: `url('${src}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              />
            </div>

            {/* Absolute positioned img */}
            <div className="border border-gray-300 mb-4">
              <h3 className="text-lg font-medium mb-2">Absolute positioned:</h3>
              <div className="relative bg-green-100" style={{ width: '400px', height: '300px' }}>
                <img 
                  src={src}
                  alt={`Test image ${index + 1}`}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    zIndex: 1
                  }}
                  onLoad={() => handleImageLoad(`${src}-absolute`)}
                  onError={() => handleImageError(`${src}-absolute`)}
                />
              </div>
            </div>

            {/* Direct URL test */}
            <div className="border border-gray-300">
              <h3 className="text-lg font-medium mb-2">Direct URL test:</h3>
              <a 
                href={src} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Open {src} in new tab
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Console log button */}
      <button 
        onClick={() => {
          console.log('🔍 Current image load status:');
          console.log('Loaded:', loadedImages);
          console.log('Errors:', errorImages);
        }}
        className="mt-8 px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Log Status to Console
      </button>
    </div>
  );
}
