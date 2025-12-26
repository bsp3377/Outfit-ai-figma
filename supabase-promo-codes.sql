-- Promo Codes Table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  credits INTEGER NOT NULL DEFAULT 50,
  is_used BOOLEAN DEFAULT false,
  used_by UUID REFERENCES auth.users(id),
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

-- Anyone can read promo codes (for validation)
CREATE POLICY "Anyone can read promo codes" ON promo_codes 
  FOR SELECT USING (true);

-- Only authenticated users can update (to mark as used)
CREATE POLICY "Authenticated users can update promo codes" ON promo_codes 
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Example: Insert a test promo code
-- INSERT INTO promo_codes (code, credits, expires_at) 
-- VALUES ('LAUNCH50', 50, '2025-12-31');
