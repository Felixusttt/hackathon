// src/components/StarRating.tsx

import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  interactive: boolean;
  onChange?: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, interactive, onChange }) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          className={`w-5 h-5 ${
            star <= rating 
              ? 'fill-yellow-400 text-yellow-400' 
              : 'text-gray-300'
          } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
          onClick={() => interactive && onChange && onChange(star)}
        />
      ))}
    </div>
  );
};

export default StarRating;