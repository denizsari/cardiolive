'use client';

import Header from '../components/Header';
import Footer from '../components/Footer';
import { Scale, Shield } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'var(--font-inter)' }}>
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="text-center mb-12">
          <Scale className="w-16 h-16 text-[#70BB1B] mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Kullanım Şartları</h1>
          <p className="text-gray-700 max-w-2xl mx-auto">
            Kardiyolive platformunu kullanarak bu şartları kabul etmiş olursunuz
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          {/* Genel Şartlar */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-[#70BB1B] rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">1</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Genel Şartlar</h2>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="font-medium text-gray-900 mb-2">Platform Tanımı:</h3>
              <p className="text-gray-700">
                Kardiyolive, premium zeytinyağı ve doğal ürünlerin satışını gerçekleştiren 
                bir e-ticaret platformudur. Platform, Kardiyolive markası tarafından işletilmektedir.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-medium text-gray-900 mb-2">Kabul ve Onay:</h3>
              <p className="text-gray-700">
                Bu web sitesini kullanarak, burada belirtilen tüm şart ve koşulları 
                okuduğunuzu, anladığınızı ve kabul ettiğinizi beyan edersiniz. 
                Eğer bu şartları kabul etmiyorsanız, lütfen siteyi kullanmayınız.
              </p>
            </div>
          </div>

          {/* Kullanıcı Sorumlulukları */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-[#70BB1B] rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">2</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Kullanıcı Sorumlulukları</h2>
            </div>

            <div className="space-y-6">
              <h3 className="font-medium text-gray-900 mb-3">Hesap Güvenliği:</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-[#70BB1B] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Hesap bilgilerinizin gizliliğini sağlamak
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-[#70BB1B] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Şifrenizi güvenli tutmak ve düzenli olarak değiştirmek
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-[#70BB1B] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Hesabınızdan gerçekleştirilen tüm işlemlerde sorumluluk almak
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-[#70BB1B] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Şüpheli aktiviteleri derhal bildirmek
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-[#70BB1B] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Doğru ve güncel bilgi sağlamak
                </li>
              </ul>

              <h3 className="font-medium text-gray-900 mb-3">Yasaklı Davranışlar:</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Platform güvenliğini tehdit edici faaliyetler
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Sahte bilgi ve belge kullanımı
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Diğer kullanıcıları rahatsız edici davranışlar
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Telif hakklarını ihlal eden içerik paylaşımı
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  Spam ve otomatik mesaj gönderimi
                </li>
              </ul>
            </div>
          </div>

          {/* Sipariş ve Ödeme Şartları */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-[#70BB1B] rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">3</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Sipariş ve Ödeme Şartları</h2>
            </div>

            <div className="space-y-6">
              <h3 className="font-medium text-gray-900 mb-3">Sipariş Süreci:</h3>
              
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Ürün seçimi ve sepete ekleme</li>
                <li>Teslimat adresi ve iletişim bilgilerinin girilmesi</li>
                <li>Ödeme yönteminin seçilmesi</li>
                <li>Sipariş onayının verilmesi</li>
                <li>E-posta ile sipariş doğrulaması</li>
                <li>Kargo takip bilgilerinin iletilmesi</li>
                <li>Ürün teslimatı ve onayı</li>
              </ol>

              <h3 className="font-medium text-gray-900 mb-2">Ödeme Yöntemleri:</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Kredi Kartı (Visa, Mastercard, American Express)</li>
                <li>Banka Kartı</li>
                <li>Havale/EFT</li>
                <li>Kapıda Ödeme (Nakit veya Kredi Kartı)</li>
              </ul>

              <h3 className="font-medium text-gray-900 mb-2">Fiyat Politikası:</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Fiyatlar KDV dahildir</li>
                <li>Özel indirimler belirtilen süre içinde geçerlidir</li>
                <li>Fiyat hatalarından sorumlu değiliz</li>
                <li>Kampanya şartları ayrıca belirtilir</li>
              </ul>
            </div>
          </div>

          {/* Teslimat ve İade Şartları */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-[#70BB1B] rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">4</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Teslimat ve İade Şartları</h2>
            </div>

            <div className="space-y-6">
              <h3 className="font-medium text-gray-900 mb-3">Teslimat Koşulları:</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900">Teslimat Süresi:</h4>
                  <p className="text-sm text-gray-700">1-3 iş günü (il içi)</p>
                  <p className="text-sm text-gray-700">2-5 iş günü (il dışı)</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900">Kargo Bedeli:</h4>
                  <p className="text-sm text-gray-700">150 TL üzeri siparişlerde ücretsiz</p>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900">Teslimat Saatleri:</h4>
                  <p className="text-sm text-gray-700">09:00 - 18:00 arası</p>
                </div>
              </div>

              <h3 className="font-medium text-gray-900 mb-3">İade Koşulları:</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900">İade Süresi:</h4>
                  <p className="text-sm text-gray-700">Teslim tarihinden itibaren 14 gün</p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900">İade Şartları:</h4>
                  <p className="text-sm text-gray-700">Ürün ambalajı açılmamış olmalı</p>
                  <p className="text-sm text-gray-700">Hijyen koşulları sağlanmalı</p>
                </div>
                
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900">İade Süreci:</h4>
                  <p className="text-sm text-gray-700">5-7 iş günü içinde ödeme iadesi</p>
                </div>
              </div>
            </div>
          </div>

          {/* Fikri Mülkiyet Hakları */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Shield className="w-6 h-6 text-gray-800 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Fikri Mülkiyet Hakları</h2>
            </div>
            
            <p className="text-gray-700">
              Bu web sitesindeki tüm içerik (metin, resim, logo, tasarım vb.) 
              Kardiyolive'e aittir ve telif hakları ile korunmaktadır.
            </p>

            <h3 className="font-medium text-gray-900 mb-2">Korunan İçerikler:</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Marka logosu ve tasarımlar</li>
              <li>Ürün fotoğrafları ve açıklamaları</li>
              <li>Web sitesi tasarımı ve kodları</li>
              <li>Yazılı içerikler ve makaleler</li>
            </ul>

            <h3 className="font-medium text-gray-900 mb-2">Yasak Kullanımlar:</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>İçeriği izinsiz kopyalama</li>
              <li>Ticari amaçlı kullanım</li>
              <li>Değiştirerek yeniden dağıtım</li>
              <li>Rekabet amaçlı kullanım</li>
            </ul>
          </div>

          {/* Sorumluluk Sınırlamaları */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-[#70BB1B] rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">5</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Sorumluluk Sınırlamaları</h2>
            </div>

            <h3 className="font-medium text-gray-900 mb-2">Platform Kullanımı:</h3>
            <p className="text-gray-700">
              Platform "olduğu gibi" sunulmaktadır. Kardiyolive, platformun 
              kesintisiz çalışacağını veya hatasız olacağını garanti etmez.
            </p>

            <h3 className="font-medium text-gray-900 mb-2">Üçüncü Taraf Hizmetleri:</h3>
            <p className="text-gray-700">
              Platform üzerinde yer alan üçüncü taraf bağlantıları ve hizmetlerinden 
              Kardiyolive sorumlu değildir.
            </p>
          </div>

          {/* Şartlarda Değişiklik */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Şartlarda Değişiklik</h2>
            <p className="text-gray-700 mb-4">
              Kardiyolive, bu kullanım şartlarını önceden bildirim yapmaksızın 
              değiştirme hakkını saklı tutar.
            </p>

            <h3 className="font-medium text-gray-900 mb-2">Bildirim Yöntemleri:</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Web sitesi üzerinden duyuru</li>
              <li>E-posta bildirimi</li>
              <li>SMS bildirimi</li>
            </ul>
          </div>

          {/* İletişim ve Şikayetler */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">İletişim ve Şikayetler</h2>
            <p className="text-gray-700 mb-4">
              Bu kullanım şartları ile ilgili sorularınız için bizimle iletişime geçebilirsiniz.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900">Müşteri Hizmetleri:</h3>
                <p className="text-gray-700">info@Kardiyolive.com</p>
                <p className="text-gray-700">+90 541 555 55 75</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900">Hukuki İşler:</h3>
                <p className="text-gray-700">legal@Kardiyolive.com</p>
                <p className="text-gray-700">Çalışma Saatleri: 09:00 - 18:00</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-600 pt-8 border-t">
          <p>Son güncelleme: 2024 - Bu şartlar Türkiye Cumhuriyeti kanunlarına tabidir.</p>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
