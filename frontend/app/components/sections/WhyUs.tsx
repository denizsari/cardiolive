'use client';

import { Leaf, Award, ThumbsUp, Truck } from 'lucide-react';

const features = [
  {
    icon: Leaf,
    title: 'Doğal ve Organik',
    description: 'Hiçbir katkı maddesi kullanmadan, doğanın bize sunduğu en saf haliyle'
  },
  {
    icon: Award,
    title: 'Kalite Garantisi',
    description: 'En yüksek kalite standartlarında üretim ve sürekli kalite kontrolleri'
  },
  {
    icon: ThumbsUp,
    title: 'Müşteri Memnuniyeti',
    description: '20 yılı aşkın tecrübemizle müşterilerimizin güvenini kazanıyoruz'
  },
  {
    icon: Truck,
    title: 'Hızlı Teslimat',
    description: 'Siparişleriniz özenle paketlenerek en kısa sürede kapınıza teslim edilir'
  }
];

export default function WhyUs() {
  return (
    <section className="py-20 bg-gray-50" style={{ fontFamily: 'var(--font-inter)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Neden Bizi Tercih Etmelisiniz?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Kaliteli zeytinyağı üretiminde 20 yılı aşkın tecrübemizle, doğallığı ve lezzeti bir arada sunuyoruz
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index}
                className="bg-white p-8 rounded-lg text-center hover:shadow-lg transition-shadow duration-300"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#70BB1B] bg-opacity-10 mb-6">
                  <Icon className="w-8 h-8 text-[#70BB1B]" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
} 