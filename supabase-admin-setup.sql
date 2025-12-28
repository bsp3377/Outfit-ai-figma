-- ============================================
-- Admin Dashboard Database Setup
-- Run this in your Supabase SQL Editor
-- ============================================

-- Add admin and blocked flags to user_credits
ALTER TABLE user_credits 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

ALTER TABLE user_credits 
ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false;

-- Create system settings table for app-wide controls
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Insert default settings
INSERT INTO system_settings (key, value, description) VALUES 
    ('generation_enabled', 'true', 'Master switch for AI generation feature'),
    ('maintenance_mode', 'false', 'Set to true to show maintenance message'),
    ('max_free_credits', '10', 'Maximum credits for free tier users'),
    ('max_pro_credits', '100', 'Maximum credits for pro tier users')
ON CONFLICT (key) DO NOTHING;

-- Enable RLS on system_settings
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read system settings
DROP POLICY IF EXISTS "Public read system settings" ON system_settings;
CREATE POLICY "Public read system settings" 
ON system_settings FOR SELECT 
USING (true);

-- Policy: Only admins can update system settings
DROP POLICY IF EXISTS "Admins can update system settings" ON system_settings;
CREATE POLICY "Admins can update system settings" 
ON system_settings FOR UPDATE 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM user_credits 
        WHERE user_id = auth.uid() AND is_admin = true
    )
);

-- Create view for admin to see all users with their credits
CREATE OR REPLACE VIEW admin_user_view AS
SELECT 
    uc.user_id,
    au.email,
    au.raw_user_meta_data->>'full_name' as full_name,
    uc.plan_tier,
    uc.credits_total,
    uc.credits_used,
    (uc.credits_total - uc.credits_used) as credits_remaining,
    uc.renewal_date,
    uc.is_admin,
    uc.is_blocked,
    uc.created_at,
    uc.updated_at
FROM user_credits uc
LEFT JOIN auth.users au ON uc.user_id = au.id;

-- Grant access to the view
GRANT SELECT ON admin_user_view TO authenticated;

-- ============================================
-- IMPORTANT: Set yourself as admin
-- Replace 'YOUR_USER_ID' with your actual user ID
-- You can find this in the auth.users table
-- ============================================
-- UPDATE user_credits SET is_admin = true WHERE user_id = 'YOUR_USER_ID';

-- ============================================
-- Admin Dashboard Setup Complete!
-- ============================================
