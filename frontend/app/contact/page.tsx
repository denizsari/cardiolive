'use client';

import Header from '../components/Header';
import Footer from '../components/Footer';

export default function ContactUs() {
  return (
    <div className="flex flex-col min-h-screen bg-white" style={{ fontFamily: 'var(--font-inter)' }}>
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">İletişim</h1>
        <p className="text-lg text-gray-700 mb-4">
          Bizimle iletişime geçmek için aşağıdaki formu doldurabilir veya doğrudan e-posta gönderebilirsiniz.
        </p>
        <form className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Adınız</label>
            <input type="text" id="name" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-posta</label>
            <input type="email" id="email" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">Mesajınız</label>
            <textarea id="message" rows={4} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"></textarea>
          </div>
          <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#70BB1B] hover:bg-[#5a9e16] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#70BB1B]">
            Gönder
          </button>
        </form>
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-2">İletişim Bilgileri</h2>
          <p className="text-lg text-gray-700">E-posta: info@cardiolive.com</p>
          <p className="text-lg text-gray-700">Telefon: +90 123 456 7890</p>
        </div>      </main>

      <Footer />
    </div>
  );
}