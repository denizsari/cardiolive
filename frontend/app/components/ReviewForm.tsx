'use client';

import { useState } from 'react';
import StarRating from './StarRating';

interface ReviewFormProps {
  onSubmit: (reviewData: {
    rating: number;
    title: string;
    comment: string;
  }) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export default function ReviewForm({
  onSubmit,
  onCancel,
  isSubmitting = false
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState<{
    rating?: string;
    title?: string;
    comment?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (rating === 0) {
      newErrors.rating = 'Lütfen bir puan verin';
    }

    if (!title.trim()) {
      newErrors.title = 'Başlık zorunludur';
    } else if (title.length < 3) {
      newErrors.title = 'Başlık en az 3 karakter olmalıdır';
    } else if (title.length > 100) {
      newErrors.title = 'Başlık 100 karakterden fazla olamaz';
    }

    if (!comment.trim()) {
      newErrors.comment = 'Yorum zorunludur';
    } else if (comment.length < 10) {
      newErrors.comment = 'Yorum en az 10 karakter olmalıdır';
    } else if (comment.length > 1000) {
      newErrors.comment = 'Yorum 1000 karakterden fazla olamaz';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit({
        rating,
        title: title.trim(),
        comment: comment.trim()
      });
      
      // Reset form on success
      setRating(0);
      setTitle('');
      setComment('');
      setErrors({});
    } catch (error) {
      console.error('Review submission error:', error);
    }
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return 'Çok Kötü';
      case 2: return 'Kötü';
      case 3: return 'Orta';
      case 4: return 'İyi';
      case 5: return 'Mükemmel';
      default: return 'Puan Verin';
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">
        Değerlendirme Yazın
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Puanınız *
          </label>
          <div className="flex items-center space-x-3">
            <StarRating
              rating={rating}
              interactive
              onChange={setRating}
              size={32}
              className="mb-1"
            />
            <span className="text-lg font-medium text-gray-700">
              {getRatingText(rating)}
            </span>
          </div>
          {errors.rating && (
            <p className="mt-1 text-sm text-red-600">{errors.rating}</p>
          )}
        </div>

        {/* Title */}
        <div>
          <label htmlFor="review-title" className="block text-sm font-medium text-gray-700 mb-2">
            Başlık *
          </label>
          <input
            type="text"
            id="review-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Değerlendirmeniz için kısa bir başlık yazın"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#70BB1B] focus:border-transparent ${
              errors.title ? 'border-red-300' : 'border-gray-300'
            }`}
            maxLength={100}
            disabled={isSubmitting}
          />
          <div className="flex justify-between items-center mt-1">
            {errors.title ? (
              <p className="text-sm text-red-600">{errors.title}</p>
            ) : (
              <div />
            )}
            <span className="text-sm text-gray-500">{title.length}/100</span>
          </div>
        </div>

        {/* Comment */}
        <div>
          <label htmlFor="review-comment" className="block text-sm font-medium text-gray-700 mb-2">
            Yorumunuz *
          </label>
          <textarea
            id="review-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Ürün hakkındaki deneyiminizi detaylı olarak paylaşın"
            rows={5}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#70BB1B] focus:border-transparent resize-none ${
              errors.comment ? 'border-red-300' : 'border-gray-300'
            }`}
            maxLength={1000}
            disabled={isSubmitting}
          />
          <div className="flex justify-between items-center mt-1">
            {errors.comment ? (
              <p className="text-sm text-red-600">{errors.comment}</p>
            ) : (
              <div />
            )}
            <span className="text-sm text-gray-500">{comment.length}/1000</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-[#70BB1B] text-white py-3 px-6 rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Gönderiliyor...' : 'Değerlendirme Gönder'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              İptal
            </button>
          )}
        </div>
      </form>

      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Not:</strong> Değerlendirmeniz gönderildikten sonra diğer müşteriler tarafından görülebilir olacaktır. 
          Lütfen samimi ve yapıcı yorumlar yazın.
        </p>
      </div>
    </div>
  );
}
