// src/types/index.ts

export interface Tool {
  id: string;
  name: string;
  use_case: string;
  category: string;
  pricing_model: string;
  average_rating: number;
  review_count: number;
}

export interface Review {
  id: string;
  tool_id: string;
  tool_name: string;
  rating: number;
  comment: string;
  status: string;
  date: string;
}

export interface Filters {
  category: string;
  pricing: string;
  minRating: number;
}

export interface ToolForm {
  name: string;
  use_case: string;
  category: string;
  pricing_model: string;
}

export interface ReviewForm {
  rating: number;
  comment: string;
}