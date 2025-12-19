-- ============================================
-- OUTFIT AI - COMPLETE SUPABASE SCHEMA
-- ============================================
-- Run this entire file in your Supabase SQL Editor
-- Dashboard > SQL Editor > New Query > Paste & Run
-- ============================================

-- ============================================
-- 1. PROFILES TABLE
-- ============================================
-- Stores user profile data, linked to Supabase Auth

CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles 
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- 2. USER CREDITS TABLE
-- ============================================
-- Tracks subscription plans and available credits

CREATE TABLE IF NOT EXISTS user_credits (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  plan_tier TEXT DEFAULT 'free' CHECK (plan_tier IN ('free', 'pro', 'corporate')),
  credits_total INT DEFAULT 10,
  credits_used INT DEFAULT 0,
  renewal_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own credits" ON user_credits 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own credits" ON user_credits 
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- 3. GENERATED IMAGES TABLE
-- ============================================
-- Stores AI-generated image history

CREATE TABLE IF NOT EXISTS generated_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  generation_type TEXT CHECK (generation_type IN ('fashion', 'jewellery', 'flatlay')),
  prompt_used TEXT,
  is_liked BOOLEAN DEFAULT false,
  is_auto_saved BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own images" ON generated_images 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own images" ON generated_images 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own images" ON generated_images 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own images" ON generated_images 
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 4. UPLOADED ASSETS TABLE
-- ============================================
-- Stores user-uploaded product images, logos, templates

CREATE TABLE IF NOT EXISTS uploaded_assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size_bytes BIGINT,
  asset_type TEXT CHECK (asset_type IN ('product', 'logo', 'template', 'inspired')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE uploaded_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own assets" ON uploaded_assets 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assets" ON uploaded_assets 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own assets" ON uploaded_assets 
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 5. GENERATION SETTINGS TABLE
-- ============================================
-- Persists user's last-used generation settings per tab

CREATE TABLE IF NOT EXISTS generation_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tab_type TEXT CHECK (tab_type IN ('fashion', 'jewellery', 'flatlay')),
  settings_json JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tab_type)
);

ALTER TABLE generation_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings" ON generation_settings 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own settings" ON generation_settings 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON generation_settings 
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- 6. TRANSACTIONS TABLE
-- ============================================
-- Logs billing transactions and credit purchases

CREATE TABLE IF NOT EXISTS user_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  transaction_type TEXT CHECK (transaction_type IN ('subscription', 'credit_pack', 'refund')),
  amount_display TEXT,
  credits_added INT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON user_transactions 
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- 7. AUTO-CREATE PROFILE ON SIGNUP (TRIGGER)
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  );
  
  -- Initialize credits (10 free credits for new users)
  INSERT INTO public.user_credits (user_id, plan_tier, credits_total, credits_used)
  VALUES (new.id, 'free', 10, 0);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if any, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- DONE! All tables created successfully.
-- ============================================
