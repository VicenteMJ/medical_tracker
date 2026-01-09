-- Supabase Storage Setup for Prescriptions (PDFs and Images)
-- Run this SQL in your Supabase SQL Editor

-- Step 1: Create the storage bucket for prescriptions (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('prescriptions', 'prescriptions', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Step 2: Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "prescriptions-public-upload" ON storage.objects;
DROP POLICY IF EXISTS "prescriptions-public-read" ON storage.objects;
DROP POLICY IF EXISTS "prescriptions-public-update" ON storage.objects;
DROP POLICY IF EXISTS "prescriptions-public-delete" ON storage.objects;
DROP POLICY IF EXISTS "prescriptions-authenticated-upload" ON storage.objects;
DROP POLICY IF EXISTS "prescriptions-authenticated-read" ON storage.objects;
DROP POLICY IF EXISTS "prescriptions-authenticated-update" ON storage.objects;
DROP POLICY IF EXISTS "prescriptions-authenticated-delete" ON storage.objects;

-- Step 3: Create policies to allow public access (for testing without authentication)
-- These policies allow anyone to upload, read, update, and delete files in the prescriptions bucket

-- Policy: Allow public uploads
CREATE POLICY "prescriptions-public-upload"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'prescriptions');

-- Policy: Allow public reads
CREATE POLICY "prescriptions-public-read"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'prescriptions');

-- Policy: Allow public updates (for replacing files)
CREATE POLICY "prescriptions-public-update"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'prescriptions')
WITH CHECK (bucket_id = 'prescriptions');

-- Policy: Allow public deletes
CREATE POLICY "prescriptions-public-delete"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'prescriptions');

-- Note: If you want to restrict to authenticated users only, 
-- replace the above policies with these instead:
/*
DROP POLICY IF EXISTS "prescriptions-public-upload" ON storage.objects;
DROP POLICY IF EXISTS "prescriptions-public-read" ON storage.objects;
DROP POLICY IF EXISTS "prescriptions-public-update" ON storage.objects;
DROP POLICY IF EXISTS "prescriptions-public-delete" ON storage.objects;

CREATE POLICY "prescriptions-authenticated-upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'prescriptions');

CREATE POLICY "prescriptions-authenticated-read"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'prescriptions');

CREATE POLICY "prescriptions-authenticated-update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'prescriptions')
WITH CHECK (bucket_id = 'prescriptions');

CREATE POLICY "prescriptions-authenticated-delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'prescriptions');
*/
