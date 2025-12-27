-- ============================================
-- FIX: Match testimonials to old database structure
-- Run this in your NEW Supabase SQL Editor
-- ============================================

-- Add ALL missing columns from old database
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS company_logo_url TEXT;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;

-- Drop columns that don't exist in old database (optional, skip if errors)
-- ALTER TABLE testimonials DROP COLUMN IF EXISTS author_company;
-- ALTER TABLE testimonials DROP COLUMN IF EXISTS avatar_url;
-- ALTER TABLE testimonials DROP COLUMN IF EXISTS display_order;

-- ============================================
-- Now insert the testimonials manually from old data:
-- ============================================

INSERT INTO testimonials (author_name, author_title, company_name, content, rating, is_featured, is_published) VALUES
(
  'Sarah Chen',
  'Head of E-commerce',
  'StyleCo',
  'Cut our product photography costs by 80%. The AI models look incredibly realistic and our conversion rate actually improved.',
  5,
  false,
  true
),
(
  'Marcus Rodriguez',
  'Founder',
  'LuxeGems',
  'Game changer for our jewelry line. The close-ups capture details our photographer struggled with. Export quality is print-ready.',
  5,
  false,
  true
)
ON CONFLICT DO NOTHING;

-- ============================================
-- TESTIMONIALS FIXED!
-- ============================================
