-- Ensure author_name exists (it should, but just in case)
ALTER TABLE testimonials 
ADD COLUMN IF NOT EXISTS author_name TEXT;

-- Add company_name column if it doesn't exist
ALTER TABLE testimonials 
ADD COLUMN IF NOT EXISTS company_name TEXT;

-- Optional: Add author_title if we want to support it later/verify it exists
ALTER TABLE testimonials 
ADD COLUMN IF NOT EXISTS author_title TEXT;
