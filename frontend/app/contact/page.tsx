'use client';

import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/ui/Button';
import { FormInput, FormTextarea } from '../components/forms/FormComponents';

export default function ContactUs() {
  return (
    <div className="flex flex-col min-h-screen bg-white" style={{ fontFamily: 'var(--font-inter)' }}>
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">İletişim</h1>
        <p className="text-lg text-gray-700 mb-4">
          Bizimle iletişime geçmek için aşağıdaki formu doldurabilir veya doğrudan e-posta gönderebilirsiniz.
        </p>        <form className="space-y-4">
          <FormInput
            id="name"
            type="text"
            label="Adınız"
            placeholder="Adınızı giriniz"
            required
          />
          <FormInput
            id="email"
            type="email"
            label="E-posta"
            placeholder="E-posta adresinizi giriniz"
            required
          />
          <FormTextarea
            id="message"
            rows={4}
            label="Mesajınız"
            placeholder="Mesajınızı buraya yazın"
            required
          /><Button type="submit" size="md">
            Gönder
          </Button>
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