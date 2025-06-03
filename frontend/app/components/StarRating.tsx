'use client';

import { Star } from 'lucide-react';
import Button from './ui/Button';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

export default function StarRating({
  rating,
  maxStars = 5,
  size = 20,
  interactive = false,
  onChange,
  className = ''
}: StarRatingProps) {
  const handleStarClick = (starIndex: number) => {
    if (interactive && onChange) {
      onChange(starIndex + 1);
    }
  };

  return (
    <div className={`flex items-center ${className}`}>
      {Array.from({ length: maxStars }, (_, index) => {
        const isFilled = index < rating;
        const isHalfFilled = rating > index && rating < index + 1;
          return (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            disabled={!interactive}
            onClick={() => handleStarClick(index)}
            className={`${
              interactive 
                ? 'cursor-pointer hover:scale-110 transition-transform' 
                : 'cursor-default'
            } ${interactive ? 'p-1' : 'p-0'}`}
          >
            <Star
              size={size}
              className={`${
                isFilled || isHalfFilled
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              } transition-colors`}
            />
          </Button>
        );
      })}
    </div>
  );
}
