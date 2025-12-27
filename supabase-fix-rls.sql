-- ============================================
-- FIX RLS: Allow inserts for migration
-- Run this in your NEW Supabase SQL Editor
-- ============================================

-- Allow anyone to insert into site_content (for migration)
DROP POLICY IF EXISTS "Anyone can insert site content" ON site_content;
CREATE POLICY "Anyone can insert site content" ON site_content 
  FOR INSERT WITH CHECK (true);

-- Allow anyone to insert into testimonials (for migration)
DROP POLICY IF EXISTS "Anyone can insert testimonials" ON testimonials;
CREATE POLICY "Anyone can insert testimonials" ON testimonials 
  FOR INSERT WITH CHECK (true);

-- Add missing column to testimonials
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS company_logo_url TEXT;

-- Allow anyone to insert into terms_and_conditions (for migration)
DROP POLICY IF EXISTS "Anyone can insert terms" ON terms_and_conditions;
CREATE POLICY "Anyone can insert terms" ON terms_and_conditions 
  FOR INSERT WITH CHECK (true);

-- Allow anyone to insert into promo_codes (for migration)  
DROP POLICY IF EXISTS "Anyone can insert promo codes" ON promo_codes;
CREATE POLICY "Anyone can insert promo codes" ON promo_codes 
  FOR INSERT WITH CHECK (true);

-- ============================================
-- RLS FIXED! Now run the migration script again
-- ============================================
