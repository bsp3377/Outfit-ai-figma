-- ============================================
-- FIX SUPABASE SECURITY WARNINGS
-- ============================================

-- ============================================
-- 1. FIX: Function Search Path Mutable
-- Set search_path for handle_new_user function
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
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
$$ LANGUAGE plpgsql;

-- ============================================
-- 2. FIX: Leaked Password Protection
-- This needs to be enabled in Supabase Dashboard:
-- Go to: Authentication > Providers > Email
-- Enable "Leaked password protection"
-- ============================================

-- Note: Leaked Password Protection cannot be enabled via SQL
-- You must enable it in the Supabase Dashboard:
-- 1. Go to Authentication (left sidebar)
-- 2. Click "Providers" tab
-- 3. Click on "Email" provider
-- 4. Enable "Protect against leaked passwords"

-- ============================================
-- DONE! Both warnings should be resolved.
-- ============================================
