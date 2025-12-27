-- ============================================
-- FIX: Drop and recreate site_content table with correct structure
-- Run this FIRST, then run supabase-cms-content.sql
-- ============================================

-- Drop existing site_content table (will lose any data in it)
DROP TABLE IF EXISTS site_content CASCADE;

-- Create with correct structure matching the old database
CREATE TABLE site_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section TEXT NOT NULL,
  content_key TEXT NOT NULL,
  content_value TEXT,
  image_url TEXT,
  video_url TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(section, content_key)
);

ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read site content" ON site_content 
  FOR SELECT USING (true);

-- Create testimonials table
DROP TABLE IF EXISTS testimonials CASCADE;

CREATE TABLE testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_name TEXT NOT NULL,
  author_title TEXT,
  author_company TEXT,
  content TEXT NOT NULL,
  rating INT DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  avatar_url TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read testimonials" ON testimonials 
  FOR SELECT USING (true);

-- Create partner_logos table
DROP TABLE IF EXISTS partner_logos CASCADE;

CREATE TABLE partner_logos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE partner_logos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read partner logos" ON partner_logos 
  FOR SELECT USING (true);

-- Create terms_and_conditions table
DROP TABLE IF EXISTS terms_and_conditions CASCADE;

CREATE TABLE terms_and_conditions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE terms_and_conditions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read terms" ON terms_and_conditions 
  FOR SELECT USING (true);

-- ============================================
-- TABLES FIXED! 
-- Now run the migration script or supabase-cms-content.sql
-- ============================================
