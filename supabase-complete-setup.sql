-- ============================================
-- OUTFIT AI - COMPLETE SUPABASE SETUP
-- ============================================
-- Safe to run multiple times (drops existing policies first)
-- Dashboard > SQL Editor > New Query > Paste & Run
-- ============================================

-- ============================================
-- SECTION 1: PROFILES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles 
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles 
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- SECTION 2: USER CREDITS TABLE
-- ============================================

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

DROP POLICY IF EXISTS "Users can view own credits" ON user_credits;
DROP POLICY IF EXISTS "Users can update own credits" ON user_credits;

CREATE POLICY "Users can view own credits" ON user_credits 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own credits" ON user_credits 
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- SECTION 3: GENERATED IMAGES TABLE
-- ============================================

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

DROP POLICY IF EXISTS "Users can view own images" ON generated_images;
DROP POLICY IF EXISTS "Users can insert own images" ON generated_images;
DROP POLICY IF EXISTS "Users can update own images" ON generated_images;
DROP POLICY IF EXISTS "Users can delete own images" ON generated_images;

CREATE POLICY "Users can view own images" ON generated_images 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own images" ON generated_images 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own images" ON generated_images 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own images" ON generated_images 
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- SECTION 4: UPLOADED ASSETS TABLE
-- ============================================

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

DROP POLICY IF EXISTS "Users can view own assets" ON uploaded_assets;
DROP POLICY IF EXISTS "Users can insert own assets" ON uploaded_assets;
DROP POLICY IF EXISTS "Users can delete own assets" ON uploaded_assets;

CREATE POLICY "Users can view own assets" ON uploaded_assets 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own assets" ON uploaded_assets 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own assets" ON uploaded_assets 
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- SECTION 5: GENERATION SETTINGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS generation_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tab_type TEXT CHECK (tab_type IN ('fashion', 'jewellery', 'flatlay')),
  settings_json JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tab_type)
);

ALTER TABLE generation_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own settings" ON generation_settings;
DROP POLICY IF EXISTS "Users can upsert own settings" ON generation_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON generation_settings;

CREATE POLICY "Users can view own settings" ON generation_settings 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upsert own settings" ON generation_settings 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON generation_settings 
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- SECTION 6: TRANSACTIONS TABLE
-- ============================================

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

DROP POLICY IF EXISTS "Users can view own transactions" ON user_transactions;

CREATE POLICY "Users can view own transactions" ON user_transactions 
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- SECTION 7: PROMO CODES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  credits INTEGER NOT NULL DEFAULT 50,
  for_user_email TEXT,
  is_used BOOLEAN DEFAULT false,
  used_by UUID REFERENCES auth.users(id),
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read promo codes" ON promo_codes;
DROP POLICY IF EXISTS "Authenticated users can update promo codes" ON promo_codes;

CREATE POLICY "Anyone can read promo codes" ON promo_codes 
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can update promo codes" ON promo_codes 
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- ============================================
-- SECTION 8: SITE CONTENT TABLE (CMS)
-- ============================================

CREATE TABLE IF NOT EXISTS site_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  content_type TEXT DEFAULT 'text' CHECK (content_type IN ('text', 'image', 'html', 'json')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read site content" ON site_content;

CREATE POLICY "Anyone can read site content" ON site_content 
  FOR SELECT USING (true);

-- ============================================
-- SECTION 9: AUTO-CREATE PROFILE ON SIGNUP
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  );
  
  INSERT INTO public.user_credits (user_id, plan_tier, credits_total, credits_used)
  VALUES (new.id, 'free', 10, 0);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- SECTION 10: CREATE STORAGE BUCKETS
-- ============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('generated-images', 'generated-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('uploaded-assets', 'uploaded-assets', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SECTION 11: STORAGE BUCKET POLICIES
-- ============================================

DROP POLICY IF EXISTS "Anyone can view generated images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload generated images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own generated images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view uploaded assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own uploaded assets" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;

CREATE POLICY "Anyone can view generated images"
ON storage.objects FOR SELECT USING (bucket_id = 'generated-images');

CREATE POLICY "Authenticated users can upload generated images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'generated-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete own generated images"
ON storage.objects FOR DELETE
USING (bucket_id = 'generated-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view uploaded assets"
ON storage.objects FOR SELECT USING (bucket_id = 'uploaded-assets');

CREATE POLICY "Authenticated users can upload assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'uploaded-assets' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete own uploaded assets"
ON storage.objects FOR DELETE
USING (bucket_id = 'uploaded-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================
-- ✅ SETUP COMPLETE!
-- ============================================
