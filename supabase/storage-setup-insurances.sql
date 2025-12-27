-- Supabase Storage Setup for Insurance Policy PDFs
-- Run this SQL in your Supabase SQL Editor

-- Step 1: Create the storage bucket for insurance policies (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('insurance-policies', 'insurance-policies', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Step 2: Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow public uploads insurance" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads insurance" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes insurance" ON storage.objects;
DROP POLICY IF EXISTS "Allow public updates insurance" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads insurance" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated reads insurance" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes insurance" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates insurance" ON storage.objects;

-- Step 3: Create policies to allow public access (for testing without authentication)
-- These policies allow anyone to upload, read, and delete files in the insurance-policies bucket

-- Policy: Allow public uploads
CREATE POLICY "Allow public uploads insurance"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'insurance-policies');

-- Policy: Allow public reads
CREATE POLICY "Allow public reads insurance"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'insurance-policies');

-- Policy: Allow public updates (for replacing files)
CREATE POLICY "Allow public updates insurance"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'insurance-policies')
WITH CHECK (bucket_id = 'insurance-policies');

-- Policy: Allow public deletes
CREATE POLICY "Allow public deletes insurance"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'insurance-policies');

-- Note: If you want to restrict to authenticated users only, 
-- replace the above policies with these instead:
/*
DROP POLICY IF EXISTS "Allow public uploads insurance" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads insurance" ON storage.objects;
DROP POLICY IF EXISTS "Allow public updates insurance" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes insurance" ON storage.objects;

CREATE POLICY "Allow authenticated uploads insurance"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'insurance-policies');

CREATE POLICY "Allow authenticated reads insurance"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'insurance-policies');

CREATE POLICY "Allow authenticated updates insurance"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'insurance-policies')
WITH CHECK (bucket_id = 'insurance-policies');

CREATE POLICY "Allow authenticated deletes insurance"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'insurance-policies');
*/

