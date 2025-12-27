-- ============================================
-- RESTORE USER CREDITS & PLAN
-- ============================================
-- STEP 1: Sign up with your email (bsp3377@gmail.com) in the app
-- STEP 2: Run this SQL to restore your Pro plan and credits
-- ============================================

-- Update credits for bsp3377@gmail.com (restore Pro plan with 100 credits, 4 used)
UPDATE user_credits 
SET 
  plan_tier = 'pro',
  credits_total = 100,
  credits_used = 4,
  renewal_date = '2026-01-26 13:06:27.435+00',
  updated_at = NOW()
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'bsp3377@gmail.com'
);

-- Update profile name
UPDATE profiles
SET 
  full_name = 'Senthil Prabhu B',
  updated_at = NOW()
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'bsp3377@gmail.com'
);

-- ============================================
-- OPTIONAL: If you also want to restore testuser99
-- Sign up with testuser99@example.com first, then run:
-- ============================================

-- UPDATE user_credits 
-- SET 
--   plan_tier = 'free',
--   credits_total = 10,
--   credits_used = 0,
--   updated_at = NOW()
-- WHERE user_id = (
--   SELECT id FROM auth.users WHERE email = 'testuser99@example.com'
-- );

-- UPDATE profiles
-- SET 
--   full_name = 'Test User',
--   updated_at = NOW()
-- WHERE id = (
--   SELECT id FROM auth.users WHERE email = 'testuser99@example.com'
-- );

-- ============================================
-- DONE! Your Pro plan and credits are restored.
-- ============================================
