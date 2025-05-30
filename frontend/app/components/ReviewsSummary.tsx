'use client';

import { ReviewStats } from '@/types';
import StarRating from './StarRating';

interface ReviewsSummaryProps {
  stats: ReviewStats;
  onWriteReview?: () => void;
  showWriteButton?: boolean;
}

export default function ReviewsSummary({
  stats,
  onWriteReview,
  showWriteButton = false
}: ReviewsSummaryProps) {
  const { averageRating, totalReviews, ratingDistribution } = stats;

  const getPercentage = (count: number) => {
    return totalReviews > 0 ? (count / totalReviews) * 100 : 0;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Müşteri Değerlendirmeleri
          </h3>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className="text-3xl font-bold text-gray-900">
                {averageRating.toFixed(1)}
              </span>
              <StarRating rating={averageRating} size={24} />
            </div>
            <span className="text-gray-600">
              ({totalReviews} değerlendirme)
            </span>
          </div>
        </div>
        
        {showWriteButton && onWriteReview && (
          <button
            onClick={onWriteReview}
            className="bg-[#70BB1B] text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
          >
            Değerlendirme Yaz
          </button>
        )}
      </div>

      {totalReviews > 0 && (        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 mb-3">Puan Dağılımı</h4>
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 w-20">
                <span className="text-sm text-gray-600">{rating}</span>
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getPercentage(ratingDistribution[rating] || 0)}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 w-12 text-right">
                {ratingDistribution[rating] || 0}
              </span>
            </div>
          ))}
        </div>
      )}

      {totalReviews === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h4 className="text-gray-900 font-medium mb-2">Henüz değerlendirme yok</h4>
          <p className="text-gray-600 mb-4">
            Bu ürün için ilk değerlendirmeyi siz yazın!
          </p>
          {showWriteButton && onWriteReview && (
            <button
              onClick={onWriteReview}
              className="bg-[#70BB1B] text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
            >
              İlk Değerlendirmeyi Yaz
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Star component for the rating distribution
function Star({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}
