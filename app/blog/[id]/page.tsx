'use client';

import { useParams } from 'next/navigation';
import Header from '../../components/Header';

// Örnek blog verisi
const blogs = [
  {
    id: 1,
    title: 'Zeytinyağının Faydaları',
    content: 'Zeytinyağının sağlığa olan faydaları ve günlük yaşamda kullanımı hakkında detaylı bilgi...',
    image: '/blog/blog1.jpg',
    date: '15 Mayıs 2024'
  },
  {
    id: 2,
    title: 'Organik Tarımın Önemi',
    content: 'Organik tarımın çevre ve insan sağlığı üzerindeki etkileri hakkında detaylı bilgi...',
    image: '/blog/blog2.jpg',
    date: '10 Mayıs 2024'
  },
  {
    id: 3,
    title: 'Zeytinyağının Faydaları ve Kullanım Alanları',
    content: `Zeytinyağı, Akdeniz mutfağının vazgeçilmez bir parçası olarak bilinir. Ancak, zeytinyağının faydaları sadece lezzetiyle sınırlı değildir. İşte zeytinyağının sağlığa olan faydaları ve günlük yaşamda nasıl kullanılabileceği hakkında detaylı bilgiler.

### Zeytinyağının Sağlığa Faydaları

1. **Kalp Sağlığını Destekler:** Zeytinyağı, tekli doymamış yağ asitleri bakımından zengindir. Bu yağlar, kötü kolesterol seviyelerini düşürmeye yardımcı olabilir ve kalp sağlığını destekler.

2. **Antioksidan Kaynağıdır:** Zeytinyağı, E vitamini ve polifenoller gibi güçlü antioksidanlar içerir. Bu bileşenler, vücudu serbest radikallerin zararlı etkilerinden korur.

3. **Enflamasyonu Azaltır:** Zeytinyağında bulunan oleokantal, doğal bir anti-enflamatuar bileşiktir. Bu, vücuttaki iltihaplanmayı azaltmaya yardımcı olabilir.

### Zeytinyağının Kullanım Alanları

- **Mutfakta:** Zeytinyağı, salatalardan kızartmalara kadar geniş bir kullanım yelpazesine sahiptir. Özellikle sızma zeytinyağı, salatalara ve soğuk yemeklere lezzet katmak için idealdir.

- **Cilt Bakımı:** Zeytinyağı, doğal bir nemlendirici olarak kullanılabilir. Cildi besler ve yumuşatır.

- **Saç Bakımı:** Zeytinyağı, saçları güçlendirmek ve parlaklık kazandırmak için kullanılabilir. Haftada bir kez saç maskesi olarak uygulanabilir.

### Sonuç

Zeytinyağı, hem sağlık hem de güzellik için çok yönlü bir üründür. Doğal ve organik zeytinyağlarını tercih ederek, bu mucizevi yağın tüm faydalarından yararlanabilirsiniz.`,
    image: '/blog/blog3.jpg',
    date: '20 Mayıs 2024'
  },
  // Diğer bloglar...
];

export default function BlogDetail() {
  const params = useParams();
  const blogId = params.id ? (Array.isArray(params.id) ? parseInt(params.id[0]) : parseInt(params.id)) : null;
  const blog = blogs.find(blog => blog.id === blogId);

  if (!blog) {
    return <p>Blog bulunamadı.</p>;
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'var(--font-inter)' }}>
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{blog.title}</h1>
        <p className="text-xs text-gray-500 mb-8">{blog.date}</p>
        <div className="relative aspect-[16/9] mb-8">
          <img
            src={blog.image}
            alt={blog.title}
            className="object-cover w-full h-full"
          />
        </div>
        <p className="text-gray-600 leading-relaxed">{blog.content}</p>
      </main>
    </div>
  );
} 