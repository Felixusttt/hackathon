// src/components/AdminNavigation.tsx

import React from 'react';

interface AdminNavigationProps {
  activeView: string;
  onViewChange: (view: string) => void;
  pendingReviewCount: number;
}

const AdminNavigation: React.FC<AdminNavigationProps> = ({ 
  activeView, 
  onViewChange, 
  pendingReviewCount 
}) => {
  return (
    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-200 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex gap-4">
          <button
            onClick={() => onViewChange('catalog')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
              activeView === 'catalog'
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
                : 'text-purple-700 hover:bg-purple-100'
            }`}
          >
            Tool Catalog
          </button>
          <button
            onClick={() => onViewChange('reviews')}
            className={`px-4 py-2 rounded-lg font-medium relative transition-all duration-300 transform hover:scale-105 ${
              activeView === 'reviews'
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
                : 'text-purple-700 hover:bg-purple-100'
            }`}
          >
            Review Moderation
            {pendingReviewCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
                {pendingReviewCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminNavigation;