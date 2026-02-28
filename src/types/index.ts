// User Types
export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  credits: number;
  created_at: string;
  updated_at: string;
}

export interface UserProfile extends User {
  streak_count: number;
  longest_streak: number;
  last_active_date: string | null;
  total_prompts_generated: number;
  total_prompts_purchased: number;
  total_prompts_sold: number;
  reputation_score: number;
}

// Prompt Types
export interface Prompt {
  id: string;
  title: string;
  description: string;
  content: string;
  category: PromptCategory;
  tags: string[];
  price: number;
  creator_id: string;
  creator?: User;
  is_published: boolean;
  is_featured: boolean;
  sales_count: number;
  rating_average: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
}

export type PromptCategory = 
  | 'writing'
  | 'coding'
  | 'marketing'
  | 'design'
  | 'business'
  | 'education'
  | 'creative'
  | 'productivity'
  | 'research'
  | 'other';

export interface PromptReview {
  id: string;
  prompt_id: string;
  user_id: string;
  user?: User;
  rating: number;
  comment: string;
  created_at: string;
}

// Purchase Types
export interface Purchase {
  id: string;
  buyer_id: string;
  prompt_id: string;
  prompt?: Prompt;
  price_paid: number;
  created_at: string;
}

// Gamification Types
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement_type: 'streak' | 'prompts_generated' | 'prompts_sold' | 'credits_earned' | 'special';
  requirement_value: number;
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  badge?: Badge;
  earned_at: string;
}

export interface Streak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_active_date: string;
  created_at: string;
}

export interface LeaderboardEntry {
  user_id: string;
  user?: User;
  score: number;
  rank: number;
}

// Activity Types
export interface Activity {
  id: string;
  user_id: string;
  type: ActivityType;
  metadata: Record<string, unknown>;
  created_at: string;
}

export type ActivityType = 
  | 'prompt_generated'
  | 'prompt_published'
  | 'prompt_purchased'
  | 'prompt_sold'
  | 'badge_earned'
  | 'streak_milestone'
  | 'review_received';

// Notification Types
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
}

export type NotificationType = 
  | 'sale'
  | 'purchase'
  | 'badge'
  | 'streak'
  | 'review'
  | 'system';

// AI Generation Types
export interface GenerationRequest {
  prompt: string;
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

export interface GenerationResponse {
  content: string;
  tokens_used: number;
  model: string;
}

// API Types
export interface ApiError {
  message: string;
  code: string;
  status: number;
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  username: string;
  full_name?: string;
}

export interface PromptFormData {
  title: string;
  description: string;
  content: string;
  category: PromptCategory;
  tags: string[];
  price: number;
}

// Filter Types
export interface PromptFilters {
  category?: PromptCategory | 'all';
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'newest' | 'popular' | 'price_low' | 'price_high' | 'rating';
  search?: string;
}
