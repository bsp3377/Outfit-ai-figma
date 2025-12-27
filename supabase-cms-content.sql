-- ============================================
-- OUTFIT AI - COMPLETE CMS CONTENT SCHEMA
-- ============================================
-- Run this in your Supabase SQL Editor to set up
-- all content management tables with seed data
-- ============================================

-- ============================================
-- 1. SITE CONTENT TABLE (Enhanced)
-- ============================================
-- Stores all editable content: text, images, videos

CREATE TABLE IF NOT EXISTS site_content (
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

DROP POLICY IF EXISTS "Anyone can read site content" ON site_content;
CREATE POLICY "Anyone can read site content" ON site_content 
  FOR SELECT USING (true);

-- ============================================
-- 2. TESTIMONIALS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS testimonials (
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

DROP POLICY IF EXISTS "Anyone can read testimonials" ON testimonials;
CREATE POLICY "Anyone can read testimonials" ON testimonials 
  FOR SELECT USING (true);

-- ============================================
-- 3. PARTNER LOGOS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS partner_logos (
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

DROP POLICY IF EXISTS "Anyone can read partner logos" ON partner_logos;
CREATE POLICY "Anyone can read partner logos" ON partner_logos 
  FOR SELECT USING (true);

-- ============================================
-- 4. TERMS AND CONDITIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS terms_and_conditions (
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

DROP POLICY IF EXISTS "Anyone can read terms" ON terms_and_conditions;
CREATE POLICY "Anyone can read terms" ON terms_and_conditions 
  FOR SELECT USING (true);

-- ============================================
-- 5. SEED DATA: HERO SECTION
-- ============================================

INSERT INTO site_content (section, content_key, content_value, display_order) VALUES
('hero', 'hero_title', 'Generate studio-quality product photos', 1),
('hero', 'hero_title_highlight', 'instantly', 2),
('hero', 'hero_subtitle', 'Transform your product images into professional model shots, jewelry close-ups, and stylish flatlays with AI. No photoshoot required.', 3),
('hero', 'hero_cta_primary', 'Start Free', 4),
('hero', 'hero_cta_secondary', 'View Demo', 5)
ON CONFLICT (section, content_key) DO UPDATE SET 
  content_value = EXCLUDED.content_value,
  updated_at = NOW();

-- Hero images (placeholder - update with your actual URLs)
INSERT INTO site_content (section, content_key, image_url, display_order) VALUES
('hero', 'hero_before', 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800', 1),
('hero', 'hero_after', 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800', 2)
ON CONFLICT (section, content_key) DO UPDATE SET 
  image_url = EXCLUDED.image_url,
  updated_at = NOW();

-- ============================================
-- 6. SEED DATA: STEPS SECTION
-- ============================================

INSERT INTO site_content (section, content_key, content_value, display_order) VALUES
('steps', 'step1_title', 'Upload your product', 1),
('steps', 'step1_desc', 'Drop your product image or paste a URL', 2),
('steps', 'step2_title', 'Choose your style', 3),
('steps', 'step2_desc', 'Select model, flatlay, or close-up preset', 4),
('steps', 'step3_title', 'Generate & download', 5),
('steps', 'step3_desc', 'Get your high-res PNG in seconds', 6)
ON CONFLICT (section, content_key) DO UPDATE SET 
  content_value = EXCLUDED.content_value,
  updated_at = NOW();

-- ============================================
-- 7. SEED DATA: GALLERY SECTION (Landing page text)
-- ============================================

INSERT INTO site_content (section, content_key, content_value, display_order) VALUES
('landing', 'gallery_title', 'See the transformation', 1),
('landing', 'gallery_subtitle', 'Drag the slider to compare before and after results across different product categories', 2),
('landing', 'apparel_title', 'Apparel', 3),
('landing', 'apparel_desc', 'From flat product to runway ready', 4),
('landing', 'jewelry_title', 'Jewelry', 5),
('landing', 'jewelry_desc', 'Showcase elegance on real models', 6),
('landing', 'shoes_title', 'Footwear', 7),
('landing', 'shoes_desc', 'Step up your product presentation', 8),
('landing', 'handbag_title', 'Accessories', 9),
('landing', 'handbag_desc', 'Bags and accessories in context', 10),
('landing', 'watch_title', 'Watches', 11),
('landing', 'watch_desc', 'Luxury timepieces in lifestyle settings', 12),
('landing', 'fashion_title', 'Fashion', 13),
('landing', 'fashion_desc', 'Professional studio quality instantly', 14)
ON CONFLICT (section, content_key) DO UPDATE SET 
  content_value = EXCLUDED.content_value,
  updated_at = NOW();

-- ============================================
-- 8. SEED DATA: BEFORE/AFTER GALLERY IMAGES
-- ============================================

INSERT INTO site_content (section, content_key, image_url, display_order) VALUES
-- Apparel
('before_after', 'apparel_before', 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600', 1),
('before_after', 'apparel_after', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600', 2),
-- Jewelry
('before_after', 'jewelry_before', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600', 3),
('before_after', 'jewelry_after', 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600', 4),
-- Shoes
('before_after', 'shoes_before', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', 5),
('before_after', 'shoes_after', 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600', 6),
-- Handbag
('before_after', 'handbag_before', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600', 7),
('before_after', 'handbag_after', 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600', 8),
-- Watch
('before_after', 'watch_before', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600', 9),
('before_after', 'watch_after', 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600', 10),
-- Fashion
('before_after', 'fashion_before', 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600', 11),
('before_after', 'fashion_after', 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600', 12)
ON CONFLICT (section, content_key) DO UPDATE SET 
  image_url = EXCLUDED.image_url,
  updated_at = NOW();

-- ============================================
-- 9. SEED DATA: FEATURE CARDS
-- ============================================

INSERT INTO site_content (section, content_key, content_value, display_order) VALUES
('landing', 'transform_title', 'Transform any product, any style', 1),
('landing', 'transform_subtitle', 'Professional photography made accessible with AI-powered generation', 2),
('landing', 'feature_model_title', 'Fashion Model', 3),
('landing', 'feature_model_desc', 'Place your apparel on diverse AI models with studio lighting', 4),
('landing', 'feature_jewelry_title', 'Jewelry Close-up', 5),
('landing', 'feature_jewelry_desc', 'Macro shots with perfect reflections and premium aesthetics', 6),
('landing', 'feature_flatlay_title', 'Flatlay Pro', 7),
('landing', 'feature_flatlay_desc', 'Styled overhead compositions for social media impact', 8)
ON CONFLICT (section, content_key) DO UPDATE SET 
  content_value = EXCLUDED.content_value,
  updated_at = NOW();

-- Feature card images
INSERT INTO site_content (section, content_key, image_url, display_order) VALUES
('features', 'fashion_model_image', 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600', 1),
('features', 'jewelry_closeup_image', 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600', 2),
('features', 'flatlay_pro_image', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600', 3)
ON CONFLICT (section, content_key) DO UPDATE SET 
  image_url = EXCLUDED.image_url,
  updated_at = NOW();

-- ============================================
-- 10. SEED DATA: CTA SECTION
-- ============================================

INSERT INTO site_content (section, content_key, content_value, display_order) VALUES
('landing', 'cta_title', 'Ready to transform your product photos?', 1),
('landing', 'cta_subtitle', 'Join thousands of brands using AI to create stunning visuals', 2),
('landing', 'cta_button', 'Start Creating for Free', 3),
('landing', 'cta_note', 'No credit card required • 10 free generations', 4)
ON CONFLICT (section, content_key) DO UPDATE SET 
  content_value = EXCLUDED.content_value,
  updated_at = NOW();

-- ============================================
-- 11. SEED DATA: SOCIAL PROOF SECTION
-- ============================================

INSERT INTO site_content (section, content_key, content_value, display_order) VALUES
('social_proof', 'brands_tagline', 'Trusted by leading e-commerce brands', 1)
ON CONFLICT (section, content_key) DO UPDATE SET 
  content_value = EXCLUDED.content_value,
  updated_at = NOW();

-- ============================================
-- 12. SEED DATA: FOOTER
-- ============================================

INSERT INTO site_content (section, content_key, content_value, display_order) VALUES
('footer', 'copyright', '© 2024 Outfit AI. All rights reserved.', 1)
ON CONFLICT (section, content_key) DO UPDATE SET 
  content_value = EXCLUDED.content_value,
  updated_at = NOW();

-- ============================================
-- 13. SEED DATA: BRANDING
-- ============================================

INSERT INTO site_content (section, content_key, image_url, display_order) VALUES
('branding', 'logo', '', 1)  -- Will use local logo as fallback
ON CONFLICT (section, content_key) DO UPDATE SET 
  image_url = EXCLUDED.image_url,
  updated_at = NOW();

-- ============================================
-- 14. SEED DATA: TESTIMONIALS
-- ============================================

INSERT INTO testimonials (author_name, author_title, author_company, content, rating, display_order) VALUES
(
  'Sarah Chen',
  'Head of E-commerce',
  'StyleCo',
  'Cut our product photography costs by 80%. The AI models look incredibly realistic and our conversion rate actually improved.',
  5,
  1
),
(
  'Marcus Rodriguez',
  'Founder',
  'LuxeGems',
  'Game changer for our jewelry line. The close-ups capture details our photographer struggled with. Export quality is print-ready.',
  5,
  2
)
ON CONFLICT DO NOTHING;

-- ============================================
-- 15. SEED DATA: PARTNER LOGOS (Placeholders)
-- ============================================

INSERT INTO partner_logos (name, logo_url, display_order) VALUES
('Brand 1', '', 1),
('Brand 2', '', 2),
('Brand 3', '', 3),
('Brand 4', '', 4),
('Brand 5', '', 5)
ON CONFLICT DO NOTHING;

-- ============================================
-- 16. SEED DATA: LEGAL DOCUMENTS
-- ============================================

INSERT INTO terms_and_conditions (title, slug, content, display_order) VALUES
(
  'Terms and Conditions',
  'terms',
  '<p><strong>Last Updated:</strong> December 27, 2024</p>
<h3>1. Acceptance of Terms</h3>
<p>By accessing or using Outfit AI Studio ("Platform", "Service", "we", "our", "us"), you agree to be bound by these Terms and Conditions.</p>
<h3>2. Service Description</h3>
<p>Outfit AI Studio provides AI-generated product images, virtual fashion models, image customization, and credit-based usage plans.</p>
<h3>3. Credits & Usage</h3>
<p>Image generation operates on a credit-based system. Credits once used are non-refundable.</p>
<h3>4. Contact</h3>
<p>Email: support@outfitai.studio</p>',
  1
),
(
  'Privacy Policy',
  'privacy-policy',
  '<p><strong>Last Updated:</strong> December 27, 2024</p>
<h3>1. Information We Collect</h3>
<p>We collect information you provide directly: email, name, uploaded images, and payment information.</p>
<h3>2. How We Use Your Information</h3>
<p>To provide our services, process payments, send communications, and improve our platform.</p>
<h3>3. Data Security</h3>
<p>We implement industry-standard security measures to protect your data.</p>
<h3>4. Contact</h3>
<p>Email: privacy@outfitai.studio</p>',
  2
),
(
  'Support',
  'support',
  '<h3>How can we help?</h3>
<p>For any questions or issues, please contact us:</p>
<p>📧 Email: <a href="mailto:support@outfitai.studio">support@outfitai.studio</a></p>
<p>🌐 Website: <a href="https://outfitai.studio">https://outfitai.studio</a></p>
<h3>FAQ</h3>
<p><strong>How do credits work?</strong></p>
<p>Each image generation uses 1 credit. Free accounts start with 10 credits.</p>
<p><strong>What image formats are supported?</strong></p>
<p>We support PNG, JPG, and WebP uploads.</p>',
  3
),
(
  'Refund Policy',
  'refund-policy',
  '<p><strong>Last Updated:</strong> December 27, 2024</p>
<h3>Refund Eligibility</h3>
<p>Refunds are available within 7 days of purchase if no credits have been used.</p>
<h3>How to Request a Refund</h3>
<p>Contact support@outfitai.studio with your order details.</p>
<h3>Non-Refundable Items</h3>
<p>Used credits and promotional credits are non-refundable.</p>',
  4
)
ON CONFLICT (slug) DO UPDATE SET 
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  updated_at = NOW();

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- Your CMS is now ready with all seed data.
-- Edit content directly in Supabase dashboard:
--   - site_content: Text, images, videos
--   - testimonials: Customer reviews
--   - partner_logos: Brand logos
--   - terms_and_conditions: Legal pages
-- ============================================
