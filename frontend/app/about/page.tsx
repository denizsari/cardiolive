'use client';

import Header from '../components/Header';
import Footer from '../components/Footer';

export default function AboutUs() {
  return (
    <div className="flex flex-col min-h-screen bg-white" style={{ fontFamily: 'var(--font-inter)' }}>
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Hakkımızda</h1>
        <div className="flex flex-col md:flex-row items-start">
          <img src="/about/about-image.jpg" alt="Cardiolive" className="w-full md:w-1/3 rounded-lg shadow-md mb-4 md:mb-0 md:mr-8" />
          <div>
            <p className="text-lg text-gray-700 mb-4">
              Cardiolive, Ege'nin en kaliteli zeytinlerinden elde edilen doğal ve organik zeytinyağlarını sunar. 
              Geleneksel yöntemlerle üretilen zeytinyağlarımız, sağlığınıza katkıda bulunurken, lezzetiyle de sofralarınızı zenginleştirir.
            </p>
            <p className="text-lg text-gray-700 mb-4">
              Misyonumuz, doğallığı ve kaliteyi ön planda tutarak, müşterilerimize en iyi zeytinyağını sunmaktır. 
              Çevre dostu üretim yöntemlerimizle, sürdürülebilir bir gelecek için çalışıyoruz.
            </p>
            <p className="text-lg text-gray-700 mb-4">
              Cardiolive ailesi olarak, siz değerli müşterilerimize en iyi hizmeti sunmak için buradayız. 
              Ürünlerimiz ve hizmetlerimiz hakkında daha fazla bilgi almak için bizimle iletişime geçebilirsiniz.
            </p>
            <p className="text-lg text-gray-700">
              Zeytinyağlarımız, Ege'nin bereketli topraklarında yetişen zeytinlerden elde edilir. 
              Her bir damla, doğanın sunduğu en saf ve doğal lezzeti sofralarınıza taşır. 
              Cardiolive olarak, kaliteyi ve doğallığı bir araya getirerek, sağlıklı bir yaşam tarzını destekliyoruz.
              Ürünlerimiz, uluslararası kalite standartlarına uygun olarak üretilmekte ve paketlenmektedir. 
              Müşteri memnuniyeti odaklı hizmet anlayışımızla, sizlere en iyi deneyimi sunmayı hedefliyoruz.
            </p>
          </div>
        </div>
      </main>

      <Footer className="mt-auto" />
    </div>
  );
} 