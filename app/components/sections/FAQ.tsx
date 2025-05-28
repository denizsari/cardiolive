'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import Image from 'next/image';

const faqs = [
  {
    question: 'Zeytinyağları nasıl temin edilmektedir?',
    answer: 'Cardiolive\'ın zeytinleri, Ege ve Akdeniz bölgesinin verimli topraklarından elde edilmektedir. Zeytinler el ile özenle toplanır ve soğuk sıkım yöntemiyle işlenir. Modern teknolojilerle donatılmış tesislerimizde hijyenik koşullarda üretim yapılır.'
  },
  {
    question: 'Zeytinyağları nasıl bu kadar düşük asit oranına sahip?',
    answer: 'Erken hasat döneminde toplanan zeytinler, hasattan hemen sonra soğuk sıkım yöntemiyle işlenir. Bu sayede asit oranı düşük, kaliteli zeytinyağı elde edilir.'
  },
  {
    question: 'Soğuk sıkım zeytinyağı neden tercih edilmelidir?',
    answer: 'Soğuk sıkım yöntemi, zeytinin besin değerlerini ve aromasını en iyi şekilde koruyan yöntemdir. Bu sayede antioksidanlar ve vitaminler korunur.'
  },
  {
    question: 'Ürünler zeytinyağı ile birlikte saklanabilir mi?',
    answer: 'Zeytinyağı doğal bir koruyucudur. Uygun koşullarda saklandığında ürünlerin raf ömrünü uzatır ve lezzetini korur.'
  },
  {
    question: 'Zeytinyağları neler ile tüketilmelidir?',
    answer: 'Zeytinyağı çok yönlü bir üründür. Salatalarda, yemeklerde, kahvaltılıkların yanında ve hatta tatlılarda bile kullanılabilir.'
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="relative bg-[#F8F9FA] py-16" style={{ fontFamily: 'var(--font-inter)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Sol: Görsel */}
          <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
            <Image
              src="/about/olive-field.jpg"
              alt="Cardiolive Zeytin Bahçeleri"
              fill
              className="object-cover"
            />
          </div>

          {/* Sağ: SSS */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              En Çok Sorulanlar
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b border-gray-200 pb-4">
                  <button
                    className="w-full flex items-center justify-between text-left"
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  >
                    <span className="text-gray-900 font-medium">{faq.question}</span>
                    <span className="ml-4 flex-shrink-0">
                      {openIndex === index ? (
                        <Minus className="h-5 w-5 text-[#70BB1B]" />
                      ) : (
                        <Plus className="h-5 w-5 text-[#70BB1B]" />
                      )}
                    </span>
                  </button>
                  {openIndex === index && (
                    <div className="mt-4 text-gray-600 leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="text-right pt-4">
              <a href="#" className="text-[#70BB1B] hover:underline text-sm font-medium inline-flex items-center">
                Daha Fazla Soru
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 