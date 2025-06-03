'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft } from 'lucide-react';
import Header from '../components/Header';
import Button from '../components/ui/Button';
import { FormInput } from '../components/forms/FormComponents';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Şifre sıfırlama e-postası gönderilemedi');
      }

      if (data.success) {
        setMessage('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen e-posta kutunuzu kontrol edin.');
        setSent(true);
      } else {
        throw new Error(data.message || 'Şifre sıfırlama e-postası gönderilemedi');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'var(--font-inter)' }}>
      <Header />
      
      <main className="flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Şifrenizi mi Unuttunuz?
            </h2>
            <p className="text-gray-600">
              E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim
            </p>
          </div>

          <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            {message && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                {message}
              </div>
            )}

            {!sent ? (              <form onSubmit={handleSubmit} className="space-y-6">
                <FormInput
                  id="email"
                  name="email"
                  type="email"
                  label="E-posta Adresi"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@email.com"
                  leftIcon={<Mail className="h-5 w-5 text-gray-400" />}
                  className="block w-full py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#70BB1B] focus:border-[#70BB1B]"
                  required
                />

                <div>
                  <Button
                    type="submit"
                    loading={loading}
                    loadingText="Gönderiliyor..."
                    className="w-full"
                    size="lg"
                  >
                    Şifre Sıfırlama Bağlantısı Gönder
                  </Button>
                </div>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                  <Mail className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-gray-600">
                  E-posta gönderildi! Birkaç dakika içinde e-posta kutunuzu kontrol edin.
                </p>
                <p className="text-sm text-gray-500">
                  E-postayı göremiyorsanız, spam klasörünüzü kontrol etmeyi unutmayın.
                </p>
              </div>
            )}

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="inline-flex items-center text-sm text-[#70BB1B] hover:underline"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Giriş sayfasına geri dön
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
