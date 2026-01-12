// src/components/ReviewModal.tsx

import React from 'react';
import { Tool, ReviewForm } from '../types';
import StarRating from './StarRating';

interface ReviewModalProps {
  tool: Tool;
  reviewForm: ReviewForm;
  loading: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  onChange: (field: keyof ReviewForm, value: number | string) => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ 
  tool, 
  reviewForm, 
  loading, 
  onSubmit, 
  onCancel, 
  onChange 
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scale-in border border-gray-100">
        <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Review {tool.name}
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Share your experience with this tool
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Rating
            </label>
            <StarRating 
              rating={reviewForm.rating} 
              interactive={true}
              onChange={(rating) => onChange('rating', rating)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comment (Optional)
            </label>
            <textarea
              value={reviewForm.comment}
              onChange={(e) => onChange('comment', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Tell us about your experience..."
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onSubmit}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg font-medium transition-all duration-300 transform hover:scale-105"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-all duration-300 transform hover:scale-105"
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;