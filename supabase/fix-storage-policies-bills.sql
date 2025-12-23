-- Quick Fix for Medical Bills Storage RLS Policy Error
-- Run this in your Supabase SQL Editor to fix the "row-level security policy" error

-- Step 1: Ensure bucket exists and is public
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('medical-bills', 'medical-bills', true, 10485760, ARRAY['application/pdf'])
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf'];

-- Step 2: Drop all existing policies for medical-bills bucket (to avoid conflicts)
DROP POLICY IF EXISTS "medical-bills-public-upload" ON storage.objects;
DROP POLICY IF EXISTS "medical-bills-public-read" ON storage.objects;
DROP POLICY IF EXISTS "medical-bills-public-delete" ON storage.objects;
DROP POLICY IF EXISTS "medical-bills-public-update" ON storage.objects;
DROP POLICY IF EXISTS "medical-bills-authenticated-upload" ON storage.objects;
DROP POLICY IF EXISTS "medical-bills-authenticated-read" ON storage.objects;
DROP POLICY IF EXISTS "medical-bills-authenticated-delete" ON storage.objects;
DROP POLICY IF EXISTS "medical-bills-authenticated-update" ON storage.objects;

-- Step 3: Create new policies that allow public access
-- Policy: Allow public uploads
CREATE POLICY "medical-bills-public-upload"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'medical-bills');

-- Policy: Allow public reads
CREATE POLICY "medical-bills-public-read"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'medical-bills');

-- Policy: Allow public updates (for replacing files)
CREATE POLICY "medical-bills-public-update"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'medical-bills')
WITH CHECK (bucket_id = 'medical-bills');

-- Policy: Allow public deletes
CREATE POLICY "medical-bills-public-delete"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'medical-bills');

