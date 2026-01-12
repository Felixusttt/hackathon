// src/components/ReviewModeration.tsx

import React from 'react';
import { Check, X, Loader } from 'lucide-react';
import { Review } from '../types';
import StarRating from './StarRating';

interface ReviewModerationProps {
  reviews: Review[];
  loading: boolean;
  onAction: (reviewId: string, action: string) => void;
}

const ReviewModeration: React.FC<ReviewModerationProps> = ({ 
  reviews, 
  loading, 
  onAction 
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg animate-fade-in border border-gray-100">
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
        <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
          Review Moderation
        </h2>
        <p className="text-sm text-gray-600 mt-1">Approve or reject user reviews</p>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      )}

      {!loading && (
        <div className="divide-y divide-gray-200">
          {reviews.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">No pending reviews</p>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="p-6 hover:bg-gray-50 transition-colors stagger-animation">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{review.tool_name}</h3>
                    <p className="text-sm text-gray-600">{review.date}</p>
                  </div>
                  <StarRating rating={review.rating} interactive={false} />
                </div>

                {review.comment && (
                  <p className="text-gray-700 mb-4">{review.comment}</p>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => onAction(review.id, 'approved')}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:shadow-lg font-medium transition-all duration-300 transform hover:scale-105"
                    disabled={loading}
                  >
                    <Check className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => onAction(review.id, 'rejected')}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:shadow-lg font-medium transition-all duration-300 transform hover:scale-105"
                    disabled={loading}
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewModeration;