'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';
import Header from '../components/Header';
import Button from '../components/ui/Button';
import { FormInput } from '../components/forms/FormComponents';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Kayıt işlemi başarısız');
      }      if (data.success) {
        // Token'ları localStorage'a kaydet
        localStorage.setItem('token', data.data.accessToken || data.token);
        if (data.data.refreshToken || data.refreshToken) {
          localStorage.setItem('refreshToken', data.data.refreshToken || data.refreshToken);
        }
        localStorage.setItem('user', JSON.stringify(data.data.user || data.user));

        // Ana sayfaya yönlendir
        router.push('/');
        router.refresh();
      } else {
        throw new Error(data.message || 'Kayıt işlemi başarısız');
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
              Hesap Oluşturun
            </h2>
            <p className="text-gray-600">
              Cardiolive ailesine katılın
            </p>
          </div>

          <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}            <form onSubmit={handleSubmit} className="space-y-6">
              <FormInput
                id="name"
                name="name"
                type="text"
                label="Ad Soyad"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ad Soyadınız"
                leftIcon={<User className="h-5 w-5 text-gray-400" />}
                className="block w-full py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#70BB1B] focus:border-[#70BB1B]"
                required
              />

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

              <FormInput
                id="phone"
                name="phone"
                type="tel"
                label="Telefon Numarası"
                value={formData.phone}
                onChange={handleChange}
                placeholder="0555 123 45 67"
                leftIcon={<Phone className="h-5 w-5 text-gray-400" />}
                className="block w-full py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#70BB1B] focus:border-[#70BB1B]"
                required
              />

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

              <FormInput
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                label="Şifre Tekrarı"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
                rightIcon={
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="p-0"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </Button>
                }
                className="block w-full py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#70BB1B] focus:border-[#70BB1B]"
                required
              />

              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-[#70BB1B] focus:ring-[#70BB1B] border-gray-300 rounded"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                  <Link href="/terms" className="text-[#70BB1B] hover:underline">
                    Kullanım Şartları
                  </Link>
                  {' '}ve{' '}
                  <Link href="/privacy" className="text-[#70BB1B] hover:underline">
                    Gizlilik Politikası                </Link>
                  &apos;nı kabul ediyorum
                </label>
              </div>              <div>
                <Button
                  type="submit"
                  disabled={loading}
                  loading={loading}
                  className="w-full"
                  size="lg"
                >
                  Hesap Oluştur
                </Button>
              </div>

              <div className="text-center">
                <span className="text-gray-600">Zaten hesabınız var mı? </span>
                <Link
                  href="/login"
                  className="font-medium text-[#70BB1B] hover:underline"
                >
                  Giriş yapın
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
