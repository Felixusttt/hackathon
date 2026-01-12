// src/components/ToolCard.tsx (Updated)

import React from 'react';
import { Edit, Trash2, Eye } from 'lucide-react';
import { Tool } from '../types';
import StarRating from './StarRating';

interface ToolCardProps {
  tool: Tool;
  isAdmin: boolean;
  onEdit: (tool: Tool) => void;
  onDelete: (id: string) => void;
  onReview: (tool: Tool) => void;
  onViewReviews: (tool: Tool) => void; // New prop
}

const ToolCard: React.FC<ToolCardProps> = ({ 
  tool, 
  isAdmin, 
  onEdit, 
  onDelete, 
  onReview,
  onViewReviews // New prop
}) => {
  return (
    <div className="stagger-animation bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 hover:border-blue-200 transform hover:-translate-y-2">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors">
            {tool.name}
          </h3>
          <span className="inline-block mt-1 px-2 py-1 text-xs font-medium text-blue-700 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full">
            {tool.category}
          </span>
        </div>
        {isAdmin && (
          <div className="flex gap-1">
            <button
              onClick={() => onEdit(tool)}
              className="p-1 text-gray-600 hover:text-blue-600 transition-all transform hover:scale-110"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(tool.id)}
              className="p-1 text-gray-600 hover:text-red-600 transition-all transform hover:scale-110"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <p className="text-sm text-gray-600 mb-4">{tool.use_case}</p>

      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-700 px-3 py-1 bg-gray-100 rounded-full">
          {tool.pricing_model}
        </span>
        <button
          onClick={() => onViewReviews(tool)}
          className="flex items-center gap-2 hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors group"
        >
          <StarRating rating={Math.round(tool.average_rating)} interactive={false} />
          <span className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors">
            ({tool.review_count})
          </span>
          <Eye className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
        </button>
      </div>

      {!isAdmin && (
        <button
          onClick={() => onReview(tool)}
          className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg font-medium transition-all duration-300 transform hover:scale-105"
        >
          Write Review
        </button>
      )}
    </div>
  );
};

export default ToolCard;