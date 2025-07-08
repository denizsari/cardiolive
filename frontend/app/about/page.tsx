'use client';

import { ProductImage } from '../components/ui/OptimizedImage';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function AboutUs() {
  return (
    <div className="flex flex-col min-h-screen bg-white" style={{ fontFamily: 'var(--font-inter)' }}>
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 page-content pb-8 sm:pb-12 md:pb-16">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-800 mb-6 sm:mb-8">Hakkımızda</h1>        <div className="flex flex-col md:flex-row items-start gap-6 md:gap-8">          <div className="relative w-full md:w-1/3 h-48 sm:h-56 md:h-auto md:aspect-square rounded-lg overflow-hidden shadow-md">
            <ProductImage 
              src="/about/about-image.jpg" 
              alt="Kardiyolive" 
              className="object-cover w-full h-full"
            />
          </div>
          <div className="flex-1"><p className="text-sm sm:text-base md:text-lg text-neutral-700 mb-3 sm:mb-4 leading-relaxed">
              Kardiyolive, Ege&apos;nin en kaliteli zeytinlerinden elde edilen doğal ve organik zeytinyağlarını sunar. 
              Geleneksel yöntemlerle üretilen zeytinyağlarımız, sağlığınıza katkıda bulunurken, lezzetiyle de sofralarınızı zenginleştirir.
            </p>
            <p className="text-sm sm:text-base md:text-lg text-neutral-700 mb-3 sm:mb-4 leading-relaxed">
              Misyonumuz, doğallığı ve kaliteyi ön planda tutarak, müşterilerimize en iyi zeytinyağını sunmaktır. 
              Çevre dostu üretim yöntemlerimizle, sürdürülebilir bir gelecek için çalışıyoruz.
            </p>
            <p className="text-sm sm:text-base md:text-lg text-neutral-700 mb-3 sm:mb-4 leading-relaxed">
              Kardiyolive ailesi olarak, siz değerli müşterilerimize en iyi hizmeti sunmak için buradayız. 
              Ürünlerimiz ve hizmetlerimiz hakkında daha fazla bilgi almak için bizimle iletişime geçebilirsiniz.
            </p>            <p className="text-sm sm:text-base md:text-lg text-neutral-700 leading-relaxed">
              Zeytinyağlarımız, Ege&apos;nin bereketli topraklarında yetişen zeytinlerden elde edilir. 
              Her bir damla, doğanın sunduğu en saf ve doğal lezzeti sofralarınıza taşır. 
              Kardiyolive olarak, kaliteyi ve doğallığı bir araya getirerek, sağlıklı bir yaşam tarzını destekliyoruz.
              Ürünlerimiz, uluslararası kalite standartlarına uygun olarak üretilmekte ve paketlenmektedir. 
              Müşteri memnuniyeti odaklı hizmet anlayışımızla, sizlere en iyi deneyimi sunmayı hedefliyoruz.
            </p>
          </div>
        </div>
      </main>      <Footer />
    </div>
  );
}