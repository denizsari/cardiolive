'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import { User, Mail, Phone, Calendar, Edit } from 'lucide-react';

interface UserData {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  createdAt: string;
}

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setFormData({
        name: parsedUser.name,
        email: parsedUser.email,
        phone: parsedUser.phone || ''
      });
    }
    setLoading(false);
  }, [router]);

  const handleEdit = () => {
    setEditing(!editing);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSave = async () => {
    // Bu kısım daha sonra API entegrasyonu ile geliştirilecek
    setUser(prev => prev ? { ...prev, ...formData } : null);
    localStorage.setItem('user', JSON.stringify({ ...user, ...formData }));
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'var(--font-inter)' }}>
        <Header />
        <main className="pt-24 pb-16">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-300 rounded w-full"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'var(--font-inter)' }}>
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Hesabım</h1>
            <p className="text-gray-600 mt-2">
              Hesap bilgilerinizi görüntüleyin ve güncelleyin
            </p>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Kişisel Bilgiler</h2>
              <button
                onClick={handleEdit}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#70BB1B]"
              >
                <Edit className="h-4 w-4 mr-2" />
                {editing ? 'İptal' : 'Düzenle'}
              </button>
            </div>

            <div className="px-6 py-6">
              <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Ad Soyad
                  </dt>
                  <dd className="mt-1">
                    {editing ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#70BB1B] focus:border-[#70BB1B]"
                      />
                    ) : (
                      <span className="text-sm text-gray-900">{user.name}</span>
                    )}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    E-posta
                  </dt>
                  <dd className="mt-1">
                    {editing ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#70BB1B] focus:border-[#70BB1B]"
                      />
                    ) : (
                      <span className="text-sm text-gray-900">{user.email}</span>
                    )}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    Telefon
                  </dt>
                  <dd className="mt-1">
                    {editing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#70BB1B] focus:border-[#70BB1B]"
                        placeholder="Telefon numaranız"
                      />
                    ) : (
                      <span className="text-sm text-gray-900">
                        {user.phone || 'Telefon numarası belirtilmemiş'}
                      </span>
                    )}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Üyelik Tarihi
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                  </dd>
                </div>
              </dl>

              {editing && (
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setEditing(false)}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#70BB1B]"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleSave}
                    className="bg-[#70BB1B] py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#70BB1B]"
                  >
                    Kaydet
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Siparişlerim</h3>
              <p className="text-gray-600 text-sm mb-4">
                Geçmiş siparişlerinizi görüntüleyin ve takip edin
              </p>
              <button
                onClick={() => router.push('/orders')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#70BB1B] hover:bg-opacity-90"
              >
                Siparişleri Görüntüle
              </button>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Şifre Değiştir</h3>
              <p className="text-gray-600 text-sm mb-4">
                Hesap güvenliğiniz için şifrenizi güncelleyin
              </p>
              <button
                onClick={() => router.push('/change-password')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Şifre Değiştir
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
