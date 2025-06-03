'use client';

import Header from '../components/Header';
import Footer from '../components/Footer';
import { FileText, Scale, Shield, AlertCircle, CheckCircle, Users } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'var(--font-inter)' }}>
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="text-center mb-12">
          <Scale className="w-16 h-16 text-[#70BB1B] mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Kullanım Şartları</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Cardiolive e-ticaret platformunu kullanarak aşağıdaki şartları kabul etmiş sayılırsınız. 
            Lütfen bu şartları dikkatlice okuyunuz.
          </p>
        </div>

        <div className="space-y-8">
          {/* Genel Bilgiler */}
          <section className="bg-blue-50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <FileText className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Genel Şartlar</h2>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Platform Tanımı:</h3>
                <p className="text-gray-700">
                  Cardiolive, kaliteli zeytinyağı ve doğal ürünlerin satışını gerçekleştiren bir e-ticaret platformudur. 
                  Bu platform üzerinden yapılan tüm işlemler aşağıdaki şartlara tabidir.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Kabul ve Onay:</h3>
                <p className="text-gray-700">
                  Sitemize kayıt olarak veya ürün sipariş ederek bu kullanım şartlarını kabul etmiş sayılırsınız. 
                  Bu şartları kabul etmiyorsanız, platformu kullanmamanızı rica ederiz.
                </p>
              </div>
            </div>
          </section>

          {/* Kullanıcı Sorumlulukları */}
          <section className="bg-green-50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Users className="w-6 h-6 text-green-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Kullanıcı Sorumlulukları</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Hesap Güvenliği:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-1 mr-2 flex-shrink-0" />
                    <span>Doğru ve güncel bilgi verme</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-1 mr-2 flex-shrink-0" />
                    <span>Şifre güvenliğini sağlama</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-1 mr-2 flex-shrink-0" />
                    <span>Hesap bilgilerini koruma</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-1 mr-2 flex-shrink-0" />
                    <span>Yetkisiz kullanımı bildirme</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Yasaklı Davranışlar:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <AlertCircle className="w-4 h-4 text-red-600 mt-1 mr-2 flex-shrink-0" />
                    <span>Sahte bilgi verme</span>
                  </li>
                  <li className="flex items-start">
                    <AlertCircle className="w-4 h-4 text-red-600 mt-1 mr-2 flex-shrink-0" />
                    <span>Platform güvenliğini tehdit etme</span>
                  </li>
                  <li className="flex items-start">
                    <AlertCircle className="w-4 h-4 text-red-600 mt-1 mr-2 flex-shrink-0" />
                    <span>Fikri mülkiyet haklarını ihlal etme</span>
                  </li>
                  <li className="flex items-start">
                    <AlertCircle className="w-4 h-4 text-red-600 mt-1 mr-2 flex-shrink-0" />
                    <span>Spam veya zararlı içerik paylaşma</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Sipariş ve Ödeme */}
          <section className="bg-yellow-50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Shield className="w-6 h-6 text-yellow-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Sipariş ve Ödeme Şartları</h2>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Sipariş Süreci:</h3>
                <div className="bg-white rounded-lg p-4">
                  <ol className="list-decimal list-inside space-y-2 text-gray-700">
                    <li>Ürün seçimi ve sepete ekleme</li>
                    <li>Teslimat ve fatura bilgilerinin girilmesi</li>
                    <li>Ödeme yönteminin seçilmesi</li>
                    <li>Sipariş onayı ve faturalama</li>
                    <li>Ürün hazırlama ve kargo sürecileri</li>
                    <li>Teslimat ve müşteri onayı</li>
                  </ol>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Ödeme Yöntemleri:</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Kredi kartı (Visa, MasterCard)</li>
                    <li>Banka kartı</li>
                    <li>Havale/EFT</li>
                    <li>Kapıda ödeme</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Fiyat Politikası:</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Fiyatlar KDV dahildir</li>
                    <li>Kargo bedeli ayrıca belirtilir</li>
                    <li>Kampanya şartları geçerlidir</li>
                    <li>Fiyat değişikliği hakkı saklıdır</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Teslimat ve İade */}
          <section className="bg-purple-50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <CheckCircle className="w-6 h-6 text-purple-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Teslimat ve İade Şartları</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Teslimat Koşulları:</h3>
                <div className="bg-white rounded-lg p-4 space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900">Teslimat Süresi:</h4>
                    <p className="text-sm text-gray-700">1-3 iş günü (il içi)</p>
                    <p className="text-sm text-gray-700">2-5 iş günü (il dışı)</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Kargo Bedeli:</h4>
                    <p className="text-sm text-gray-700">150 TL üzeri siparişlerde ücretsiz</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Teslimat Saatleri:</h4>
                    <p className="text-sm text-gray-700">09:00 - 18:00 arası</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-3">İade Koşulları:</h3>
                <div className="bg-white rounded-lg p-4 space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900">İade Süresi:</h4>
                    <p className="text-sm text-gray-700">Teslim tarihinden itibaren 14 gün</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">İade Şartları:</h4>
                    <p className="text-sm text-gray-700">Ürün ambalajı açılmamış olmalı</p>
                    <p className="text-sm text-gray-700">Hijyen koşulları sağlanmalı</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">İade Süreci:</h4>
                    <p className="text-sm text-gray-700">5-7 iş günü içinde ödeme iadesi</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Fikri Mülkiyet */}
          <section className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Shield className="w-6 h-6 text-gray-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Fikri Mülkiyet Hakları</h2>
            </div>
            <div className="space-y-4">
              <p className="text-gray-700">
                Cardiolive platformunda yer alan tüm içerik, tasarım, logo, yazılım ve diğer materyaller 
                telif hakkı ve fikri mülkiyet yasaları ile korunmaktadır.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Korunan İçerikler:</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Site tasarımı ve arayüzü</li>
                    <li>Ürün fotoğrafları ve açıklamaları</li>
                    <li>Logo ve marka unsurları</li>
                    <li>Yazılım ve kod yapısı</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Yasak Kullanımlar:</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>İzinsiz kopyalama</li>
                    <li>Ticari amaçlı kullanım</li>
                    <li>Değiştirerek dağıtma</li>
                    <li>Ters mühendislik</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Sorumluluk Sınırlamaları */}
          <section className="bg-red-50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Sorumluluk Sınırlamaları</h2>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Platform Kullanımı:</h3>
                <p className="text-gray-700">
                  Cardiolive, platform kullanımından doğabilecek teknik sorunlar, veri kaybı veya 
                  hizmet kesintilerinden kaynaklanan zararlardan sorumlu tutulamaz.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Üçüncü Taraf Hizmetleri:</h3>
                <p className="text-gray-700">
                  Ödeme, kargo ve diğer üçüncü taraf hizmetlerinden kaynaklanan sorunlarda 
                  sorumluluğumuz ilgili hizmet sağlayıcının şartları ile sınırlıdır.
                </p>
              </div>
            </div>
          </section>

          {/* Değişiklikler */}
          <section className="bg-gray-100 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Şartlarda Değişiklik</h2>
            <p className="text-gray-700 mb-4">
              Cardiolive, kullanım şartlarını önceden haber vermeksizin değiştirme hakkını saklı tutar. 
              Değişiklikler web sitemizde yayınlandığı tarihte yürürlüğe girer.
            </p>
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Bildirim Yöntemleri:</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Web sitesi üzerinden duyuru</li>
                <li>Kayıtlı e-posta adresine bildirim</li>
                <li>Mobil uygulama bildirimi</li>
              </ul>
            </div>
          </section>

          {/* İletişim */}
          <section className="bg-blue-100 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">İletişim ve Şikayetler</h2>
            <p className="text-gray-700 mb-4">
              Kullanım şartları hakkında sorularınız veya şikayetleriniz için:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-900">Müşteri Hizmetleri:</h3>
                <p className="text-gray-700">info@cardiolive.com</p>
                <p className="text-gray-700">+90 541 555 55 75</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Hukuki İşler:</h3>
                <p className="text-gray-700">legal@cardiolive.com</p>
                <p className="text-gray-700">Çalışma Saatleri: 09:00 - 18:00</p>
              </div>
            </div>
          </section>

          {/* Son Güncelleme */}
          <div className="text-center text-sm text-gray-500 pt-8 border-t">
            <p>Bu kullanım şartları son olarak 2 Haziran 2025 tarihinde güncellenmiştir.</p>
            <p className="mt-2">Yürürlük tarihi: 2 Haziran 2025</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
