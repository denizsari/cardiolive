'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Review } from '@/types';
import StarRating from './StarRating';

interface ReviewItemProps {
  review: Review;
  onVoteHelpful?: (reviewId: string, isHelpful: boolean) => void;
  isLoggedIn?: boolean;
}

export default function ReviewItem({ 
  review, 
  onVoteHelpful, 
  isLoggedIn = false 
}: ReviewItemProps) {
  const [userVote, setUserVote] = useState<'helpful' | 'not_helpful' | null>(
    review.userHasVoted || null
  );
  const [votes, setVotes] = useState(review.helpfulVotes || { helpful: 0, notHelpful: 0 });

  const handleVote = async (isHelpful: boolean) => {
    if (!isLoggedIn || !onVoteHelpful) return;

    const voteType = isHelpful ? 'helpful' : 'not_helpful';
    
    // Optimistic update
    const newVotes = { ...votes };
    
    // Remove previous vote if exists
    if (userVote === 'helpful') {
      newVotes.helpful = Math.max(0, newVotes.helpful - 1);
    } else if (userVote === 'not_helpful') {
      newVotes.notHelpful = Math.max(0, newVotes.notHelpful - 1);
    }
    
    // Add new vote if different from current
    if (userVote !== voteType) {
      if (isHelpful) {
        newVotes.helpful += 1;
      } else {
        newVotes.notHelpful += 1;
      }
      setUserVote(voteType);
    } else {
      setUserVote(null);
    }
    
    setVotes(newVotes);
    
    try {
      await onVoteHelpful(review._id, isHelpful);
    } catch (error) {
      console.error('Vote error:', error);
      // Revert optimistic update on error
      setVotes(review.helpfulVotes || { helpful: 0, notHelpful: 0 });
      setUserVote(review.userHasVoted || null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="border-b border-gray-200 py-6 last:border-b-0">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#70BB1B] rounded-full flex items-center justify-center text-white font-semibold">
            {review.user.name.charAt(0).toUpperCase()}
          </div>          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-gray-900">{review.user.name}</span>
              {review.isVerifiedPurchase && (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  Doğrulanmış Alışveriş
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
          </div>
        </div>
        <StarRating rating={review.rating} size={16} />
      </div>

      <div className="mb-4">
        <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
        <p className="text-gray-700 leading-relaxed">{review.comment}</p>
      </div>

      {isLoggedIn && (
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Bu değerlendirme faydalı mı?</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleVote(true)}
              className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-colors ${
                userVote === 'helpful'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-600'
              }`}
            >
              <ThumbsUp size={14} />
              <span>Evet ({votes.helpful})</span>
            </button>
            <button
              onClick={() => handleVote(false)}
              className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-colors ${
                userVote === 'not_helpful'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
              }`}
            >
              <ThumbsDown size={14} />
              <span>Hayır ({votes.notHelpful})</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
