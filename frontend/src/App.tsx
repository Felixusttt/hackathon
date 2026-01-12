// src/App.tsx (Updated with Authentication)

import React, { useState, useEffect } from 'react';
import { Plus, Loader } from 'lucide-react';
import { Tool, Review, Filters, ToolForm, ReviewForm } from './types';
import { User } from './types/auth';
import { toolsAPI, reviewsAPI } from './services/api';
import { authAPI } from './services/authapi';
import Login from './components/Login';
import Register from './components/Register';
import AuthHeader from './components/AuthHeader';
import AdminNavigation from './components/AdminNavigation';
import FiltersPanel from './components/FiltersPanel';
import ToolCard from './components/ToolCard';
import ToolModal from './components/ToolModal';
import ReviewModal from './components/ReviewModal';
import ReviewHistoryModal from './components/ReviewHistoryModal';
import ReviewModeration from './components/ReviewModeration';

const App: React.FC = () => {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // App state
  const [tools, setTools] = useState<Tool[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<string>('catalog');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  const [filters, setFilters] = useState<Filters>({
    category: '',
    pricing: '',
    minRating: 0
  });
  
  const [showAddTool, setShowAddTool] = useState<boolean>(false);
  const [showReview, setShowReview] = useState<boolean>(false);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);

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

  const [showReviewHistory, setShowReviewHistory] = useState<boolean>(false);
  const [reviewHistoryTool, setReviewHistoryTool] = useState<Tool | null>(null);

    const handleViewReviews = (tool: Tool) => {
  setReviewHistoryTool(tool);
  setShowReviewHistory(true);
};
  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const savedUser = authAPI.getSavedUser();
        if (savedUser && authAPI.isAuthenticated()) {
          setUser(savedUser);
          setIsAdmin(savedUser.role === 'admin');
        }
      } catch (err) {
        console.error('Auth check failed:', err);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  // Handle login
  const handleLogin = async (email: string, password: string) => {
    try {
      setAuthLoading(true);
      setAuthError('');
      
      const response = await authAPI.login({ email, password });
      authAPI.saveAuth(response.token, response.user);
      setUser(response.user);
      setIsAdmin(response.user.role === 'admin');
    } catch (err: any) {
      setAuthError(err.message || 'Login failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle register
  const handleRegister = async (name: string, email: string, password: string) => {
    try {
      setAuthLoading(true);
      setAuthError('');
      
      const response = await authAPI.register({ name, email, password, confirmPassword: password });
      authAPI.saveAuth(response.token, response.user);
      setUser(response.user);
      setIsAdmin(response.user.role === 'admin');
    } catch (err: any) {
      setAuthError(err.message || 'Registration failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
      setIsAdmin(false);
      setTools([]);
      setReviews([]);
    } catch (err) {
      console.error('Logout failed:', err);
      // Clear local storage anyway
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  // Fetch tools from API
  const fetchTools = async () => {
    try {
      setLoading(true);
      setError('');
      
      const filterParams = {
        category: filters.category || undefined,
        pricing: filters.pricing || undefined,
        min_rating: filters.minRating > 0 ? filters.minRating : undefined
      };
      
      const data = await toolsAPI.getTools(filterParams);
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
      const data = await reviewsAPI.getReviews('pending');
      setReviews(data);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  // Load tools when user is authenticated
  useEffect(() => {
    if (user) {
      fetchTools();
    }
  }, [filters, user]);

  // Load reviews when admin switches to review view
  useEffect(() => {
    if (isAdmin && activeView === 'reviews' && user) {
      fetchReviews();
    }
  }, [isAdmin, activeView, user]);

  // Add tool handler
  const handleAddTool = async () => {
    if (!toolForm.name || !toolForm.category || !toolForm.pricing_model) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      await toolsAPI.addTool(toolForm);
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

  // Edit tool handler
  const handleEditTool = async () => {
    if (!editingTool) return;

    try {
      setLoading(true);
      await toolsAPI.updateTool(editingTool.id, {
        name: editingTool.name,
        use_case: editingTool.use_case,
        category: editingTool.category,
        pricing_model: editingTool.pricing_model
      });
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

  // Delete tool handler
  const handleDeleteTool = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tool?')) return;

    try {
      setLoading(true);
      await toolsAPI.deleteTool(id);
      await fetchTools();
      alert('Tool deleted successfully!');
    } catch (err) {
      alert('Failed to delete tool');
      console.error('Error deleting tool:', err);
    } finally {
      setLoading(false);
    }
  };

  // Submit review handler
  const handleSubmitReview = async () => {
    if (!selectedTool) return;

    try {
      setLoading(true);
      await reviewsAPI.submitReview({
        tool_id: selectedTool.id,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      });
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

  // Moderate review handler
  const handleReviewAction = async (reviewId: string, action: string) => {
    try {
      setLoading(true);
      await reviewsAPI.moderateReview(reviewId, action);
      await fetchReviews();
      await fetchTools();
      alert(`Review ${action} successfully!`);
    } catch (err) {
      alert('Failed to moderate review');
      console.error('Error moderating review:', err);
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Show login/register if not authenticated
  if (!user) {
    if (authView === 'login') {
      return (
        <Login
          onLogin={handleLogin}
          onSwitchToRegister={() => {
            setAuthView('register');
            setAuthError('');
          }}
          loading={authLoading}
          error={authError}
        />
      );
    } else {
      return (
        <Register
          onRegister={handleRegister}
          onSwitchToLogin={() => {
            setAuthView('login');
            setAuthError('');
          }}
          loading={authLoading}
          error={authError}
        />
      );
    }
  }

  // Main app (authenticated)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <AuthHeader 
        user={user} 
        isAdmin={isAdmin} 
        onToggleAdmin={() => setIsAdmin(!isAdmin)} 
        onLogout={handleLogout}
      />

      {error && (
        <div className="max-w-7xl mx-auto px-4 py-4 animate-fade-in">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-md">
            {error}
          </div>
        </div>
      )}

      {isAdmin && (
        <AdminNavigation
          activeView={activeView}
          onViewChange={setActiveView}
          pendingReviewCount={reviews.length}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeView === 'catalog' ? (
          <>
            <FiltersPanel filters={filters} onFilterChange={setFilters} />

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

            {loading && (
              <div className="flex justify-center py-12">
                <Loader className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            )}

            {!loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tools.map((tool) => (
                  <ToolCard
  key={tool.id}
  tool={tool}
  isAdmin={isAdmin}
  onEdit={(t) => setEditingTool({ ...t })}
  onDelete={handleDeleteTool}
  onReview={(t) => {
    setSelectedTool(t);
    setShowReview(true);
  }}
  onViewReviews={handleViewReviews} // Add this prop
/>
                ))}
              </div>
            )}

            {!loading && tools.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  No tools found. {isAdmin ? 'Add some tools to get started!' : 'Check back later.'}
                </p>
              </div>
            )}
          </>
        ) : (
          <ReviewModeration
            reviews={reviews}
            loading={loading}
            onAction={handleReviewAction}
          />
        )}
      </div>

      {(showAddTool || editingTool) && (
        <ToolModal
          tool={editingTool}
          toolForm={toolForm}
          isEditing={!!editingTool}
          loading={loading}
          onSave={editingTool ? handleEditTool : handleAddTool}
          onCancel={() => {
            setShowAddTool(false);
            setEditingTool(null);
            setToolForm({ name: '', use_case: '', category: '', pricing_model: '' });
          }}
          onChange={(field, value) => {
            if (editingTool) {
              setEditingTool({ ...editingTool, [field]: value });
            } else {
              setToolForm({ ...toolForm, [field]: value });
            }
          }}
        />
      )}

      {showReview && selectedTool && (
        <ReviewModal
          tool={selectedTool}
          reviewForm={reviewForm}
          loading={loading}
          onSubmit={handleSubmitReview}
          onCancel={() => {
            setShowReview(false);
            setSelectedTool(null);
            setReviewForm({ rating: 5, comment: '' });
          }}
          onChange={(field, value) => {
            setReviewForm({ ...reviewForm, [field]: value });
          }}
        />
      )}
      {showReviewHistory && reviewHistoryTool && (
  <ReviewHistoryModal
    tool={reviewHistoryTool}
    onClose={() => {
      setShowReviewHistory(false);
      setReviewHistoryTool(null);
    }}
  />
)}
    </div>
  );
};

export default App;