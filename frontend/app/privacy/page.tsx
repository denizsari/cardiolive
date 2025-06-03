'use client';

import Header from '../components/Header';
import Footer from '../components/Footer';
import { Shield, Lock, Eye, Database, UserCheck, FileText } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'var(--font-inter)' }}>
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="text-center mb-12">
          <Shield className="w-16 h-16 text-[#70BB1B] mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Kişisel Veriler Politikası</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Cardiolive olarak kişisel verilerinizin güvenliği bizim için büyük önem taşımaktadır. 
            Bu politika, verilerinizi nasıl topladığımızı, işlediğimizi ve koruduğumuzu açıklar.
          </p>
        </div>

        <div className="space-y-8">
          {/* Veri Toplama */}
          <section className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Database className="w-6 h-6 text-[#70BB1B] mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Hangi Verileri Topluyoruz?</h2>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Kişisel Bilgiler:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Ad, soyad ve iletişim bilgileri</li>
                  <li>E-posta adresi ve telefon numarası</li>
                  <li>Teslimat ve fatura adresleri</li>
                  <li>Doğum tarihi (isteğe bağlı)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">İşlem Bilgileri:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Sipariş geçmişi ve tercihler</li>
                  <li>Ödeme bilgileri (güvenli şekilde işlenir)</li>
                  <li>Site kullanım istatistikleri</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Veri Kullanımı */}
          <section className="bg-blue-50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Eye className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Verilerinizi Nasıl Kullanıyoruz?</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Temel Hizmetler:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Sipariş işleme ve teslimat</li>
                  <li>Müşteri destek hizmetleri</li>
                  <li>Hesap yönetimi</li>
                  <li>Ödeme işlemleri</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Gelişmiş Hizmetler:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Kişiselleştirilmiş öneriler</li>
                  <li>Kampanya ve promosyon bildirimleri</li>
                  <li>Site deneyimi iyileştirmeleri</li>
                  <li>Güvenlik ve dolandırıcılık önleme</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Veri Güvenliği */}
          <section className="bg-green-50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Lock className="w-6 h-6 text-green-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Veri Güvenliği</h2>
            </div>
            <div className="space-y-4">
              <p className="text-gray-700">
                Verilerinizi korumak için endüstri standardı güvenlik önlemleri kullanıyoruz:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Teknik Güvenlik:</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• SSL/TLS şifreleme</li>
                    <li>• Güvenli veri tabanları</li>
                    <li>• Düzenli güvenlik güncellemeleri</li>
                    <li>• Erişim kontrolü ve izleme</li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Operasyonel Güvenlik:</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Personel eğitimleri</li>
                    <li>• Gizlilik sözleşmeleri</li>
                    <li>• Düzenli güvenlik denetimleri</li>
                    <li>• Olay müdahale prosedürleri</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Haklarınız */}
          <section className="bg-purple-50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <UserCheck className="w-6 h-6 text-purple-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Haklarınız</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">KVKK Kapsamında Haklarınız:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3"></span>
                    <span>Kişisel verilerinizin işlenip işlenmediğini öğrenme</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3"></span>
                    <span>İşlenmişse buna ilişkin bilgi talep etme</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3"></span>
                    <span>İşlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3"></span>
                    <span>Eksik veya yanlış işlenmiş verilerin düzeltilmesini isteme</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Nasıl Başvuru Yapabilirsiniz:</h3>
                <div className="bg-white rounded-lg p-4">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-900">E-posta:</h4>
                      <p className="text-sm text-gray-700">kvkk@cardiolive.com</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Posta Adresi:</h4>
                      <p className="text-sm text-gray-700">
                        Cardiolive KVKK Birimi<br />
                        [Adres bilgisi]<br />
                        İstanbul, Türkiye
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Yanıt Süresi:</h4>
                      <p className="text-sm text-gray-700">En geç 30 gün içinde</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Çerezler */}
          <section className="bg-yellow-50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <FileText className="w-6 h-6 text-yellow-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Çerez Politikası</h2>
            </div>
            <div className="space-y-4">
              <p className="text-gray-700">
                Web sitemizde kullanıcı deneyimini iyileştirmek için çerezler kullanıyoruz:
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Zorunlu Çerezler</h3>
                  <p className="text-sm text-gray-700">Site işlevselliği için gerekli</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Analitik Çerezler</h3>
                  <p className="text-sm text-gray-700">Site kullanım istatistikleri</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Pazarlama Çerezleri</h3>
                  <p className="text-sm text-gray-700">Kişiselleştirilmiş deneyim</p>
                </div>
              </div>
            </div>
          </section>

          {/* İletişim */}
          <section className="bg-gray-100 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">İletişim</h2>
            <p className="text-gray-700 mb-4">
              Kişisel veriler politikamız hakkında sorularınız için bizimle iletişime geçebilirsiniz:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-900">Genel Sorular:</h3>
                <p className="text-gray-700">info@cardiolive.com</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">KVKK Başvuruları:</h3>
                <p className="text-gray-700">kvkk@cardiolive.com</p>
              </div>
            </div>
          </section>

          {/* Son Güncelleme */}
          <div className="text-center text-sm text-gray-500 pt-8 border-t">
            <p>Bu politika son olarak 2 Haziran 2025 tarihinde güncellenmiştir.</p>
            <p className="mt-2">Değişiklikler web sitemizde yayınlandığı tarihte yürürlüğe girer.</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
