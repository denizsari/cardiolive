import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  fill?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

export default function OptimizedImage({
  src,
  alt,
  width = 400,
  height = 300,
  className = '',
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  fill = false,
  quality = 85,
  placeholder = 'empty',
  blurDataURL,
  ...props
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  // Convert to optimized WebP path
  const getOptimizedSrc = (originalSrc: string) => {
    if (originalSrc.includes('/products/')) {
      // Use thumbnail for small images, optimized for larger
      const isSmall = width <= 300 || height <= 300;
      if (isSmall) {
        return originalSrc.replace('/products/', '/products/thumbs/').replace(/\.(jpg|jpeg|png)$/i, '.webp');
      } else {
        return originalSrc.replace('/products/', '/products/optimized/').replace(/\.(jpg|jpeg|png)$/i, '.webp');
      }
    }
    
    if (originalSrc.includes('/mockups/')) {
      return originalSrc.replace('/mockups/', '/mockups/optimized/').replace(/\.(jpg|jpeg|png)$/i, '.webp');
    }
    
    if (originalSrc.includes('/gallery/')) {
      return originalSrc.replace('/gallery/', '/gallery/optimized/').replace(/\.(jpg|jpeg|png)$/i, '.webp');
    }
    
    return originalSrc;
  };

  const optimizedSrc = getOptimizedSrc(imgSrc);

  const handleError = () => {
    if (!hasError) {
      // Fallback to original image if optimized version fails
      setImgSrc(src);
      setHasError(true);
    }
  };

  const imageProps = {
    src: hasError ? src : optimizedSrc,
    alt,
    className: `transition-opacity duration-300 ${className}`,
    onError: handleError,
    quality,
    priority,
    sizes,
    placeholder,
    blurDataURL,
    ...props,
  };
  if (fill) {
    return (
      <Image
        {...imageProps}
        fill
        alt={alt || ''}
        style={{ objectFit: 'cover' }}
      />
    );
  }

  return (
    <Image
      {...imageProps}
      width={width}
      height={height}
      alt={alt || ''}
    />
  );
}

// Helper component for product cards
export function ProductImage({ 
  src, 
  alt, 
  className = 'w-full h-48 object-cover rounded-lg' 
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={300}
      height={300}
      className={className}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 300px"
    />
  );
}

// Helper component for gallery images
export function GalleryImage({ 
  src, 
  alt, 
  className = 'w-full h-64 object-cover rounded-lg' 
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={800}
      height={600}
      className={className}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 800px"
    />
  );
}
