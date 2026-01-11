import React, { useState, useEffect } from 'react';
import { Star, Plus, Check, X, Edit, Trash2, Filter, Loader } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

interface Tool {
  id: string;
  name: string;
  use_case: string;
  category: string;
  pricing_model: string;
  average_rating: number;
  review_count: number;
}

interface Review {
  id: string;
  tool_id: string;
  tool_name: string;
  rating: number;
  comment: string;
  status: string;
  date: string;
}

interface Filters {
  category: string;
  pricing: string;
  minRating: number;
}

interface ToolForm {
  name: string;
  use_case: string;
  category: string;
  pricing_model: string;
}

interface ReviewForm {
  rating: number;
  comment: string;
}

const App: React.FC = () => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<string>('catalog');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  // Filters
  const [filters, setFilters] = useState<Filters>({
    category: '',
    pricing: '',
    minRating: 0
  });
  
  // Modals
  const [showAddTool, setShowAddTool] = useState<boolean>(false);
  const [showReview, setShowReview] = useState<boolean>(false);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);

  // Form states
  const [toolForm, setToolForm] = useState<ToolForm>({
    name: '',
    use_case: '',
    category: '',
    pricing_model: ''
  });

  const [reviewForm, setReviewForm] = useState<ReviewForm>({
    rating: 5,
    comment: ''
  });

  // Fetch tools from API
  const fetchTools = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.pricing) params.append('pricing', filters.pricing);
      if (filters.minRating > 0) params.append('min_rating', filters.minRating.toString());
      
      const url = `${API_BASE}/tools${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) throw new Error('Failed to fetch tools');
      
      const data = await response.json();
      setTools(data);
    } catch (err) {
      setError('Failed to load tools. Make sure the backend is running.');
      console.error('Error fetching tools:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch reviews from API
  const fetchReviews = async () => {
    try {
      const response = await fetch(`${API_BASE}/reviews?status=pending`);
      if (!response.ok) throw new Error('Failed to fetch reviews');
      const data = await response.json();
      setReviews(data);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  // Load tools on mount and when filters change
  useEffect(() => {
    fetchTools();
  }, [filters]);

  // Load reviews when admin switches to review view
  useEffect(() => {
    if (isAdmin && activeView === 'reviews') {
      fetchReviews();
    }
  }, [isAdmin, activeView]);

  // Add tool
  const handleAddTool = async () => {
    if (!toolForm.name || !toolForm.category || !toolForm.pricing_model) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/tools`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toolForm)
      });

      if (!response.ok) throw new Error('Failed to add tool');

      await fetchTools();
      setToolForm({ name: '', use_case: '', category: '', pricing_model: '' });
      setShowAddTool(false);
      alert('Tool added successfully!');
    } catch (err) {
      alert('Failed to add tool');
      console.error('Error adding tool:', err);
    } finally {
      setLoading(false);
    }
  };

  // Edit tool
  const handleEditTool = async () => {
    if (!editingTool) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/tools/${editingTool.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingTool.name,
          use_case: editingTool.use_case,
          category: editingTool.category,
          pricing_model: editingTool.pricing_model
        })
      });

      if (!response.ok) throw new Error('Failed to update tool');

      await fetchTools();
      setEditingTool(null);
      alert('Tool updated successfully!');
    } catch (err) {
      alert('Failed to update tool');
      console.error('Error updating tool:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete tool
  const handleDeleteTool = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tool?')) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/tools/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete tool');

      await fetchTools();
      alert('Tool deleted successfully!');
    } catch (err) {
      alert('Failed to delete tool');
      console.error('Error deleting tool:', err);
    } finally {
      setLoading(false);
    }
  };

  // Submit review
  const handleSubmitReview = async () => {
    if (!selectedTool) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool_id: selectedTool.id,
          rating: reviewForm.rating,
          comment: reviewForm.comment
        })
      });

      if (!response.ok) throw new Error('Failed to submit review');

      setReviewForm({ rating: 5, comment: '' });
      setShowReview(false);
      setSelectedTool(null);
      alert('Review submitted successfully! Waiting for admin approval.');
    } catch (err) {
      alert('Failed to submit review');
      console.error('Error submitting review:', err);
    } finally {
      setLoading(false);
    }
  };

  // Moderate review
  const handleReviewAction = async (reviewId: string, action: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action })
      });

      if (!response.ok) throw new Error('Failed to moderate review');

      await fetchReviews();
      await fetchTools(); // Refresh tools to update ratings
      alert(`Review ${action} successfully!`);
    } catch (err) {
      alert('Failed to moderate review');
      console.error('Error moderating review:', err);
    } finally {
      setLoading(false);
    }
  };

  const StarRating = ({ rating, interactive, onChange }: { rating: number; interactive: boolean; onChange?: (rating: number) => void }) => {
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

return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="transform transition-transform hover:scale-105">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">AI Tool Discovery</h1>
              <p className="text-sm text-gray-600">Find the perfect AI tools for your needs</p>
            </div>
            <button
              onClick={() => setIsAdmin(!isAdmin)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                isAdmin 
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:shadow-lg' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-md'
              }`}
            >
              {isAdmin ? 'Admin Mode' : 'User Mode'}
            </button>
          </div>
        </div>
      </header>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 py-4 animate-fade-in">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-md animate-shake">
            {error}
          </div>
        </div>
      )}

      {/* Admin Navigation */}
      {isAdmin && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-200 animate-fade-in">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveView('catalog')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                  activeView === 'catalog'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
                    : 'text-purple-700 hover:bg-purple-100'
                }`}
              >
                Tool Catalog
              </button>
              <button
                onClick={() => setActiveView('reviews')}
                className={`px-4 py-2 rounded-lg font-medium relative transition-all duration-300 transform hover:scale-105 ${
                  activeView === 'reviews'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
                    : 'text-purple-700 hover:bg-purple-100'
                }`}
              >
                Review Moderation
                {reviews.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
                    {reviews.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeView === 'catalog' ? (
          <>
            {/* Filters */}
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
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Categories</option>
                    <option value="NLP">NLP</option>
                    <option value="Computer Vision">Computer Vision</option>
                    <option value="Dev Tools">Dev Tools</option>
                    <option value="Audio">Audio</option>
                    <option value="Video">Video</option>
                    <option value="Data Analytics">Data Analytics</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pricing Model
                  </label>
                  <select
                    value={filters.pricing}
                    onChange={(e) => setFilters({ ...filters, pricing: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Pricing</option>
                    <option value="Free">Free</option>
                    <option value="Paid">Paid</option>
                    <option value="Subscription">Subscription</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Rating
                  </label>
                  <select
                    value={filters.minRating}
                    onChange={(e) => setFilters({ ...filters, minRating: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="0">Any Rating</option>
                    <option value="3">3+ Stars</option>
                    <option value="4">4+ Stars</option>
                    <option value="4.5">4.5+ Stars</option>
                  </select>
                </div>
              </div>

              {(filters.category || filters.pricing || filters.minRating > 0) && (
                <button
                  onClick={() => setFilters({ category: '', pricing: '', minRating: 0 })}
                  className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>

            {/* Add Tool Button (Admin) */}
            {isAdmin && (
              <div className="mb-6 animate-fade-in">
                <button
                  onClick={() => setShowAddTool(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg font-medium transition-all duration-300 transform hover:scale-105"
                  disabled={loading}
                >
                  <Plus className="w-5 h-5" />
                  Add New Tool
                </button>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center py-12">
                <Loader className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            )}

            {/* Tools Grid */}
            {!loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tools.map((tool, index) => (
                  <div key={tool.id} className="stagger-animation bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 hover:border-blue-200 transform hover:-translate-y-2">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors">{tool.name}</h3>
                        <span className="inline-block mt-1 px-2 py-1 text-xs font-medium text-blue-700 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full">
                          {tool.category}
                        </span>
                      </div>
                      {isAdmin && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => setEditingTool({ ...tool })}
                            className="p-1 text-gray-600 hover:text-blue-600 transition-all transform hover:scale-110"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTool(tool.id)}
                            className="p-1 text-gray-600 hover:text-red-600 transition-all transform hover:scale-110"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mb-4">{tool.use_case}</p>

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-gray-700 px-3 py-1 bg-gray-100 rounded-full">{tool.pricing_model}</span>
                      <div className="flex items-center gap-2">
                        <StarRating rating={Math.round(tool.average_rating)} interactive={false} />
                        <span className="text-sm text-gray-600">({tool.review_count})</span>
                      </div>
                    </div>

                    {!isAdmin && (
                      <button
                        onClick={() => {
                          setSelectedTool(tool);
                          setShowReview(true);
                        }}
                        className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg font-medium transition-all duration-300 transform hover:scale-105"
                      >
                        Write Review
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {!loading && tools.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No tools found. {isAdmin ? 'Add some tools to get started!' : 'Check back later.'}</p>
              </div>
            )}
          </>
        ) : (
          /* Review Moderation */
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg animate-fade-in border border-gray-100">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
              <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Review Moderation</h2>
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
                  reviews.map((review, index) => (
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
                          onClick={() => handleReviewAction(review.id, 'approved')}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:shadow-lg font-medium transition-all duration-300 transform hover:scale-105"
                          disabled={loading}
                        >
                          <Check className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReviewAction(review.id, 'rejected')}
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
        )}
      </div>

      {/* Add/Edit Tool Modal */}
      {(showAddTool || editingTool) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scale-in border border-gray-100">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              {editingTool ? 'Edit Tool' : 'Add New Tool'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tool Name *
                </label>
                <input
                  type="text"
                  value={editingTool ? editingTool.name : toolForm.name}
                  onChange={(e) => editingTool 
                    ? setEditingTool({ ...editingTool, name: e.target.value })
                    : setToolForm({ ...toolForm, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., GPT-4"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Use Case *
                </label>
                <textarea
                  value={editingTool ? editingTool.use_case : toolForm.use_case}
                  onChange={(e) => editingTool
                    ? setEditingTool({ ...editingTool, use_case: e.target.value })
                    : setToolForm({ ...toolForm, use_case: e.target.value })
                  }
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
                  value={editingTool ? editingTool.category : toolForm.category}
                  onChange={(e) => editingTool
                    ? setEditingTool({ ...editingTool, category: e.target.value })
                    : setToolForm({ ...toolForm, category: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select category</option>
                  <option value="NLP">NLP</option>
                  <option value="Computer Vision">Computer Vision</option>
                  <option value="Dev Tools">Dev Tools</option>
                  <option value="Audio">Audio</option>
                  <option value="Video">Video</option>
                  <option value="Data Analytics">Data Analytics</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pricing Model *
                </label>
                <select
                  value={editingTool ? editingTool.pricing_model : toolForm.pricing_model}
                  onChange={(e) => editingTool
                    ? setEditingTool({ ...editingTool, pricing_model: e.target.value })
                    : setToolForm({ ...toolForm, pricing_model: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select pricing</option>
                  <option value="Free">Free</option>
                  <option value="Paid">Paid</option>
                  <option value="Subscription">Subscription</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={editingTool ? handleEditTool : handleAddTool}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg font-medium transition-all duration-300 transform hover:scale-105"
                disabled={loading}
              >
                {loading ? 'Saving...' : (editingTool ? 'Save Changes' : 'Add Tool')}
              </button>
              <button
                onClick={() => {
                  setShowAddTool(false);
                  setEditingTool(null);
                  setToolForm({ name: '', use_case: '', category: '', pricing_model: '' });
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-all duration-300 transform hover:scale-105"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReview && selectedTool && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scale-in border border-gray-100">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Review {selectedTool.name}
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
                  onChange={(rating) => setReviewForm({ ...reviewForm, rating })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comment (Optional)
                </label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Tell us about your experience..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSubmitReview}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg font-medium transition-all duration-300 transform hover:scale-105"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Review'}
              </button>
              <button
                onClick={() => {
                  setShowReview(false);
                  setSelectedTool(null);
                  setReviewForm({ rating: 5, comment: '' });
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-all duration-300 transform hover:scale-105"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;