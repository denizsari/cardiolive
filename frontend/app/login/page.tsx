'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import Header from '../components/Header';
import Button from '../components/ui/Button';
import { FormInput } from '../components/forms/FormComponents';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Giriş işlemi başarısız');
      }      if (data.success) {
        // Token'ı localStorage'a kaydet
        localStorage.setItem('token', data.data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        // Admin kullanıcıyı admin paneline, normal kullanıcıyı anasayfaya yönlendir
        if (data.data.user && data.data.user.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/');
        }
        router.refresh();
      } else {
        throw new Error(data.message || 'Giriş işlemi başarısız');
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
              Hesabınıza Giriş Yapın
            </h2>
            <p className="text-gray-600">
              Cardiolive ailesine hoş geldiniz
            </p>
          </div>

          <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">              <div>
                <FormInput
                  id="email"
                  name="email"
                  type="email"
                  label="E-posta Adresi"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ornek@email.com"
                  leftIcon={<Mail className="h-5 w-5 text-gray-400" />}
                  className="block w-full py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#70BB1B] focus:border-[#70BB1B]"
                  required
                />
              </div>

              <div>
                <FormInput
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  label="Şifre"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
                  rightIcon={
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="p-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </Button>
                  }
                  className="block w-full py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#70BB1B] focus:border-[#70BB1B]"
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-[#70BB1B] focus:ring-[#70BB1B] border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Beni hatırla
                  </label>
                </div>

                <div className="text-sm">
                  <Link
                    href="/forgot-password"
                    className="font-medium text-[#70BB1B] hover:underline"
                  >
                    Şifrenizi mi unuttunuz?
                  </Link>
                </div>
              </div>              <div>
                <Button
                  type="submit"
                  disabled={loading}
                  loading={loading}
                  className="w-full"
                  size="lg"
                >
                  Giriş Yap
                </Button>
              </div>

              <div className="text-center">
                <span className="text-gray-600">Hesabınız yok mu? </span>
                <Link
                  href="/register"
                  className="font-medium text-[#70BB1B] hover:underline"
                >
                  Hemen kaydolun
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
