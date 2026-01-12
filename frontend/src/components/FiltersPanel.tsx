// src/components/FiltersPanel.tsx

import React from 'react';
import { Filter } from 'lucide-react';
import { Filters } from '../types';
import { CATEGORIES, PRICING_MODELS, RATING_OPTIONS } from '../constants';

interface FiltersPanelProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
}

const FiltersPanel: React.FC<FiltersPanelProps> = ({ filters, onFilterChange }) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pricing Model
          </label>
          <select
            value={filters.pricing}
            onChange={(e) => onFilterChange({ ...filters, pricing: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Pricing</option>
            {PRICING_MODELS.map(pricing => (
              <option key={pricing} value={pricing}>{pricing}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Rating
          </label>
          <select
            value={filters.minRating}
            onChange={(e) => onFilterChange({ ...filters, minRating: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {RATING_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      {(filters.category || filters.pricing || filters.minRating > 0) && (
        <button
          onClick={() => onFilterChange({ category: '', pricing: '', minRating: 0 })}
          className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
};

export default FiltersPanel;