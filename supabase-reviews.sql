-- Add user_id to testimonials
ALTER TABLE testimonials 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Enable RLS
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read featured testimonials
DROP POLICY IF EXISTS "Public read featured testimonials" ON testimonials;
CREATE POLICY "Public read featured testimonials" 
ON testimonials FOR SELECT 
USING (is_featured = true);

-- Policy: Authenticated users can read their own testimonials (even if not featured)
DROP POLICY IF EXISTS "Users can read own testimonials" ON testimonials;
CREATE POLICY "Users can read own testimonials" 
ON testimonials FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Policy: Authenticated users can insert their own testimonials
DROP POLICY IF EXISTS "Users can insert own testimonials" ON testimonials;
CREATE POLICY "Users can insert own testimonials" 
ON testimonials FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Policy: Authenticated users can update their own testimonials
DROP POLICY IF EXISTS "Users can update own testimonials" ON testimonials;
CREATE POLICY "Users can update own testimonials" 
ON testimonials FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

-- Allow admins (service role) to do everything - implicitly allowed, but good to be explicit if using dashboard
-- No specific policy needed for service role usually, it bypasses RLS.
