'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  description: string;
}

export default function TestAPIPage() {
  const [status, setStatus] = useState('Testing...');
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testAPI = async () => {
      try {
        console.log('Starting API test...');
        console.log('API URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');
        
        const response = await fetch('http://localhost:5000/api/products');
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API Response:', data);
        
        if (data.success) {
          setProducts(data.data.products.slice(0, 3));
          setStatus('✅ API Connection Successful!');
        } else {
          setStatus('❌ API returned error');
          setError(data.message || 'Unknown error');        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('API Test Error:', err);
        setStatus('❌ API Connection Failed');
        setError(errorMessage);
      }
    };

    testAPI();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">API Connection Test</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
          <p className="text-lg">{status}</p>
          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>

        {products.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Sample Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {products.map((product, index) => (
                <div key={product._id || index} className="border rounded-lg p-4">
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-gray-600">{product.category}</p>
                  <p className="text-green-600 font-bold">${product.price}</p>
                  <p className="text-sm text-gray-500 mt-2">{product.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}        <div className="mt-8 text-center">
          <Link href="/" className="text-blue-600 hover:text-blue-800 underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
