-- Quick Fix for Storage RLS Policy Error
-- Run this in your Supabase SQL Editor to fix the "row-level security policy" error

-- Drop all existing policies for test-results bucket
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes" ON storage.objects;
DROP POLICY IF EXISTS "Allow public updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated reads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;

-- Ensure bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('test-results', 'test-results', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Create new policies that allow public access
CREATE POLICY "test-results-public-upload"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'test-results');

CREATE POLICY "test-results-public-read"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'test-results');

CREATE POLICY "test-results-public-update"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'test-results')
WITH CHECK (bucket_id = 'test-results');

CREATE POLICY "test-results-public-delete"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'test-results');














