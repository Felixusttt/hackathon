// src/services/api.ts

import { API_BASE } from '../constants';
import { Tool, Review, ToolForm } from '../types';

// Helper function to get auth headers
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const toolsAPI = {
  // Fetch all tools with optional filters
  async getTools(filters?: { category?: string; pricing?: string; min_rating?: number }): Promise<Tool[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.pricing) params.append('pricing', filters.pricing);
    if (filters?.min_rating) params.append('min_rating', filters.min_rating.toString());
    
    const url = `${API_BASE}/tools${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to fetch tools' }));
      throw new Error(error.detail || 'Failed to fetch tools');
    }
    return response.json();
  },

  // Add a new tool
  async addTool(toolData: ToolForm): Promise<Tool> {
    const response = await fetch(`${API_BASE}/tools`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(toolData)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to add tool' }));
      throw new Error(error.detail || 'Failed to add tool');
    }
    return response.json();
  },

  // Update an existing tool
  async updateTool(id: string, toolData: Partial<ToolForm>): Promise<Tool> {
    const response = await fetch(`${API_BASE}/tools/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(toolData)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to update tool' }));
      throw new Error(error.detail || 'Failed to update tool');
    }
    return response.json();
  },

  // Delete a tool
  async deleteTool(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/tools/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to delete tool' }));
      throw new Error(error.detail || 'Failed to delete tool');
    }
  }
};

export const reviewsAPI = {
  // Fetch reviews with optional status filter
  async getReviews(status?: string): Promise<Review[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    
    const url = `${API_BASE}/reviews${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to fetch reviews' }));
      throw new Error(error.detail || 'Failed to fetch reviews');
    }
    return response.json();
  },

  // Submit a new review
  async submitReview(reviewData: { tool_id: string; rating: number; comment: string }): Promise<Review> {
    const response = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(reviewData)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to submit review' }));
      throw new Error(error.detail || 'Failed to submit review');
    }
    return response.json();
  },

  // Moderate a review (approve/reject)
  async moderateReview(id: string, status: string): Promise<Review> {
    const response = await fetch(`${API_BASE}/reviews/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to moderate review' }));
      throw new Error(error.detail || 'Failed to moderate review');
    }
    return response.json();
  }
};