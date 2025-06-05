'use client';

import { useState } from 'react';

export default function ImageTestPage() {
  const [imageResults, setImageResults] = useState<{[key: string]: string}>({});

  const testImage = (imagePath: string, testName: string) => {
    const img = new Image();
    
    img.onload = () => {
      console.log(`✅ ${testName} loaded successfully`);
      setImageResults(prev => ({
        ...prev,
        [testName]: `✅ SUCCESS: ${img.naturalWidth}x${img.naturalHeight}px`
      }));
    };
    
    img.onerror = () => {
      console.error(`❌ ${testName} failed to load`);
      setImageResults(prev => ({
        ...prev,
        [testName]: `❌ FAILED: Could not load ${imagePath}`
      }));
    };
    
    img.src = imagePath;
  };

  const testAllImages = () => {
    setImageResults({});
    console.log('🔍 Testing all slider images...');
    
    // Test all three images
    testImage('/slider/image1.jpg', 'Image 1');
    testImage('/slider/image2.jpg', 'Image 2');  
    testImage('/slider/image3.jpg', 'Image 3');
    
    // Test with timestamp to bypass cache
    const timestamp = Date.now();
    testImage(`/slider/image1.jpg?t=${timestamp}`, 'Image 1 (no cache)');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Image Loading Test</h1>
        
        {/* Test Button */}
        <div className="text-center mb-8">
          <button
            onClick={testAllImages}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Test Image Loading
          </button>
        </div>

        {/* Results */}
        {Object.keys(imageResults).length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Test Results:</h2>
            <div className="space-y-2">
              {Object.entries(imageResults).map(([testName, result]) => (
                <div key={testName} className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">{testName}:</span>
                  <span className={result.includes('✅') ? 'text-green-600' : 'text-red-600'}>
                    {result}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Direct IMG Test */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Direct Image Test</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((num) => (
              <div key={num} className="text-center">
                <h3 className="font-bold mb-2">Image {num}</h3>
                <div className="border border-gray-300 rounded bg-gray-50" style={{ height: '200px' }}>
                  <img 
                    src={`/slider/image${num}.jpg`}
                    alt={`Test Image ${num}`}
                    className="w-full h-full object-cover rounded"
                    onLoad={(e) => {
                      console.log(`✅ Direct IMG ${num} loaded`);
                      const target = e.target as HTMLImageElement;
                      console.log(`Size: ${target.naturalWidth}x${target.naturalHeight}`);
                    }}
                    onError={(e) => {
                      console.error(`❌ Direct IMG ${num} failed`);
                      const target = e.target as HTMLImageElement;
                      target.style.backgroundColor = '#ff0000';
                      target.style.color = 'white';
                      target.style.display = 'flex';
                      target.style.alignItems = 'center';
                      target.style.justifyContent = 'center';
                      target.innerHTML = `Error loading image${num}.jpg`;
                    }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">/slider/image{num}.jpg</p>
              </div>
            ))}
          </div>
        </div>

        {/* Network Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Debug Info</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
            <p><strong>User Agent:</strong> {typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'}</p>
            <p><strong>Test Time:</strong> {new Date().toISOString()}</p>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <a 
            href="/" 
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Back to Homepage
          </a>
        </div>
      </div>
    </div>
  );
}
