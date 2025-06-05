'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { ProductImage } from '../ui/OptimizedImage';
import Button from '../ui/Button';

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
          {/* Sol: Görsel */}          <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
            <ProductImage
              src="/about/olive-field.jpg"
              alt="Cardiolive Zeytin Bahçeleri"
              className="object-cover w-full h-full"
            />
          </div>          {/* Sağ: SSS */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                En Çok Sorulanlar
              </h2>
              <p className="text-gray-600 text-lg">
                Zeytinyağlarımız hakkında merak ettikleriniz
              </p>
            </div>            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div 
                  key={index} 
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-[#70BB1B]/20"
                >
                  <Button
                    variant="ghost"
                    className="w-full flex items-center justify-between text-left p-6 hover:bg-gray-50/50 transition-all duration-200 group"
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  >
                    <span className="text-gray-900 font-semibold text-lg pr-6 flex-1 group-hover:text-gray-800">
                      {faq.question}
                    </span>
                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-[#70BB1B]/10 hover:bg-[#70BB1B]/20 transition-all duration-300 group-hover:scale-110 group-hover:shadow-md">
                      {openIndex === index ? (
                        <Minus className="h-5 w-5 text-[#70BB1B] font-bold" strokeWidth={2.5} />
                      ) : (
                        <Plus className="h-5 w-5 text-[#70BB1B] font-bold" strokeWidth={2.5} />
                      )}
                    </div>
                  </Button>                  {openIndex === index && (
                    <div className="px-6 pb-6 pt-0 animate-in slide-in-from-top-2 duration-300">
                      <div className="text-gray-600 leading-relaxed text-base border-t border-gray-100 pt-5 mt-2">
                        {faq.answer}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div><div className="text-center lg:text-left pt-6">
              <Button 
                variant="outline"
                className="inline-flex items-center text-[#70BB1B] border-[#70BB1B] hover:bg-[#70BB1B] hover:text-white transition-all duration-300 px-6 py-3 rounded-lg font-medium"
              >
                Daha Fazla Soru
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 