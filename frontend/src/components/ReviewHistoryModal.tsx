// src/components/ReviewHistoryModal.tsx (New Component)

import React, { useEffect, useState } from 'react';
import { X, Loader, Star, Calendar, MessageSquare } from 'lucide-react';
import { Tool, Review } from '../types';
import { reviewsAPI } from '../services/api';
import StarRating from './StarRating';

interface ReviewHistoryModalProps {
  tool: Tool;
  onClose: () => void;
}

const ReviewHistoryModal: React.FC<ReviewHistoryModalProps> = ({ tool, onClose }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await reviewsAPI.getToolReviews(tool.id);
        setReviews(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load reviews');
        console.error('Error fetching reviews:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [tool.id]);

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++;
    });
    return distribution;
  };

  const distribution = getRatingDistribution();
  const maxCount = Math.max(...Object.values(distribution));

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl transform transition-all animate-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{tool.name}</h2>
              <p className="text-blue-100 text-sm">{tool.use_case}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Rating Summary */}
          <div className="mt-6 flex items-center gap-6">
            <div className="text-center">
              <div className="text-5xl font-bold mb-1">{getAverageRating()}</div>
              <StarRating rating={Math.round(Number(getAverageRating()))} interactive={false} size="lg" />
              <div className="text-blue-100 text-sm mt-2">{reviews.length} reviews</div>
            </div>

            {/* Rating Distribution */}
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map(star => (
                <div key={star} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-12">
                    <span className="text-sm font-medium">{star}</span>
                    <Star className="w-3 h-3 fill-current" />
                  </div>
                  <div className="flex-1 bg-white/20 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-yellow-300 h-full rounded-full transition-all duration-500"
                      style={{
                        width: maxCount > 0 ? `${(distribution[star as keyof typeof distribution] / maxCount) * 100}%` : '0%'
                      }}
                    />
                  </div>
                  <span className="text-sm w-8 text-right">{distribution[star as keyof typeof distribution]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
          {loading && (
            <div className="flex justify-center py-12">
              <Loader className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {!loading && !error && reviews.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">No reviews yet</p>
              <p className="text-gray-400 text-sm mt-2">Be the first to review this tool!</p>
            </div>
          )}

          {!loading && !error && reviews.length > 0 && (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-5 border border-gray-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {review.user_id ? review.user_id.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">User</div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {new Date(review.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                    <StarRating rating={review.rating} interactive={false} />
                  </div>

                  {review.comment && (
                    <p className="text-gray-700 leading-relaxed pl-13">
                      "{review.comment}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg font-semibold transition-all transform hover:scale-105"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewHistoryModal;