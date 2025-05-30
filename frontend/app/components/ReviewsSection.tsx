'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Filter } from 'lucide-react';
import { reviewAPI, productAPI } from '@/utils/api';
import { Review, ReviewStats, CreateReviewData } from '@/types';
import ReviewsSummary from './ReviewsSummary';
import ReviewItem from './ReviewItem';
import ReviewForm from './ReviewForm';

interface ReviewsSectionProps {
  productId: string; // This could be slug or actual ID
  isLoggedIn?: boolean;
  userToken?: string;
}

export default function ReviewsSection({
  productId,
  isLoggedIn = false,
  userToken
}: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'helpful'>('newest');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [resolvedProductId, setResolvedProductId] = useState<string | null>(null);

  // Helper function to check if productId is MongoDB ObjectId or slug
  const isObjectId = (id: string) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
  };

  // Resolve product ID from slug if needed
  useEffect(() => {
    const resolveProductId = async () => {
      try {
        if (isObjectId(productId)) {
          // Already an ObjectId
          setResolvedProductId(productId);
        } else {
          // Try to resolve from slug
          try {
            const product = await productAPI.getBySlug(productId);
            if (product && product._id) {
              setResolvedProductId(product._id);
            } else {
              console.error('Product resolution returned invalid data:', product);
              setResolvedProductId(null);
            }
          } catch (error) {
            console.error('Failed to resolve product from slug:', error);
            setResolvedProductId(null);
          }
        }
      } catch (error) {
        console.error('Unexpected error during product ID resolution:', error);
        setResolvedProductId(null);
      }
    };

    resolveProductId();
  }, [productId]);

  // Submit review using centralized API
  const handleReviewSubmit = async (reviewData: {
    rating: number;
    title: string;
    comment: string;
  }) => {
    if (!userToken) {
      throw new Error('Giriş yapmanız gerekiyor');
    }

    if (!resolvedProductId) {
      throw new Error('Ürün ID\'si çözümlenemedi');
    }

    setSubmitting(true);
    try {
      const createData: CreateReviewData = {
        productId: resolvedProductId,
        rating: reviewData.rating,
        comment: reviewData.comment,
        title: reviewData.title
      };

      await reviewAPI.createReview(createData);

      // Refresh data
      const [reviewsResponse, statsResponse] = await Promise.all([
        reviewAPI.getProductReviews(resolvedProductId, { page: 1, limit: 10, sort: sortBy }),
        reviewAPI.getReviewStats(resolvedProductId)
      ]);
      
      setReviews(reviewsResponse.reviews);
      setStats(statsResponse.stats);
      setPage(2);
      setHasMore(reviewsResponse.reviews.length === 10);
      
      setShowForm(false);
    } finally {
      setSubmitting(false);
    }
  };  // Vote helpful using centralized API
  const handleVoteHelpful = async (reviewId: string) => {
    if (!userToken) return;

    if (!resolvedProductId) {
      console.error('Cannot vote helpful: resolvedProductId is null');
      setError('Ürün ID çözümlenemedi');
      return;
    }

    try {
      await reviewAPI.markHelpful(reviewId);

      // Refresh reviews to get updated vote counts
      const response = await reviewAPI.getProductReviews(resolvedProductId, {
        page: 1,
        limit: page * 10,
        sort: sortBy,
        ...(filterRating && { rating: filterRating.toString() })
      });
      setReviews(response.reviews);
    } catch (err) {
      console.error('Vote error:', err);
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    }
  };

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!resolvedProductId) return;

      try {
        const response = await reviewAPI.getReviewStats(resolvedProductId);
        setStats(response.stats);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'İstatistikler yüklenemedi';
        setError(errorMessage);
      }
    };

    fetchStats();
  }, [resolvedProductId]);

  // Fetch reviews when dependencies change
  useEffect(() => {
    const fetchReviews = async () => {
      if (!resolvedProductId) return;

      try {
        setLoading(true);
        const params = {
          page: 1,
          limit: 10,
          sort: sortBy,
          ...(filterRating && { rating: filterRating.toString() })
        };

        const response = await reviewAPI.getProductReviews(resolvedProductId, params);
        
        setReviews(response.reviews);
        setPage(2);
        setHasMore(response.reviews.length === 10);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [resolvedProductId, sortBy, filterRating]);

  // Load more reviews
  const loadMoreReviews = async () => {
    if (!resolvedProductId) return;

    try {
      setLoading(true);
      const params = {
        page: page,
        limit: 10,
        sort: sortBy,
        ...(filterRating && { rating: filterRating.toString() })
      };

      const response = await reviewAPI.getProductReviews(resolvedProductId, params);
      
      setReviews(prev => [...prev, ...response.reviews]);
      setPage(prev => prev + 1);
      setHasMore(response.reviews.length === 10);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Reviews Summary */}
      <div className="p-6 border-b">
        <ReviewsSummary stats={stats} />
        
        {isLoggedIn && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showForm ? 'İptal Et' : 'Yorum Yaz'}
          </button>
        )}
      </div>

      {/* Review Form */}
      {showForm && isLoggedIn && (
        <div className="p-6 border-b bg-gray-50">          <ReviewForm
            onSubmit={handleReviewSubmit}
            isSubmitting={submitting}
          />
        </div>
      )}

      {/* Filters and Sorting */}
      <div className="p-6 border-b bg-gray-50">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-4">
            {/* Sort Dropdown */}
            <div className="relative">              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">En Yeni</option>
                <option value="oldest">En Eski</option>
                <option value="rating_high">Yüksek Puan</option>
                <option value="rating_low">Düşük Puan</option>
                <option value="helpful">En Faydalı</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>

            {/* Rating Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterRating || ''}
                onChange={(e) => setFilterRating(e.target.value ? parseInt(e.target.value) : null)}
                className="bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tüm Puanlar</option>
                <option value="5">5 Yıldız</option>
                <option value="4">4 Yıldız</option>
                <option value="3">3 Yıldız</option>
                <option value="2">2 Yıldız</option>
                <option value="1">1 Yıldız</option>
              </select>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            {stats.totalReviews} yorum
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="divide-y divide-gray-200">
        {loading && reviews.length === 0 ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Yorumlar yükleniyor...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-600">Henüz yorum yapılmamış.</p>
            {!isLoggedIn && (
              <p className="text-sm text-gray-500 mt-2">
                İlk yorumu yapmak için giriş yapın.
              </p>
            )}
          </div>
        ) : (
          <>            {reviews.map((review) => (
              <div key={review._id} className="p-6">
                <ReviewItem
                  review={review}
                  onVoteHelpful={(reviewId) => handleVoteHelpful(reviewId)}
                  isLoggedIn={isLoggedIn}
                />
              </div>
            ))}

            {/* Load More Button */}
            {hasMore && (
              <div className="p-6 text-center border-t">
                <button
                  onClick={loadMoreReviews}
                  disabled={loading}
                  className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Yükleniyor...' : 'Daha Fazla Göster'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
