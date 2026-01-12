// src/components/ToolModal.tsx

import React from 'react';
import { Tool, ToolForm } from '../types';
import { CATEGORIES, PRICING_MODELS } from '../constants';

interface ToolModalProps {
  tool: Tool | null;
  toolForm: ToolForm;
  isEditing: boolean;
  loading: boolean;
  onSave: () => void;
  onCancel: () => void;
  onChange: (field: keyof ToolForm | keyof Tool, value: string) => void;
}

const ToolModal: React.FC<ToolModalProps> = ({ 
  tool, 
  toolForm, 
  isEditing, 
  loading, 
  onSave, 
  onCancel, 
  onChange 
}) => {
  const currentValues = isEditing && tool ? tool : toolForm;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scale-in border border-gray-100">
        <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          {isEditing ? 'Edit Tool' : 'Add New Tool'}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tool Name *
            </label>
            <input
              type="text"
              value={currentValues.name}
              onChange={(e) => onChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., GPT-4"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Use Case *
            </label>
            <textarea
              value={currentValues.use_case}
              onChange={(e) => onChange('use_case', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Describe what this tool does..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              value={currentValues.category}
              onChange={(e) => onChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select category</option>
              {CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pricing Model *
            </label>
            <select
              value={currentValues.pricing_model}
              onChange={(e) => onChange('pricing_model', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select pricing</option>
              {PRICING_MODELS.map(pricing => (
                <option key={pricing} value={pricing}>{pricing}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onSave}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg font-medium transition-all duration-300 transform hover:scale-105"
            disabled={loading}
          >
            {loading ? 'Saving...' : (isEditing ? 'Save Changes' : 'Add Tool')}
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

export default ToolModal;