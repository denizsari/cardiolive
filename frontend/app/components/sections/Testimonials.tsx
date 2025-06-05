'use client';

import { ProductImage } from '../ui/OptimizedImage';
import { Star } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

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
      <Star key={index} className="w-5 h-5 fill-[#FFD700] text-[#FFD700]" />
    ));
  };

  return (
    <section className="py-16 bg-[#F8F9FA]" style={{ fontFamily: 'var(--font-inter)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Başlık */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Sizden Gelenler
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Müşterilerimizin deneyimleri ve değerlendirmeleri bizim için çok değerli. İşte onların Cardiolive hakkında söyledikleri.
          </p>
        </div>

        {/* Testimonial Slider */}
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          navigation
          pagination={{ clickable: true }}
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
          className="testimonials-slider !pb-14"
        >
          {testimonials.map((testimonial) => (
            <SwiperSlide key={testimonial.id}>
              <div className="bg-white rounded-lg p-6 shadow-sm h-full flex flex-col">
                {/* Üst Kısım: Profil ve Değerlendirme */}
                <div className="flex items-start mb-4">
                  {/* Profil Görseli */}                  <div className="relative w-16 h-16 rounded-full overflow-hidden mr-4">
                    <ProductImage
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="object-cover w-full h-full"
                    />
                  </div>

                  {/* İsim ve Konum */}
                  <div>
                    <h3 className="font-semibold text-gray-900">{testimonial.name}</h3>
                    <p className="text-sm text-gray-500">{testimonial.location}</p>
                    <p className="text-sm text-[#70BB1B] mt-1">{testimonial.title}</p>
                  </div>
                </div>

                {/* Yıldızlar */}
                <div className="flex mb-4">
                  {renderStars(testimonial.rating)}
                </div>

                {/* Yorum */}
                <p className="text-gray-600 flex-grow">
                  {testimonial.comment}
                </p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Özel Stil */}
        <style>{`
          .testimonials-slider .swiper-button-next,
          .testimonials-slider .swiper-button-prev {
            color: #70BB1B !important;
          }

          .testimonials-slider .swiper-pagination-bullet {
            background: #70BB1B !important;
          }

          .testimonials-slider .swiper-pagination-bullet-active {
            background: #70BB1B !important;
          }
        `}</style>
      </div>
    </section>
  );
} 