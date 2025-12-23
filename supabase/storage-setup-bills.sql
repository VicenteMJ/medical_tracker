-- Supabase Storage Setup for Medical Bills PDFs
-- Run this SQL in your Supabase SQL Editor

-- Step 1: Create the storage bucket for medical bills (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('medical-bills', 'medical-bills', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Step 2: Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "medical-bills-public-upload" ON storage.objects;
DROP POLICY IF EXISTS "medical-bills-public-read" ON storage.objects;
DROP POLICY IF EXISTS "medical-bills-public-update" ON storage.objects;
DROP POLICY IF EXISTS "medical-bills-public-delete" ON storage.objects;
DROP POLICY IF EXISTS "medical-bills-authenticated-upload" ON storage.objects;
DROP POLICY IF EXISTS "medical-bills-authenticated-read" ON storage.objects;
DROP POLICY IF EXISTS "medical-bills-authenticated-update" ON storage.objects;
DROP POLICY IF EXISTS "medical-bills-authenticated-delete" ON storage.objects;

-- Step 3: Create policies to allow public access (for testing without authentication)
-- These policies allow anyone to upload, read, update, and delete files in the medical-bills bucket

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

-- Note: If you want to restrict to authenticated users only, 
-- replace the above policies with these instead:
/*
DROP POLICY IF EXISTS "medical-bills-public-upload" ON storage.objects;
DROP POLICY IF EXISTS "medical-bills-public-read" ON storage.objects;
DROP POLICY IF EXISTS "medical-bills-public-update" ON storage.objects;
DROP POLICY IF EXISTS "medical-bills-public-delete" ON storage.objects;

CREATE POLICY "medical-bills-authenticated-upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'medical-bills');

CREATE POLICY "medical-bills-authenticated-read"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'medical-bills');

CREATE POLICY "medical-bills-authenticated-update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'medical-bills')
WITH CHECK (bucket_id = 'medical-bills');

CREATE POLICY "medical-bills-authenticated-delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'medical-bills');
*/






