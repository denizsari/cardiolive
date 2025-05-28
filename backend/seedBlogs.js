// Test script - Bu dosyayı node ile çalıştırarak örnek blog verilerini MongoDB'ye ekleyebilirsiniz
// node seedBlogs.js

require('dotenv').config();
const mongoose = require('mongoose');
const Blog = require('./src/models/blogModel');

const sampleBlogs = [
  {
    title: 'Zeytinyağının Sağlığa Faydaları',
    summary: 'Zeytinyağının kalp sağlığından cilt bakımına kadar birçok alanda insan sağlığına olan etkileri hakkında detaylı bilgiler.',
    content: `Zeytinyağı, Akdeniz mutfağının vazgeçilmez bir parçası olarak bilinir. Ancak, zeytinyağının faydaları sadece lezzetiyle sınırlı değildir.

**Zeytinyağının Sağlığa Faydaları:**

1. **Kalp Sağlığını Destekler:** Zeytinyağı, tekli doymamış yağ asitleri bakımından zengindir. Bu yağlar, kötü kolesterol seviyelerini düşürmeye yardımcı olabilir.

2. **Antioksidan Kaynağıdır:** E vitamini ve polifenoller gibi güçlü antioksidanlar içerir.

3. **Enflamasyonu Azaltır:** Oleokantal bileşeni, doğal anti-enflamatuar özellikler taşır.

**Kullanım Alanları:**
- Mutfakta salata ve yemeklerde
- Cilt bakımında doğal nemlendirici olarak
- Saç bakımında güçlendirici maske olarak

Cardiolive olarak, en kaliteli zeytinyağlarını sofralarınıza sunmanın gururunu yaşıyoruz.`,
    image: '/blog/zeytinyagi-faydalari.jpg',
    author: 'Dr. Ayşe Kardiyolog',
    date: new Date()
  },
  {
    title: 'Organik Tarımın Önemi ve Cardiolive Farkı',
    summary: 'Organik tarımın çevre ve insan sağlığı üzerindeki etkileri ve Cardiolive\'ın sürdürülebilir üretim yaklaşımı.',
    content: `Organik tarım, doğal dengeyi koruyarak üretim yapan, çevre dostu bir tarım yöntemidir.

**Organik Tarımın Faydaları:**

1. **Kimyasal Kalıntı Yok:** Organik ürünlerde zararlı pestisit kalıntıları bulunmaz.

2. **Çevre Dostu:** Toprak, su ve hava kalitesini korur.

3. **Daha Besleyici:** Vitamin ve mineral içeriği daha yüksektir.

**Cardiolive'ın Organik Yaklaşımı:**

Zeytinlerimizi Ege'nin bereketli topraklarında, tamamen doğal yöntemlerle yetiştiriyoruz. Hiçbir kimyasal gübre veya pestisit kullanmıyoruz.

- Doğal gübrelemede kompost kullanımı
- Biyolojik mücadele yöntemleri
- Toprak analizi ve rotasyon sistemi
- Sürdürülebilir su yönetimi

Bu sayede hem çevreyi koruyor hem de en saf zeytinyağlarını üretiyoruz.`,
    image: '/blog/organik-tarim.jpg',
    author: 'Ziraat Mühendisi Mehmet Öztürk',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 1 hafta önce
  },
  {
    title: 'Soğuk Sıkım Zeytinyağı Nedir?',
    summary: 'Soğuk sıkım yönteminin zeytinyağının kalitesi ve besin değeri üzerindeki etkilerini keşfedin.',
    content: `Soğuk sıkım, zeytinyağı üretiminde kullanılan en kaliteli yöntemdir.

**Soğuk Sıkım Nedir?**

Zeytinlerin 27°C'nin altındaki sıcaklıklarda işlenerek yağının çıkarılması işlemidir. Bu yöntem:

- Zeytinyağının doğal aromасını korur
- Vitamin ve antioksidan kaybını minimuma indirir
- Asit oranını düşük tutar
- En saf tadı elde etmeyi sağlar

**Geleneksel vs Soğuk Sıkım:**

Geleneksel yöntemlerde yüksek sıcaklık kullanılırken, soğuk sıkımda sadece mekanik baskı uygulanır.

**Cardiolive Soğuk Sıkım Süreci:**

1. Zeytinler hasat edilir edilmez işleme alınır
2. Yıkama ve temizlik
3. Ezme (soğuk ortamda)
4. Malaksasyon (karıştırma)
5. Soğuk sıkım
6. Ayırma ve filtrasyon

Bu özenli süreç sayesinde, zeytinyağımızın tüm doğal özellikleri korunur.`,
    image: '/blog/soguk-sikim.jpg',
    author: 'Gıda Mühendisi Fatma Demir',
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) // 2 hafta önce
  }
];

async function seedBlogs() {
  try {
    // MongoDB'ye bağlan
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB\'ye bağlandı');

    // Mevcut blogları temizle (isteğe bağlı)
    await Blog.deleteMany({});
    console.log('Mevcut bloglar temizlendi');

    // Yeni blogları ekle
    const blogs = await Blog.insertMany(sampleBlogs);
    console.log(`${blogs.length} blog başarıyla eklendi`);

    // Bağlantıyı kapat
    await mongoose.connection.close();
    console.log('MongoDB bağlantısı kapatıldı');

  } catch (error) {
    console.error('Hata:', error);
    process.exit(1);
  }
}

// Script'i çalıştır
if (require.main === module) {
  seedBlogs();
}

module.exports = seedBlogs;
