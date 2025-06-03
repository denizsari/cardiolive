'use client';

import { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Phone, Mail, MessageCircle, ShoppingCart, Package, CreditCard, Shield, Heart } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface FAQItem {
  id: number;
  category: string;
  question: string;
  answer: string;
  icon: React.ComponentType<any>;
}

const faqData: FAQItem[] = [
  // Genel Sorular
  {
    id: 1,
    category: 'Genel',
    question: 'Cardiolive nedir ve ne tür ürünler satmaktadır?',
    answer: 'Cardiolive, kaliteli sağlık ürünleri ve zeytinyağı çeşitleri satan bir e-ticaret platformudur. Doğal, organik ve sertifikalı ürünler sunarak müşterilerimizin sağlıklı yaşam tarzına katkıda bulunmayı hedefliyoruz. Ürün portföyümüzde extra virgin zeytinyağı, organik gıda takviyeleri, doğal kozmetik ürünleri ve sağlık destekleyici besinler bulunmaktadır.',
    icon: Heart
  },
  {
    id: 2,
    category: 'Genel',
    question: 'Ürünlerinizin kalitesi nasıl garanti edilmektedir?',
    answer: 'Tüm ürünlerimiz uluslararası kalite standartlarına uygun olarak üretilmekte ve düzenli olarak test edilmektedir. Organik sertifikalarımız mevcuttur ve her ürün için menşe belgesi ve kalite analiz raporları sunulmaktadır. Ayrıca müşteri memnuniyeti garantisi ile güvenle alışveriş yapabilirsiniz.',
    icon: Shield
  },
  {
    id: 3,
    category: 'Genel',
    question: 'Hangi bölgelere teslimat yapıyorsunuz?',
    answer: 'Türkiye\'nin tüm illerine teslimat yapmaktayız. Büyük şehirlerde 1-2 iş günü, diğer illerde 2-4 iş günü içinde ürünleriniz elinizde olur. Kargo takip numaranızı e-posta ve SMS ile paylaşıyoruz.',
    icon: Package
  },
  
  // Sipariş ve Teslimat
  {
    id: 4,
    category: 'Sipariş ve Teslimat',
    question: 'Sipariş nasıl verebilirim?',
    answer: 'Web sitemizden üye olarak veya üye olmadan sipariş verebilirsiniz. Ürünleri sepetinize ekleyin, adres bilgilerinizi girin ve ödeme yönteminizi seçin. Onay e-postası aldıktan sonra siparişiniz hazırlanmaya başlar.',
    icon: ShoppingCart
  },
  {
    id: 5,
    category: 'Sipariş ve Teslimat',
    question: 'Minimum sipariş tutarı var mı?',
    answer: 'Minimum sipariş tutarımız 100 TL\'dir. 250 TL ve üzeri siparişlerde kargo ücretsizdir. Bu tutarın altındaki siparişlerde 15 TL kargo ücreti uygulanır.',
    icon: ShoppingCart
  },
  {
    id: 6,
    category: 'Sipariş ve Teslimat',
    question: 'Siparişimi nasıl takip edebilirim?',
    answer: 'Sipariş verdikten sonra e-posta ile gönderilen takip linkini kullanabilir veya "Sipariş Takibi" sayfasından sipariş numaranızı girerek durumunu kontrol edebilirsiniz. Ayrıca her aşamada SMS bildirimi alırsınız.',
    icon: Package
  },
  {
    id: 7,
    category: 'Sipariş ve Teslimat',
    question: 'Teslimat süreleri ne kadar?',
    answer: 'İstanbul, Ankara, İzmir için 1-2 iş günü; diğer iller için 2-4 iş günü teslimat süresi vardır. Hafta sonu ve resmi tatillerde teslimat yapılmamaktadır. Acil teslimat seçeneği için ek ücret alınır.',
    icon: Package
  },
  {
    id: 8,
    category: 'Sipariş ve Teslimat',
    question: 'Adresimde yokken teslimat nasıl olur?',
    answer: 'Adresinizde olmamanız durumunda kargo şirketi size ulaşır ve yeni bir teslimat zamanı planlar. 3 başarısız teslimat denemesinden sonra kargo şubeden teslim alınabilir. Komşu teslimi yapmayı tercih ediyorsanız sipariş notunda belirtebilirsiniz.',
    icon: Package
  },

  // Ödeme
  {
    id: 9,
    category: 'Ödeme',
    question: 'Hangi ödeme yöntemlerini kabul ediyorsunuz?',
    answer: 'Kredi kartı (Visa, MasterCard, American Express), banka kartı, kapıda ödeme ve havale/EFT seçenekleri mevcuttur. Kredi kartı ile 3, 6, 9 ve 12 taksit imkanı sunuyoruz. Tüm ödeme işlemleri SSL güvenliği ile korunmaktadır.',
    icon: CreditCard
  },
  {
    id: 10,
    category: 'Ödeme',
    question: 'Taksit seçenekleri nelerdir?',
    answer: '100 TL ve üzeri alışverişlerde taksit imkanı sunuyoruz: 3 taksit (150 TL üzeri), 6 taksit (300 TL üzeri), 9 taksit (500 TL üzeri), 12 taksit (750 TL üzeri). Bazı bankalar için özel kampanyalar ve faizsiz taksit seçenekleri mevcuttur.',
    icon: CreditCard
  },
  {
    id: 11,
    category: 'Ödeme',
    question: 'Kapıda ödeme seçeneği var mı?',
    answer: 'Evet, kapıda ödeme seçeneği mevcuttur. Nakit veya kredi kartı ile ödeme yapabilirsiniz. Kapıda ödeme için 500 TL limitimiz vardır ve ek 5 TL hizmet bedeli alınır.',
    icon: CreditCard
  },
  {
    id: 12,
    category: 'Ödeme',
    question: 'Ödeme güvenliği nasıl sağlanıyor?',
    answer: 'Tüm ödeme işlemleri 256-bit SSL şifreleme ile korunmaktadır. Kredi kartı bilgileriniz bizim sunucularımızda saklanmaz. PCI DSS standartlarına uygun güvenli ödeme altyapısı kullanıyoruz. 3D Secure doğrulama zorunludur.',
    icon: Shield
  },

  // Üyelik ve Hesap
  {
    id: 13,
    category: 'Üyelik ve Hesap',
    question: 'Üye olmadan alışveriş yapabilir miyim?',
    answer: 'Evet, misafir kullanıcı olarak da alışveriş yapabilirsiniz. Ancak üye olmanız durumunda sipariş geçmişinizi görüntüleyebilir, favori ürünler oluşturabilir ve özel kampanyalardan haberdar olabilirsiniz.',
    icon: Heart
  },
  {
    id: 14,
    category: 'Üyelik ve Hesap',
    question: 'Şifremi unuttum, ne yapmalıyım?',
    answer: 'Giriş sayfasındaki "Şifremi Unuttum" linkine tıklayarak e-posta adresinizi girin. Size şifre sıfırlama linki gönderilecektir. Bu link ile yeni şifrenizi belirleyebilirsiniz.',
    icon: Shield
  },
  {
    id: 15,
    category: 'Üyelik ve Hesap',
    question: 'Hesabımı nasıl silebilirim?',
    answer: 'Hesabınızı silmek için müşteri hizmetlerine başvurmanız gerekmektedir. KVKK kapsamında kişisel verilerinizin silinmesi talebi için kvkk@cardiolive.com adresine e-posta gönderebilirsiniz.',
    icon: Shield
  },

  // İade ve Değişim
  {
    id: 16,
    category: 'İade ve Değişim',
    question: 'İade koşullarınız nelerdir?',
    answer: 'Ürünü teslim aldıktan sonra 14 gün içinde iade edebilirsiniz. Ürün orijinal ambalajında, etiketleri sağlam ve kullanılmamış olmalıdır. Hijyen ürünleri ve gıda takviyeleri açıldıktan sonra iade edilemez.',
    icon: Package
  },
  {
    id: 17,
    category: 'İade ve Değişim',
    question: 'İade sürecim nasıl işler?',
    answer: 'Müşteri hizmetleri ile iletişime geçin, iade formunu doldurun ve ürünü kargo ile gönderin. Ürün kontrolünden geçtikten sonra 3-5 iş günü içinde para iadesi yapılır. Kredi kartına iade 2-10 iş günü sürebilir.',
    icon: Package
  },
  {
    id: 18,
    category: 'İade ve Değişim',
    question: 'Kargo masrafını kim karşılar?',
    answer: 'Bizden kaynaklı sorunlarda (yanlış/hasarlı ürün) kargo masrafını biz karşılarız. Müşteri kaynaklı iadeler için kargo masrafı müşteriye aittir. İade kargo masrafı ortalama 15-25 TL arasındadır.',
    icon: Package
  },

  // Ürün ve Kalite
  {
    id: 19,
    category: 'Ürün ve Kalite',
    question: 'Ürünleriniz organik midir?',
    answer: 'Ürün sayfalarında "Organik" etiketli ürünlerimiz organik sertifikalıdır. Sertifika belgelerini ürün detay sayfalarında görüntüleyebilirsiniz. Organik olmayan ürünler için de kalite sertifikalarımız mevcuttur.',
    icon: Heart
  },
  {
    id: 20,
    category: 'Ürün ve Kalite',
    question: 'Son kullanma tarihleri nasıl kontrol ediliyor?',
    answer: 'Tüm ürünlerin son kullanma tarihleri düzenli olarak kontrol edilir. Minimum 6 ay ömrü kalan ürünler sevk edilir. Son kullanma tarihi yakın ürünler özel indirimli satışa sunulur ve açıkça belirtilir.',
    icon: Shield
  },
  {
    id: 21,
    category: 'Ürün ve Kalite',
    question: 'Ürünlerin saklama koşulları nasıl olmalı?',
    answer: 'Her ürünün saklama koşulları ürün etiketinde ve web sitesinde belirtilmiştir. Genel olarak serin, kuru ve güneş almayan yerlerde saklanmalıdır. Özel saklama gerektiren ürünler soğuk zincir ile gönderilir.',
    icon: Package
  }
];

const categories = ['Tümü', 'Genel', 'Sipariş ve Teslimat', 'Ödeme', 'Üyelik ve Hesap', 'İade ve Değişim', 'Ürün ve Kalite'];

export default function SikcaSorulanlarPage() {
  const [activeCategory, setActiveCategory] = useState('Tümü');
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFAQs = faqData.filter(item => {
    const matchesCategory = activeCategory === 'Tümü' || item.category === activeCategory;
    const matchesSearch = searchTerm === '' || 
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleItem = (id: number) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: React.ComponentType<any> } = {
      'Genel': HelpCircle,
      'Sipariş ve Teslimat': Package,
      'Ödeme': CreditCard,
      'Üyelik ve Hesap': Shield,
      'İade ve Değişim': Package,
      'Ürün ve Kalite': Heart
    };
    return iconMap[category] || HelpCircle;
  };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'var(--font-inter)' }}>
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Başlık */}
        <div className="text-center mb-12">
          <HelpCircle className="w-16 h-16 text-[#70BB1B] mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Sıkça Sorulan Sorular</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Cardiolive hakkında merak ettiğiniz konularda size yardımcı olmak için 
            en sık sorulan soruları derledik. Aradığınızı bulamıyorsanız bizimle iletişime geçin.
          </p>
        </div>

        {/* Arama */}
        <div className="mb-8">
          <div className="max-w-md mx-auto">
            <input
              type="text"
              placeholder="Soru ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#70BB1B] focus:border-[#70BB1B]"
            />
          </div>
        </div>

        {/* Kategori Filtreleri */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === category
                    ? 'bg-[#70BB1B] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Listesi */}
        <div className="space-y-4 mb-12">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((item) => {
              const IconComponent = getCategoryIcon(item.category);
              const isOpen = openItems.includes(item.id);

              return (
                <div key={item.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <IconComponent className="w-5 h-5 text-[#70BB1B] mr-3 flex-shrink-0" />
                      <div>
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          {item.category}
                        </span>
                        <h3 className="text-lg font-medium text-gray-900 mt-1">
                          {item.question}
                        </h3>
                      </div>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    )}
                  </button>
                  
                  {isOpen && (
                    <div className="px-6 pb-4">
                      <div className="pl-8">
                        <p className="text-gray-700 leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                Aradığınız kriterlere uygun soru bulunamadı.
              </p>
            </div>
          )}
        </div>

        {/* Yardım İhtiyacı */}
        <div className="bg-gradient-to-r from-[#70BB1B] to-green-600 rounded-lg p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">
            Aradığınız cevabı bulamadınız mı?
          </h2>
          <p className="text-green-100 mb-6">
            Müşteri hizmetleri ekibimiz size yardımcı olmaktan mutluluk duyar.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="bg-white/10 rounded-lg p-4">
              <Phone className="w-8 h-8 mx-auto mb-3" />
              <h3 className="font-medium mb-2">Telefon</h3>
              <p className="text-sm text-green-100 mb-3">
                Pazartesi-Cuma 09:00-18:00
              </p>
              <a 
                href="tel:+905415555575" 
                className="text-white underline hover:no-underline"
              >
                +90 541 555 55 75
              </a>
            </div>
            
            <div className="bg-white/10 rounded-lg p-4">
              <Mail className="w-8 h-8 mx-auto mb-3" />
              <h3 className="font-medium mb-2">E-posta</h3>
              <p className="text-sm text-green-100 mb-3">
                24 saat içinde yanıt
              </p>
              <a 
                href="mailto:info@cardiolive.com" 
                className="text-white underline hover:no-underline"
              >
                info@cardiolive.com
              </a>
            </div>
            
            <div className="bg-white/10 rounded-lg p-4">
              <MessageCircle className="w-8 h-8 mx-auto mb-3" />
              <h3 className="font-medium mb-2">Canlı Destek</h3>
              <p className="text-sm text-green-100 mb-3">
                Anlık mesajlaşma
              </p>
              <button className="text-white underline hover:no-underline">
                Sohbeti Başlat
              </button>
            </div>
          </div>
        </div>

        {/* Popüler Kategoriler */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Popüler Konular
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.slice(1).map((category) => {
              const IconComponent = getCategoryIcon(category);
              const categoryCount = faqData.filter(item => item.category === category).length;
              
              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className="bg-gray-50 rounded-lg p-6 text-left hover:bg-gray-100 transition-colors group"
                >
                  <IconComponent className="w-8 h-8 text-[#70BB1B] mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="font-medium text-gray-900 mb-2">{category}</h3>
                  <p className="text-sm text-gray-500">
                    {categoryCount} soru
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
