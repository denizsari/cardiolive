'use client';

import { ProductImage } from '../ui/OptimizedImage';
import { Star } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';

// Swiper stilleri
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const testimonials = [
  {
    id: 1,
    name: 'Ayşe Yılmaz',
    location: 'İzmir',
    image: '/testimonials/avatar1.jpg',
    rating: 5,
    comment: 'Cardiolive\'ın zeytinyağları gerçekten eşsiz bir lezzete sahip. Özellikle erken hasat zeytinyağı favorim oldu. Ailem ve ben artık başka marka kullanmıyoruz.',
    title: 'Düzenli Müşteri'
  },
  {
    id: 2,
    name: 'Mehmet Demir',
    location: 'İstanbul',
    image: '/testimonials/avatar2.jpg',
    rating: 5,
    comment: 'Organik üretim ve sürdürülebilir tarım konusundaki hassasiyetleri takdire şayan. Ürünlerin kalitesi ve müşteri hizmetleri mükemmel.',
    title: 'Gurme Restaurant Şefi'
  },
  {
    id: 3,
    name: 'Zeynep Kaya',
    location: 'Ankara',
    image: '/testimonials/avatar3.jpg',
    rating: 5,
    comment: 'Soğuk sıkım zeytinyağlarının tadı ve aroması muhteşem. Salatalarda kullanıyorum ve farkı hemen hissediliyor. Kesinlikle tavsiye ederim.',
    title: 'Sağlıklı Yaşam Koçu'
  },
  {
    id: 4,
    name: 'Ali Öztürk',
    location: 'Bursa',
    image: '/testimonials/avatar4.jpg',
    rating: 5,
    comment: 'Sipariş verdiğim ürünler özenle paketlenmiş şekilde zamanında geldi. Ürün kalitesi ve hizmet anlayışları için teşekkürler.',
    title: 'Sertifikalı Tadım Uzmanı'
  }
];

export default function Testimonials() {
  const renderStars = (rating: number) => {
    return Array(rating).fill(0).map((_, index) => (
      <Star key={index} className="w-4 h-4 fill-[#70BB1B] text-[#70BB1B]" />
    ));
  };

  return (
    <section className="py-20 bg-gradient-to-br from-[#F8F9FA] to-[#E8F5E8]" style={{ fontFamily: 'var(--font-inter)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Başlık */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Sizden Gelenler
          </h2>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed">
            Müşterilerimizin deneyimleri ve değerlendirmeleri bizim için çok değerli. İşte onların Cardiolive hakkında söyledikleri.
          </p>
        </div>        {/* Testimonial Slider */}
        <Swiper
          modules={[Pagination, Autoplay]}
          pagination={{ 
            clickable: true,
            bulletClass: 'swiper-pagination-bullet testimonial-bullet',
            bulletActiveClass: 'swiper-pagination-bullet-active testimonial-bullet-active'
          }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          breakpoints={{
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          spaceBetween={32}
          loop={true}
          className="testimonials-slider !pb-16"
        >
          {testimonials.map((testimonial) => (
            <SwiperSlide key={testimonial.id}>
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col border border-gray-100 hover:border-[#70BB1B]/20 group">
                
                {/* Tırnak İşareti */}
                <div className="text-[#70BB1B] mb-6">
                  <svg className="w-8 h-8 opacity-60" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
                  </svg>
                </div>                {/* Yorum */}
                <p className="text-gray-700 text-lg leading-relaxed flex-grow mb-6 italic">
                  &ldquo;{testimonial.comment}&rdquo;
                </p>

                {/* Yıldızlar */}
                <div className="flex mb-6">
                  {renderStars(testimonial.rating)}
                </div>

                {/* Alt Kısım: Profil Bilgileri */}
                <div className="flex items-center pt-4 border-t border-gray-100">
                  {/* Profil Görseli */}
                  <div className="relative w-14 h-14 rounded-full overflow-hidden mr-4 ring-2 ring-[#70BB1B]/20 group-hover:ring-[#70BB1B]/40 transition-all duration-300">
                    <ProductImage
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="object-cover w-full h-full"
                    />
                  </div>

                  {/* İsim ve Bilgiler */}
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg">{testimonial.name}</h3>
                    <p className="text-[#70BB1B] font-medium text-sm">{testimonial.title}</p>
                    <p className="text-gray-500 text-sm flex items-center mt-1">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      {testimonial.location}
                    </p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>        {/* Özel Stil */}
        <style jsx>{`
          :global(.testimonial-bullet) {
            background: #D1D5DB !important;
            width: 12px !important;
            height: 12px !important;
            border-radius: 50% !important;
            transition: all 0.3s ease !important;
            margin: 0 6px !important;
          }

          :global(.testimonial-bullet-active) {
            background: #70BB1B !important;
            transform: scale(1.3) !important;
            box-shadow: 0 0 10px rgba(112, 187, 27, 0.4) !important;
          }

          :global(.testimonials-slider .swiper-pagination) {
            bottom: 0 !important;
          }
        `}</style>
      </div>
    </section>
  );
} 