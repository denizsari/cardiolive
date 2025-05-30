'use client';

import { Star } from 'lucide-react';

interface ProductRatingProps {
  rating: number;
  reviewCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  className?: string;
}

export default function ProductRating({
  rating,
  reviewCount = 0,
  size = 'md',
  showCount = true,
  className = ''
}: ProductRatingProps) {
  const sizes = {
    sm: 14,
    md: 16,
    lg: 20
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const starSize = sizes[size];
  const textSize = textSizes[size];

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <div className="flex items-center">
        {Array.from({ length: 5 }, (_, index) => {
          const isFilled = index < Math.floor(rating);
          const isHalfFilled = rating > index && rating < index + 1;
          
          return (
            <Star
              key={index}
              size={starSize}
              className={`${
                isFilled || isHalfFilled
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          );
        })}
      </div>
      
      {showCount && (
        <span className={`${textSize} text-gray-600`}>
          {rating.toFixed(1)} ({reviewCount} değerlendirme)
        </span>
      )}
    </div>
  );
}
