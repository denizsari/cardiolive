'use client';

export default function TestImages() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Image Test Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">Image 1</h2>
          <img 
            src="/slider/image1.jpg" 
            alt="Test Image 1"
            className="w-full h-64 object-cover rounded-lg shadow-lg"
            onLoad={() => console.log('Image 1 loaded successfully')}
            onError={(e) => {
              console.error('Image 1 failed to load:', e);
              e.currentTarget.style.border = '2px solid red';
            }}
          />
          <p className="text-sm text-gray-600 mt-2">Size: ~151KB</p>
        </div>

        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">Image 2</h2>
          <img 
            src="/slider/image2.jpg" 
            alt="Test Image 2"
            className="w-full h-64 object-cover rounded-lg shadow-lg"
            onLoad={() => console.log('Image 2 loaded successfully')}
            onError={(e) => {
              console.error('Image 2 failed to load:', e);
              e.currentTarget.style.border = '2px solid red';
            }}
          />
          <p className="text-sm text-gray-600 mt-2">Size: ~206KB</p>
        </div>

        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">Image 3</h2>
          <img 
            src="/slider/image3.jpg" 
            alt="Test Image 3"
            className="w-full h-64 object-cover rounded-lg shadow-lg"
            onLoad={() => console.log('Image 3 loaded successfully')}
            onError={(e) => {
              console.error('Image 3 failed to load:', e);
              e.currentTarget.style.border = '2px solid red';
            }}
          />
          <p className="text-sm text-gray-600 mt-2">Size: ~255KB</p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Direct Image URLs Test</h2>
        <div className="space-y-2">
          <div>
            <a 
              href="/slider/image1.jpg" 
              target="_blank" 
              className="text-blue-600 hover:underline"
            >
              Direct link to image1.jpg
            </a>
          </div>
          <div>
            <a 
              href="/slider/image2.jpg" 
              target="_blank" 
              className="text-blue-600 hover:underline"
            >
              Direct link to image2.jpg
            </a>
          </div>
          <div>
            <a 
              href="/slider/image3.jpg" 
              target="_blank" 
              className="text-blue-600 hover:underline"
            >
              Direct link to image3.jpg
            </a>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <a 
          href="/" 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Back to Homepage
        </a>
      </div>
    </div>
  );
}
