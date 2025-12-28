-- ============================================
-- UPDATE BEFORE/AFTER IMAGES
-- ============================================
-- Run this in Supabase SQL Editor to change the images
-- Replace the URL strings with your new image URLs
-- ============================================

-- Update Apparel Before Image
UPDATE site_content
SET image_url = 'https://your-new-image-url-here/before.jpg'
WHERE section = 'before_after' AND content_key = 'apparel_before';

-- Update Apparel After Image
UPDATE site_content
SET image_url = 'https://your-new-image-url-here/after.jpg'
WHERE section = 'before_after' AND content_key = 'apparel_after';

-- ============================================
-- OTHER CATEGORIES (Uncomment to use)
-- ============================================

-- Jewelry
-- UPDATE site_content SET image_url = '...' WHERE section = 'before_after' AND content_key = 'jewelry_before';
-- UPDATE site_content SET image_url = '...' WHERE section = 'before_after' AND content_key = 'jewelry_after';

-- Shoes
-- UPDATE site_content SET image_url = '...' WHERE section = 'before_after' AND content_key = 'shoes_before';
-- UPDATE site_content SET image_url = '...' WHERE section = 'before_after' AND content_key = 'shoes_after';
