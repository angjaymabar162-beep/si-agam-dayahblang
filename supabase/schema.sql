-- UwaisPrompts Database Schema
-- Supabase PostgreSQL Schema with RLS Policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  credits INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prompts table
CREATE TABLE IF NOT EXISTS prompts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  tags TEXT[] DEFAULT '{}',
  price INTEGER DEFAULT 0,
  creator_id UUID REFERENCES users(id) NOT NULL,
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  sales_count INTEGER DEFAULT 0,
  rating_average DECIMAL(2,1) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchases table
CREATE TABLE IF NOT EXISTS purchases (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  buyer_id UUID REFERENCES users(id) NOT NULL,
  prompt_id UUID REFERENCES prompts(id) NOT NULL,
  price_paid INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(buyer_id, prompt_id)
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  prompt_id UUID REFERENCES prompts(id) NOT NULL,
  user_id UUID REFERENCES users(id) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(prompt_id, user_id)
);

-- Badges table
CREATE TABLE IF NOT EXISTS badges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User badges junction table
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  badge_id UUID REFERENCES badges(id) NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Streaks table
CREATE TABLE IF NOT EXISTS streaks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_active_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leaderboard view
CREATE OR REPLACE VIEW leaderboard AS
SELECT 
  u.id as user_id,
  u.username,
  u.avatar_url,
  COALESCE(SUM(p.sales_count), 0) as total_sales,
  COALESCE(SUM(p.sales_count * p.price), 0) as total_revenue,
  CASE 
    WHEN COALESCE(SUM(p.sales_count), 0) = 0 THEN 0
    ELSE (COALESCE(SUM(p.rating_average * p.rating_count), 0) / NULLIF(SUM(p.rating_count), 0))::numeric(3,1)
  END as reputation_score
FROM users u
LEFT JOIN prompts p ON u.id = p.creator_id AND p.is_published = true
GROUP BY u.id, u.username, u.avatar_url
ORDER BY total_revenue DESC, reputation_score DESC;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_prompts_category ON prompts(category);
CREATE INDEX IF NOT EXISTS idx_prompts_creator ON prompts(creator_id);
CREATE INDEX IF NOT EXISTS idx_prompts_featured ON prompts(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_purchases_buyer ON purchases(buyer_id);
CREATE INDEX IF NOT EXISTS idx_purchases_prompt ON purchases(prompt_id);
CREATE INDEX IF NOT EXISTS idx_reviews_prompt ON reviews(prompt_id);
CREATE INDEX IF NOT EXISTS idx_activities_user ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);

-- Row Level Security (RLS) Policies

-- Users table policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Prompts table policies
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published prompts"
  ON prompts FOR SELECT
  USING (is_published = true OR auth.uid() = creator_id);

CREATE POLICY "Users can create prompts"
  ON prompts FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update own prompts"
  ON prompts FOR UPDATE
  USING (auth.uid() = creator_id);

CREATE POLICY "Users can delete own prompts"
  ON prompts FOR DELETE
  USING (auth.uid() = creator_id);

-- Purchases table policies
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own purchases"
  ON purchases FOR SELECT
  USING (auth.uid() = buyer_id);

CREATE POLICY "Users can create purchases"
  ON purchases FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

-- Reviews table policies
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create reviews for purchased prompts"
  ON reviews FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM purchases 
      WHERE buyer_id = auth.uid() AND prompt_id = reviews.prompt_id
    )
  );

CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON reviews FOR DELETE
  USING (auth.uid() = user_id);

-- Badges table policies
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view badges"
  ON badges FOR SELECT
  USING (true);

-- User badges table policies
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view user badges"
  ON user_badges FOR SELECT
  USING (true);

CREATE POLICY "System can insert user badges"
  ON user_badges FOR INSERT
  WITH CHECK (true);

-- Streaks table policies
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view streaks"
  ON streaks FOR SELECT
  USING (true);

CREATE POLICY "Users can update own streak"
  ON streaks FOR UPDATE
  USING (auth.uid() = user_id);

-- Activities table policies
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activities"
  ON activities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create activities"
  ON activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Notifications table policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- Functions

-- Function to update streak
CREATE OR REPLACE FUNCTION update_streak(user_uuid UUID)
RETURNS void AS $$
DECLARE
  last_active DATE;
  current_streak_val INTEGER;
  longest_streak_val INTEGER;
BEGIN
  SELECT last_active_date, current_streak, longest_streak
  INTO last_active, current_streak_val, longest_streak_val
  FROM streaks
  WHERE user_id = user_uuid;

  IF last_active IS NULL THEN
    INSERT INTO streaks (user_id, current_streak, longest_streak, last_active_date)
    VALUES (user_uuid, 1, 1, CURRENT_DATE);
  ELSIF last_active = CURRENT_DATE THEN
    -- Already active today, do nothing
    NULL;
  ELSIF last_active = CURRENT_DATE - INTERVAL '1 day' THEN
    -- Consecutive day, increment streak
    UPDATE streaks
    SET current_streak = current_streak + 1,
        longest_streak = GREATEST(longest_streak, current_streak + 1),
        last_active_date = CURRENT_DATE
    WHERE user_id = user_uuid;
  ELSE
    -- Streak broken, reset
    UPDATE streaks
    SET current_streak = 1,
        last_active_date = CURRENT_DATE
    WHERE user_id = user_uuid;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to purchase prompt
CREATE OR REPLACE FUNCTION purchase_prompt(buyer_uuid UUID, prompt_uuid UUID)
RETURNS boolean AS $$
DECLARE
  prompt_price INTEGER;
  prompt_creator UUID;
  buyer_credits INTEGER;
BEGIN
  -- Get prompt details
  SELECT price, creator_id INTO prompt_price, prompt_creator
  FROM prompts
  WHERE id = prompt_uuid;

  -- Get buyer credits
  SELECT credits INTO buyer_credits
  FROM users
  WHERE id = buyer_uuid;

  -- Check if buyer has enough credits
  IF buyer_credits < prompt_price THEN
    RETURN false;
  END IF;

  -- Check if already purchased
  IF EXISTS (
    SELECT 1 FROM purchases 
    WHERE buyer_id = buyer_uuid AND prompt_id = prompt_uuid
  ) THEN
    RETURN false;
  END IF;

  -- Deduct credits from buyer
  UPDATE users
  SET credits = credits - prompt_price
  WHERE id = buyer_uuid;

  -- Add credits to creator
  UPDATE users
  SET credits = credits + prompt_price
  WHERE id = prompt_creator;

  -- Create purchase record
  INSERT INTO purchases (buyer_id, prompt_id, price_paid)
  VALUES (buyer_uuid, prompt_uuid, prompt_price);

  -- Increment sales count
  UPDATE prompts
  SET sales_count = sales_count + 1
  WHERE id = prompt_uuid;

  -- Create activity
  INSERT INTO activities (user_id, type, metadata)
  VALUES (buyer_uuid, 'prompt_purchased', jsonb_build_object('prompt_id', prompt_uuid, 'price', prompt_price));

  INSERT INTO activities (user_id, type, metadata)
  VALUES (prompt_creator, 'prompt_sold', jsonb_build_object('prompt_id', prompt_uuid, 'price', prompt_price));

  -- Create notification for creator
  INSERT INTO notifications (user_id, title, message, type, metadata)
  VALUES (
    prompt_creator,
    'Prompt Sold!',
    'Someone purchased your prompt!',
    'sale',
    jsonb_build_object('prompt_id', prompt_uuid, 'price', prompt_price)
  );

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, username, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  
  INSERT INTO public.streaks (user_id, current_streak, longest_streak)
  VALUES (new.id, 0, 0);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default badges
INSERT INTO badges (name, description, icon, requirement_type, requirement_value) VALUES
('Rookie', 'Create your first prompt', 'star', 'prompts_generated', 1),
('Prompt Master', 'Create 10 prompts', 'zap', 'prompts_generated', 10),
('Prompt Guru', 'Create 50 prompts', 'crown', 'prompts_generated', 50),
('First Sale', 'Sell your first prompt', 'dollar-sign', 'prompts_sold', 1),
('Top Seller', 'Sell 10 prompts', 'trending-up', 'prompts_sold', 10),
('Sales Legend', 'Sell 100 prompts', 'award', 'prompts_sold', 100),
('Streak Starter', 'Maintain a 3-day streak', 'flame', 'streak', 3),
('Streak Keeper', 'Maintain a 7-day streak', 'fire', 'streak', 7),
('Streak Master', 'Maintain a 30-day streak', 'flame-kindling', 'streak', 30),
('Credit Earner', 'Earn 1000 credits', 'coins', 'credits_earned', 1000),
('Wealthy Creator', 'Earn 10000 credits', 'gem', 'credits_earned', 10000)
ON CONFLICT (name) DO NOTHING;
