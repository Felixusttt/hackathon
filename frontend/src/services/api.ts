// src/services/api.ts

import { API_BASE } from '../constants';
import { Tool, Review, ToolForm } from '../types';

export const toolsAPI = {
  // Fetch all tools with optional filters
  async getTools(filters?: { category?: string; pricing?: string; min_rating?: number }): Promise<Tool[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.pricing) params.append('pricing', filters.pricing);
    if (filters?.min_rating) params.append('min_rating', filters.min_rating.toString());
    
    const url = `${API_BASE}/tools${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url);
    
    if (!response.ok) throw new Error('Failed to fetch tools');
    return response.json();
  },

  // Add a new tool
  async addTool(toolData: ToolForm): Promise<Tool> {
    const response = await fetch(`${API_BASE}/tools`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toolData)
    });

    if (!response.ok) throw new Error('Failed to add tool');
    return response.json();
  },

  // Update an existing tool
  async updateTool(id: string, toolData: Partial<ToolForm>): Promise<Tool> {
    const response = await fetch(`${API_BASE}/tools/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toolData)
    });

    if (!response.ok) throw new Error('Failed to update tool');
    return response.json();
  },

  // Delete a tool
  async deleteTool(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/tools/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) throw new Error('Failed to delete tool');
  }
};

export const reviewsAPI = {
  // Fetch reviews with optional status filter
  async getReviews(status?: string): Promise<Review[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    
    const url = `${API_BASE}/reviews${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url);
    
    if (!response.ok) throw new Error('Failed to fetch reviews');
    return response.json();
  },

  // Submit a new review
  async submitReview(reviewData: { tool_id: string; rating: number; comment: string }): Promise<Review> {
    const response = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewData)
    });

    if (!response.ok) throw new Error('Failed to submit review');
    return response.json();
  },

  // Moderate a review (approve/reject)
  async moderateReview(id: string, status: string): Promise<Review> {
    const response = await fetch(`${API_BASE}/reviews/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });

    if (!response.ok) throw new Error('Failed to moderate review');
    return response.json();
  }
};