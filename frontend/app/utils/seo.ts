import { Metadata } from 'next';

// SEO Helper functions
export function generateSEOMetadata(
  title: string,
  description: string,
  keywords?: string[],
  image?: string,
  url?: string
): Metadata {
  const siteTitle = 'Kardiyolive - Premium Zeytinyağı ve Doğal Ürünler';
  const siteDescription = 'Kardiyolive, Ege\'nin en kaliteli zeytinlerinden elde edilen organik zeytinyağları ve doğal ürünleri sunar. Premium kalite, doğal lezzet.';
  const siteUrl = 'https://kardiyolive.com';
  const defaultImage = '/og-image.jpg';

  return {
    title: title ? `${title} | ${siteTitle}` : siteTitle,
    description: description || siteDescription,
    keywords: keywords?.join(', ') || 'zeytinyağı, organik, doğal, kardiyolive, zeytin, premium, kalite',
    authors: [{ name: 'Kardiyolive' }],
    creator: 'Kardiyolive',
    publisher: 'Kardiyolive',
    robots: 'index, follow',
    
    openGraph: {
      type: 'website',
      title: title ? `${title} | ${siteTitle}` : siteTitle,
      description: description || siteDescription,
      url: url || siteUrl,
      siteName: 'Kardiyolive',
      images: [
        {
          url: image || defaultImage,
          width: 1200,
          height: 630,
          alt: title || siteTitle,
        },
      ],
      locale: 'tr_TR',
    },
    
    twitter: {
      card: 'summary_large_image',
      title: title ? `${title} | ${siteTitle}` : siteTitle,
      description: description || siteDescription,
      images: [image || defaultImage],
      creator: '@kardiyolive',
    },
    
    alternates: {
      canonical: url || siteUrl,
    },
    
    verification: {
      google: 'your-google-verification-code',
      yandex: 'your-yandex-verification-code',
    },
  };
}

// Product SEO metadata generator
export function generateProductSEO(product: {
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  slug: string;
}): Metadata {
  const title = `${product.name} - Premium Zeytinyağı`;
  const description = `${product.description} ✓ Premium kalite ✓ Doğal üretim ✓ Hızlı teslimat. ${product.price}₺'den başlayan fiyatlarla.`;
  const keywords = [
    'zeytinyağı',
    product.category,
    'organik',
    'doğal',
    'kardiyolive',
    product.name.toLowerCase().split(' ')
  ].flat();

  return generateSEOMetadata(
    title,
    description,
    keywords,
    product.images[0],
    `https://kardiyolive.com/products/${product.slug}`
  );
}

// Category SEO metadata generator
export function generateCategorySEO(category: {
  name: string;
  description: string;
  slug: string;
}): Metadata {
  const title = `${category.name} - Kardiyolive`;
  const description = `${category.description} Kardiyolive kalitesiyle, premium ${category.name.toLowerCase()} ürünleri. Doğal ve organik seçenekler.`;
  const keywords = [
    category.name.toLowerCase(),
    'zeytinyağı',
    'organik',
    'doğal',
    'kardiyolive',
    'premium'
  ];

  return generateSEOMetadata(
    title,
    description,
    keywords,
    `/categories/${category.slug}-hero.jpg`,
    `https://kardiyolive.com/products?category=${category.slug}`
  );
}

// Blog SEO metadata generator
export function generateBlogSEO(blog: {
  title: string;
  excerpt: string;
  slug: string;
  image: string;
  publishDate: string;
  author: string;
}): Metadata {
  const title = `${blog.title} - Kardiyolive Blog`;
  const description = blog.excerpt;
  const keywords = [
    'zeytinyağı',
    'sağlık',
    'beslenme',
    'doğal yaşam',
    'kardiyolive',
    'blog'
  ];

  return {
    ...generateSEOMetadata(
      title,
      description,
      keywords,
      blog.image,
      `https://kardiyolive.com/blog/${blog.slug}`    ),
    authors: [{ name: blog.author }],
    openGraph: {
      type: 'article',
      publishedTime: blog.publishDate,
      authors: [blog.author],
      section: 'Sağlık ve Beslenme',
      tags: keywords,
    },
  };
}

// Structured Data generators
export function generateProductStructuredData(product: {
  name: string;
  description: string;
  price: number;
  currency: string;
  availability: string;
  brand: string;
  category: string;
  images: string[];
  reviews: { rating: number; count: number };
  sku: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    category: product.category,
    image: product.images,
    sku: product.sku,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency,
      availability: `https://schema.org/${product.availability}`,
      seller: {
        '@type': 'Organization',
        name: 'Kardiyolive',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.reviews.rating,
      reviewCount: product.reviews.count,
    },
  };
}

export function generateOrganizationStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Kardiyolive',
    url: 'https://kardiyolive.com',
    logo: 'https://kardiyolive.com/logo.png',
    description: 'Premium zeytinyağı ve doğal ürünler üreticisi',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'TR',
      addressRegion: 'İzmir',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+90-XXX-XXX-XXXX',
      contactType: 'customer service',
      availableLanguage: 'Turkish',
    },
    sameAs: [
      'https://www.facebook.com/kardiyolive',
      'https://www.instagram.com/kardiyolive',
      'https://www.twitter.com/kardiyolive',
    ],
  };
}

export function generateBreadcrumbStructuredData(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
