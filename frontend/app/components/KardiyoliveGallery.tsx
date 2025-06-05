import { GalleryImage } from './ui/OptimizedImage';

const galleryImages = [
  {
    src: '/images/gallery/771A9890.JPG',
    alt: 'Kardiyolive zeytinlik arazisi',
    category: 'Üretim'
  },
  {
    src: '/images/gallery/771A9891.JPG',
    alt: 'Zeytin ağaçları',
    category: 'Üretim'
  },
  {
    src: '/images/gallery/771A9892.JPG',
    alt: 'Zeytin hasadı',
    category: 'Üretim'
  },
  {
    src: '/images/gallery/771A9895.JPG',
    alt: 'Geleneksel zeytin işleme',
    category: 'İşleme'
  },
  {
    src: '/images/gallery/771A9900.JPG',
    alt: 'Kalite kontrol',
    category: 'İşleme'
  },
  {
    src: '/images/gallery/771A9902.JPG',
    alt: 'Ambalajlama süreci',
    category: 'Üretim'
  },
  {
    src: '/images/gallery/771A9903.JPG',
    alt: 'Final ürünler',
    category: 'Ürün'
  },
  {
    src: '/images/gallery/771A9906.JPG',
    alt: 'Depo ve lojistik',
    category: 'Lojistik'
  },
  {
    src: '/images/gallery/CEF_0058.JPG',
    alt: 'Profesyonel ürün fotoğrafı',
    category: 'Ürün'
  },
  {
    src: '/images/gallery/CEF_0110.JPG',
    alt: 'Zeytin çeşitleri',
    category: 'Ürün'
  },
  {
    src: '/images/gallery/CEF_0114.JPG',
    alt: 'Premium ambalajlama',
    category: 'Ürün'
  },
  {
    src: '/images/gallery/CEF_0160.JPG',
    alt: 'Kardiyolive marka görseli',
    category: 'Marka'
  },
  {
    src: '/images/gallery/CEF_0168.JPG',
    alt: 'Kurumsal kimlik',
    category: 'Marka'
  },
  {
    src: '/images/gallery/CEF_0896.JPG',
    alt: 'Ürün sergisi',
    category: 'Ürün'
  }
];

interface KardiyoliveGalleryProps {
  filterCategory?: string;
  showFilter?: boolean;
  maxItems?: number;
}

export default function KardiyoliveGallery({ 
  filterCategory, 
  showFilter = true,
  maxItems 
}: KardiyoliveGalleryProps) {
  const filteredImages = filterCategory 
    ? galleryImages.filter(img => img.category === filterCategory)
    : galleryImages;

  const displayImages = maxItems 
    ? filteredImages.slice(0, maxItems)
    : filteredImages;

  const categories = [...new Set(galleryImages.map(img => img.category))];

  return (
    <div className="space-y-6">
      {showFilter && (
        <div className="flex flex-wrap gap-2">
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium">
            Tümü
          </button>
          {categories.map(category => (
            <button
              key={category}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition duration-200"
            >
              {category}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayImages.map((image, index) => (
          <div key={index} className="group cursor-pointer">
            <div className="overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
              <GalleryImage
                src={image.src}
                alt={image.alt}
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="mt-2">
              <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                {image.category}
              </span>
              <p className="text-sm text-gray-600 mt-1">{image.alt}</p>
            </div>
          </div>
        ))}
      </div>

      {maxItems && filteredImages.length > maxItems && (
        <div className="text-center">
          <button className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition duration-200">
            Daha Fazla Göster ({filteredImages.length - maxItems} daha)
          </button>
        </div>
      )}
    </div>
  );
}
