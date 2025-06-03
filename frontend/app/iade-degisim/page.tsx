'use client';

import { Package, ArrowLeftRight, Clock, CheckCircle, AlertTriangle, Phone, Mail } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function IadeDegisimPage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'var(--font-inter)' }}>
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="text-center mb-12">
          <Package className="w-16 h-16 text-[#70BB1B] mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">İade & Değişim</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Cardiolive olarak müşteri memnuniyeti bizim için önceliklidir. 
            İade ve değişim süreçlerimizle ilgili detaylı bilgileri aşağıda bulabilirsiniz.
          </p>
        </div>

        <div className="space-y-8">
          {/* İade Koşulları */}
          <section className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <ArrowLeftRight className="w-6 h-6 text-[#70BB1B] mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">İade Koşulları</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">İade Edilebilir Ürünler:</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-1 mr-2 flex-shrink-0" />
                    <span className="text-gray-700">Orijinal ambalajında ve etiketlerinde olan ürünler</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-1 mr-2 flex-shrink-0" />
                    <span className="text-gray-700">Hijyen şartları bozulmamış ürünler</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-1 mr-2 flex-shrink-0" />
                    <span className="text-gray-700">Son kullanma tarihi geçmemiş ürünler</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-1 mr-2 flex-shrink-0" />
                    <span className="text-gray-700">Hasarsız ve kullanılmamış ürünler</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-3">İade Edilemeyen Ürünler:</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <AlertTriangle className="w-4 h-4 text-red-600 mt-1 mr-2 flex-shrink-0" />
                    <span className="text-gray-700">Kişisel hijyen ürünleri (açılmış)</span>
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="w-4 h-4 text-red-600 mt-1 mr-2 flex-shrink-0" />
                    <span className="text-gray-700">Bozulabilir gıda ürünleri</span>
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="w-4 h-4 text-red-600 mt-1 mr-2 flex-shrink-0" />
                    <span className="text-gray-700">Özel sipariş üretilmiş ürünler</span>
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="w-4 h-4 text-red-600 mt-1 mr-2 flex-shrink-0" />
                    <span className="text-gray-700">İndirimli veya kampanyalı ürünler (belirtilen durumlarda)</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* İade Süreci */}
          <section className="bg-blue-50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Clock className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">İade Süreci</h2>
            </div>
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">İade Süresi:</h3>
                  <div className="bg-white rounded-lg p-4">
                    <ul className="space-y-2 text-gray-700">
                      <li><strong>Standart Ürünler:</strong> Teslim tarihinden itibaren 14 gün</li>
                      <li><strong>Sağlık Ürünleri:</strong> Teslim tarihinden itibaren 7 gün</li>
                      <li><strong>Özel Kampanya Ürünleri:</strong> Kampanya koşullarına göre</li>
                      <li><strong>Hatalı Teslimat:</strong> Teslim tarihinden itibaren 3 gün</li>
                    </ul>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">İade Adımları:</h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-sm font-bold rounded-full mr-3 mt-0.5">1</span>
                      <span className="text-gray-700">Müşteri hizmetleri ile iletişime geçin</span>
                    </div>
                    <div className="flex items-start">
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-sm font-bold rounded-full mr-3 mt-0.5">2</span>
                      <span className="text-gray-700">İade formunu doldurun</span>
                    </div>
                    <div className="flex items-start">
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-sm font-bold rounded-full mr-3 mt-0.5">3</span>
                      <span className="text-gray-700">Ürünü orijinal ambalajında hazırlayın</span>
                    </div>
                    <div className="flex items-start">
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-sm font-bold rounded-full mr-3 mt-0.5">4</span>
                      <span className="text-gray-700">Kargo ile gönderim yapın</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Değişim Koşulları */}
          <section className="bg-green-50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <ArrowLeftRight className="w-6 h-6 text-green-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Değişim Koşulları</h2>
            </div>
            <div className="space-y-4">
              <p className="text-gray-700">
                Aynı ürünün farklı bedeni, rengi veya çeşidi ile değişim yapabilirsiniz.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Değişim Yapılabilir:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-1 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">Aynı ürün grubunda farklı beden</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-1 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">Aynı ürün grubunda farklı aroma/çeşit</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-1 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">Bozuk/hasarlı ürün teslimatı</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-1 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">Yanlış ürün teslimatı</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Fiyat Farkı Durumları:</h3>
                  <div className="bg-white rounded-lg p-4 space-y-2">
                    <p className="text-gray-700">
                      <strong>Daha Pahalı Ürün:</strong> Fark tutarını ödemeniz gerekir
                    </p>
                    <p className="text-gray-700">
                      <strong>Daha Ucuz Ürün:</strong> Fark tutarı hesabınıza iade edilir
                    </p>
                    <p className="text-gray-700">
                      <strong>Aynı Fiyat:</strong> Ek ödeme gerekmez
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Kargo ve Masraflar */}
          <section className="bg-yellow-50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Package className="w-6 h-6 text-yellow-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Kargo ve Masraflar</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Bizden Kaynaklı:</h3>
                <div className="bg-white rounded-lg p-4">
                  <ul className="space-y-2 text-gray-700">
                    <li>• Yanlış ürün gönderimi</li>
                    <li>• Hasarlı/bozuk ürün teslimatı</li>
                    <li>• Eksik ürün gönderimi</li>
                    <li>• Son kullanma tarihi geçmiş ürün</li>
                  </ul>
                  <p className="mt-3 font-medium text-green-600">
                    ✓ Kargo masrafı tarafımızdan karşılanır
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Müşteriden Kaynaklı:</h3>
                <div className="bg-white rounded-lg p-4">
                  <ul className="space-y-2 text-gray-700">
                    <li>• Fikir değiştirme</li>
                    <li>• Yanlış sipariş verme</li>
                    <li>• Beğenmeme</li>
                    <li>• Beden/aroma değişikliği</li>
                  </ul>
                  <p className="mt-3 font-medium text-red-600">
                    ✗ Kargo masrafı müşteriye aittir
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* İade Şekilleri */}
          <section className="bg-purple-50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <CheckCircle className="w-6 h-6 text-purple-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">İade Şekilleri</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-4 text-center">
                <h3 className="font-medium text-gray-900 mb-3">Kredi Kartına İade</h3>
                <p className="text-sm text-gray-700 mb-2">
                  Ödeme yaptığınız kredi kartına iade
                </p>
                <p className="text-xs text-gray-500">
                  Süre: 2-10 iş günü
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <h3 className="font-medium text-gray-900 mb-3">Banka Hesabına İade</h3>
                <p className="text-sm text-gray-700 mb-2">
                  Belirttiğiniz IBAN'a havale
                </p>
                <p className="text-xs text-gray-500">
                  Süre: 1-3 iş günü
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <h3 className="font-medium text-gray-900 mb-3">Alışveriş Kredisi</h3>
                <p className="text-sm text-gray-700 mb-2">
                  Hesabınızda kullanabileceğiniz kredi
                </p>
                <p className="text-xs text-gray-500">
                  Süre: Anında
                </p>
              </div>
            </div>
          </section>

          {/* Hızlı İade Formu */}
          <section className="bg-indigo-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Hızlı İade Başvurusu</h2>
            <div className="bg-white rounded-lg p-6">
              <form className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sipariş Numarası
                    </label>
                    <input
                      type="text"
                      placeholder="ÖRN: CD2025060001"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#70BB1B] focus:border-[#70BB1B]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      E-posta Adresiniz
                    </label>
                    <input
                      type="email"
                      placeholder="ornek@email.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#70BB1B] focus:border-[#70BB1B]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    İade Sebebi
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#70BB1B] focus:border-[#70BB1B]">
                    <option value="">Sebep seçiniz</option>
                    <option value="fikir-degistirme">Fikir değiştirme</option>
                    <option value="yanlis-urun">Yanlış ürün gönderildi</option>
                    <option value="hasarli-urun">Hasarlı ürün geldi</option>
                    <option value="beden-problemi">Beden uygun değil</option>
                    <option value="kalite-problemi">Kalite beklentimi karşılamadı</option>
                    <option value="diger">Diğer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Açıklama (İsteğe Bağlı)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="İade sebebinizi detaylandırabilirsiniz..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#70BB1B] focus:border-[#70BB1B]"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#70BB1B] text-white py-3 px-4 rounded-lg hover:bg-[#5da015] transition-colors font-medium"
                >
                  İade Başvurusu Gönder
                </button>
              </form>
            </div>
          </section>

          {/* İletişim Bilgileri */}
          <section className="bg-gray-100 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">İletişim ve Destek</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <Phone className="w-5 h-5 text-[#70BB1B] mr-2" />
                  <h3 className="font-medium text-gray-900">Telefon Desteği</h3>
                </div>
                <p className="text-gray-700 mb-2">+90 541 555 55 75</p>
                <p className="text-sm text-gray-500">
                  Pazartesi - Cuma: 09:00 - 18:00<br />
                  Cumartesi: 09:00 - 15:00
                </p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <Mail className="w-5 h-5 text-[#70BB1B] mr-2" />
                  <h3 className="font-medium text-gray-900">E-posta Desteği</h3>
                </div>
                <p className="text-gray-700 mb-2">iade@cardiolive.com</p>
                <p className="text-sm text-gray-500">
                  24 saat içinde yanıt alırsınız
                </p>
              </div>
            </div>
          </section>

          {/* Yasal Haklar */}
          <section className="bg-red-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Tüketici Hakları</h2>
            <div className="space-y-4">
              <p className="text-gray-700">
                6502 sayılı Tüketicinin Korunması Hakkında Kanun gereğince, 
                cayma hakkınızı kullanarak 14 gün içinde hiçbir gerekçe göstermeksizin 
                ürünü iade edebilirsiniz.
              </p>
              <div className="bg-white rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Önemli Hatırlatmalar:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Cayma hakkı sadece internet alışverişlerinde geçerlidir</li>
                  <li>Ürün teslim tarihinden itibaren 14 gün süreniz vardır</li>
                  <li>Ürünün orijinal durumunda olması şarttır</li>
                  <li>Hijyen açısından iade edilemeyecek ürünler vardır</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Son Güncelleme */}
          <div className="text-center text-sm text-gray-500 pt-8 border-t">
            <p>Bu politika son olarak 2 Haziran 2025 tarihinde güncellenmiştir.</p>
            <p className="mt-2">Şartlar önceden haber verilmeksizin değiştirilebilir.</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
