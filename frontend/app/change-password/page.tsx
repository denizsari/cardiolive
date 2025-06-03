'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Eye, EyeOff, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import { FormInput } from '../components/forms/FormComponents';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    feedback: string[];
  }>({
    score: 0,
    feedback: []
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const checkPasswordStrength = (password: string) => {
    let score = 0;
    const feedback = [];

    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('En az 8 karakter olmalı');
    }

    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('En az bir küçük harf içermeli');
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('En az bir büyük harf içermeli');
    }

    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('En az bir sayı içermeli');
    }

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1;
    } else {
      feedback.push('En az bir özel karakter içermeli');
    }

    setPasswordStrength({ score, feedback });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'newPassword') {
      checkPasswordStrength(value);
    }

    // Clear messages when user starts typing
    if (message.text) {
      setMessage({ type: '', text: '' });
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validateForm = () => {
    if (!formData.currentPassword) {
      setMessage({ type: 'error', text: 'Mevcut şifrenizi giriniz' });
      return false;
    }

    if (!formData.newPassword) {
      setMessage({ type: 'error', text: 'Yeni şifrenizi giriniz' });
      return false;
    }

    if (formData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Yeni şifre en az 8 karakter olmalıdır' });
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Yeni şifreler eşleşmiyor' });
      return false;
    }

    if (formData.currentPassword === formData.newPassword) {
      setMessage({ type: 'error', text: 'Yeni şifre mevcut şifreden farklı olmalıdır' });
      return false;
    }

    if (passwordStrength.score < 3) {
      setMessage({ type: 'error', text: 'Şifre yeterince güçlü değil' });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/users/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Şifreniz başarıyla değiştirildi' });
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        // Redirect to account page after 2 seconds
        setTimeout(() => {
          router.push('/account');
        }, 2000);
      } else {
        setMessage({ 
          type: 'error', 
          text: data.message || 'Şifre değiştirilirken bir hata oluştu' 
        });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setMessage({ 
        type: 'error', 
        text: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength.score <= 2) return 'bg-red-500';
    if (passwordStrength.score <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (passwordStrength.score <= 2) return 'Zayıf';
    if (passwordStrength.score <= 3) return 'Orta';
    return 'Güçlü';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Link
              href="/account"
              className="absolute left-4 p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <Lock className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Şifre Değiştir</h1>
          <p className="mt-2 text-gray-600">
            Hesap güvenliğiniz için güçlü bir şifre seçin
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">            {/* Current Password */}
            <div>
              <FormInput
                type={showPasswords.current ? 'text' : 'password'}
                id="currentPassword"
                name="currentPassword"
                label="Mevcut Şifre"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Mevcut şifrenizi giriniz"
                leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
                rightIcon={
                  <Button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    variant="ghost"
                    size="sm"
                    className="p-0"
                  >
                    {showPasswords.current ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                  </Button>
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>            {/* New Password */}
            <div>
              <FormInput
                type={showPasswords.new ? 'text' : 'password'}
                id="newPassword"
                name="newPassword"
                label="Yeni Şifre"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Yeni şifrenizi giriniz"
                leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
                rightIcon={
                  <Button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    variant="ghost"
                    size="sm"
                    className="p-0"
                  >
                    {showPasswords.new ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                  </Button>
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />

              {/* Password Strength Indicator */}
              {formData.newPassword && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>Şifre Gücü:</span>
                    <span className={`font-medium ${
                      passwordStrength.score <= 2 ? 'text-red-600' : 
                      passwordStrength.score <= 3 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {getStrengthText()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
                      style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    />
                  </div>
                  {passwordStrength.feedback.length > 0 && (
                    <ul className="mt-2 text-xs text-gray-600">
                      {passwordStrength.feedback.map((item, index) => (
                        <li key={index} className="flex items-center">
                          <span className="w-1 h-1 bg-gray-400 rounded-full mr-2" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>            {/* Confirm Password */}
            <div>
              <FormInput
                type={showPasswords.confirm ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                label="Yeni Şifre (Tekrar)"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Yeni şifrenizi tekrar giriniz"
                leftIcon={<Lock className="h-5 w-5 text-gray-400" />}
                rightIcon={
                  <Button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    variant="ghost"
                    size="sm"
                    className="p-0"
                  >
                    {showPasswords.confirm ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                  </Button>
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">Şifreler eşleşmiyor</p>
              )}
            </div>

            {/* Message */}
            {message.text && (
              <div className={`p-3 rounded-lg flex items-center ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-800' 
                  : 'bg-red-50 text-red-800'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle className="h-5 w-5 mr-2" />
                ) : (
                  <AlertCircle className="h-5 w-5 mr-2" />
                )}
                {message.text}
              </div>
            )}            {/* Submit Button */}
            <Button
              type="submit"
              disabled={passwordStrength.score < 3}
              loading={loading}
              loadingText="Değiştiriliyor..."
              className="w-full"
              size="lg"
            >
              Şifre Değiştir
            </Button>
          </form>
        </div>

        {/* Security Tips */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Güvenlik İpuçları:</h3>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Şifrenizi düzenli olarak değiştirin</li>
            <li>• Farklı hesaplar için farklı şifreler kullanın</li>
            <li>• Şifrenizi kimseyle paylaşmayın</li>
            <li>• Şüpheli aktivite durumunda hemen şifrenizi değiştirin</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
