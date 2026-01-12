// src/components/StarRating.tsx (Update to support size prop)

import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

const StarRating: React.FC<StarRatingProps> = ({ 
  rating, 
  interactive = false, 
  onChange,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClasses[size]} transition-all ${
            star <= rating
              ? 'fill-yellow-400 text-yellow-400 drop-shadow-sm'
              : 'text-gray-300'
          } ${interactive ? 'cursor-pointer hover:scale-110 hover:text-yellow-400' : ''}`}
          onClick={() => interactive && onChange && onChange(star)}
        />
      ))}
    </div>
  );
};

export default StarRating;