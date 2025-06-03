'use client';

import { Shield, Database, Eye, Lock, UserCheck, FileText } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function KisiselVerilerPolitikasiPage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'var(--font-inter)' }}>
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="text-center mb-12">
          <Shield className="w-16 h-16 text-[#70BB1B] mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Kişisel Veriler Politikası</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Cardiolive olarak kişisel verilerinizin güvenliği bizim için büyük önem taşımaktadır. 
            6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında verilerinizi nasıl işlediğimizi açıklıyoruz.
          </p>
        </div>

        <div className="space-y-8">
          {/* Veri Sorumlusu */}
          <section className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Database className="w-6 h-6 text-[#70BB1B] mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Veri Sorumlusu</h2>
            </div>
            <div className="space-y-4">
              <p className="text-gray-700">
                KVKK kapsamında veri sorumlusu sıfatıyla hareket eden şirketimiz:
              </p>
              <div className="bg-white rounded-lg p-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Şirket Bilgileri:</h3>
                    <ul className="text-gray-700 space-y-1">
                      <li><strong>Unvan:</strong> Cardiolive Sağlık Ürünleri Ltd. Şti.</li>
                      <li><strong>Adres:</strong> [Şirket Adresi], İstanbul</li>
                      <li><strong>Telefon:</strong> +90 541 555 55 75</li>
                      <li><strong>E-posta:</strong> info@cardiolive.com</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">KVKK İletişim:</h3>
                    <ul className="text-gray-700 space-y-1">
                      <li><strong>KVKK Sorumlusu:</strong> [İsim Soyisim]</li>
                      <li><strong>E-posta:</strong> kvkk@cardiolive.com</li>
                      <li><strong>Telefon:</strong> +90 541 555 55 76</li>
                      <li><strong>Adres:</strong> Yukarıda belirtilen adres</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* İşlenen Kişisel Veriler */}
          <section className="bg-blue-50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Eye className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">İşlenen Kişisel Veriler</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Kimlik Verileri:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Ad, soyad</li>
                  <li>Doğum tarihi (isteğe bağlı)</li>
                  <li>TC kimlik numarası (gerekli durumlarda)</li>
                  <li>Fotoğraf (profil resmi)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-3">İletişim Verileri:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>E-posta adresi</li>
                  <li>Telefon numarası</li>
                  <li>Adres bilgileri</li>
                  <li>İl, ilçe bilgisi</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Müşteri İşlem Verileri:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Sipariş geçmişi</li>
                  <li>Ödeme bilgileri</li>
                  <li>Alışveriş tercihleri</li>
                  <li>Favori ürün listeleri</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Dijital İz Verileri:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>IP adresi</li>
                  <li>Çerez verileri</li>
                  <li>Site kullanım logları</li>
                  <li>Cihaz bilgileri</li>
                </ul>
              </div>
            </div>
          </section>

          {/* İşleme Amaçları */}
          <section className="bg-green-50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Lock className="w-6 h-6 text-green-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Kişisel Verilerin İşlenme Amaçları</h2>
            </div>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Temel Hizmet Amaçları:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-green-600 rounded-full mt-2 mr-3"></span>
                      <span className="text-gray-700">Üyelik işlemlerinin yürütülmesi</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-green-600 rounded-full mt-2 mr-3"></span>
                      <span className="text-gray-700">Sipariş ve teslimat süreçlerinin yönetimi</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-green-600 rounded-full mt-2 mr-3"></span>
                      <span className="text-gray-700">Ödeme işlemlerinin gerçekleştirilmesi</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-green-600 rounded-full mt-2 mr-3"></span>
                      <span className="text-gray-700">Müşteri hizmetleri desteği</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Ek Hizmet Amaçları:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-green-600 rounded-full mt-2 mr-3"></span>
                      <span className="text-gray-700">Kişiselleştirilmiş ürün önerileri</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-green-600 rounded-full mt-2 mr-3"></span>
                      <span className="text-gray-700">Pazarlama ve reklam faaliyetleri</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-green-600 rounded-full mt-2 mr-3"></span>
                      <span className="text-gray-700">Site performansının analizi</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-green-600 rounded-full mt-2 mr-3"></span>
                      <span className="text-gray-700">Güvenlik ve dolandırıcılık önleme</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* İşleme Hukuki Sebepleri */}
          <section className="bg-yellow-50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <FileText className="w-6 h-6 text-yellow-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">İşlemenin Hukuki Sebepleri</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">KVKK Madde 5/2 Kapsamında:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li><strong>a)</strong> Açık rızanız</li>
                  <li><strong>c)</strong> Hukuki yükümlülüğün yerine getirilmesi</li>
                  <li><strong>e)</strong> Bir hakkın tesisi, kullanılması veya korunması</li>
                  <li><strong>f)</strong> Meşru menfaatlerimizin temini</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-3">İlgili Mevzuat:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• 6563 sayılı Elektronik Ticaret Kanunu</li>
                  <li>• 6502 sayılı Tüketicinin Korunması Hakkında Kanun</li>
                  <li>• 5464 sayılı Banka Kartları ve Kredi Kartları Kanunu</li>
                  <li>• Vergi mevzuatı gereği</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Veri Güvenliği */}
          <section className="bg-purple-50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Lock className="w-6 h-6 text-purple-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Veri Güvenliği Önlemleri</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Teknik Güvenlik:</h3>
                <ul className="text-gray-700 space-y-1">
                  <li>• 256-bit SSL/TLS şifreleme</li>
                  <li>• Güvenli veri tabanı sistemi</li>
                  <li>• Düzenli güvenlik güncellemeleri</li>
                  <li>• Erişim kontrolü ve loglama</li>
                  <li>• Firewall ve antivirus koruması</li>
                </ul>
              </div>
              <div className="bg-white rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">İdari Güvenlik:</h3>
                <ul className="text-gray-700 space-y-1">
                  <li>• Personel eğitim programları</li>
                  <li>• Gizlilik sözleşmeleri</li>
                  <li>• Yetki yönetim sistemi</li>
                  <li>• Düzenli güvenlik denetimleri</li>
                  <li>• Olay müdahale prosedürleri</li>
                </ul>
              </div>
            </div>
          </section>

          {/* KVKK Hakları */}
          <section className="bg-red-50 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <UserCheck className="w-6 h-6 text-red-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">KVKK Kapsamındaki Haklarınız</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Temel Haklarınız:</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-red-600 rounded-full mt-2 mr-3"></span>
                    <span className="text-gray-700">Kişisel verilerinizin işlenip işlenmediğini öğrenme</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-red-600 rounded-full mt-2 mr-3"></span>
                    <span className="text-gray-700">İşlenmişse buna ilişkin bilgi talep etme</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-red-600 rounded-full mt-2 mr-3"></span>
                    <span className="text-gray-700">İşlenme amacını öğrenme</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-red-600 rounded-full mt-2 mr-3"></span>
                    <span className="text-gray-700">Yurt içi/yurt dışı aktarım bilgisi</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Düzeltme ve Silme Hakları:</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-red-600 rounded-full mt-2 mr-3"></span>
                    <span className="text-gray-700">Eksik/yanlış verilerin düzeltilmesini isteme</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-red-600 rounded-full mt-2 mr-3"></span>
                    <span className="text-gray-700">Verilerin silinmesini/yok edilmesini isteme</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-red-600 rounded-full mt-2 mr-3"></span>
                    <span className="text-gray-700">İşlemeye itiraz etme</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-red-600 rounded-full mt-2 mr-3"></span>
                    <span className="text-gray-700">Zararın giderilmesini talep etme</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Başvuru Yöntemleri */}
          <section className="bg-gray-100 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">KVKK Başvuru Yöntemleri</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Elektronik Başvuru:</h3>
                <div className="space-y-2">
                  <p className="text-gray-700"><strong>E-posta:</strong> kvkk@cardiolive.com</p>
                  <p className="text-gray-700"><strong>Konu:</strong> "KVKK Başvurusu" yazınız</p>
                  <p className="text-gray-700"><strong>İçerik:</strong> Kimlik bilgileri ve talebinizi detaylı açıklayınız</p>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Yazılı Başvuru:</h3>
                <div className="space-y-2">
                  <p className="text-gray-700"><strong>Adres:</strong></p>
                  <p className="text-gray-700">
                    Cardiolive Sağlık Ürünleri Ltd. Şti.<br />
                    KVKK Birimi<br />
                    [Şirket Adresi]<br />
                    İstanbul, Türkiye
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 p-4 bg-yellow-100 rounded-lg">
              <p className="text-gray-700">
                <strong>Yanıt Süresi:</strong> Başvurularınız en geç 30 gün içinde yanıtlanacaktır. 
                Talebinizin niteliğine göre bu süre KVKK'da öngörülen şekilde uzatılabilir.
              </p>
            </div>
          </section>

          {/* Çerez Politikası */}
          <section className="bg-indigo-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Çerez (Cookie) Politikası</h2>
            <div className="space-y-4">
              <p className="text-gray-700">
                Web sitemizde kullanıcı deneyimini iyileştirmek ve site performansını analiz etmek amacıyla çerezler kullanılmaktadır.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Zorunlu Çerezler</h3>
                  <p className="text-sm text-gray-700">Site işlevselliği için gerekli olan çerezler</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Analitik Çerezler</h3>
                  <p className="text-sm text-gray-700">Site kullanım istatistikleri için</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Pazarlama Çerezleri</h3>
                  <p className="text-sm text-gray-700">Kişiselleştirilmiş reklam içeriği için</p>
                </div>
              </div>
            </div>
          </section>

          {/* İletişim */}
          <section className="bg-gray-100 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">İletişim</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Genel Sorular:</h3>
                <p className="text-gray-700">info@cardiolive.com</p>
                <p className="text-gray-700">+90 541 555 55 75</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">KVKK Başvuruları:</h3>
                <p className="text-gray-700">kvkk@cardiolive.com</p>
                <p className="text-gray-700">+90 541 555 55 76</p>
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
