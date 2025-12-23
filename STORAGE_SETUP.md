# PDF Upload Setup Guide

This guide will help you set up PDF upload functionality for test results in your medical tracker application.

## Overview

The application now supports uploading PDF files when creating or editing test results. PDFs are stored in Supabase Storage, and the file URL is saved in the database.

## Setup Steps

### 1. Set Up Supabase Storage Bucket

You need to create a storage bucket in your Supabase project:

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New bucket**
4. Name it: `test-results`
5. Make it **Public** (for now - you can restrict it later when you add authentication)
6. Click **Create bucket**

Alternatively, you can run the SQL script provided:

1. Go to **SQL Editor** in your Supabase Dashboard
2. Open the file `supabase/storage-setup.sql`
3. Copy and paste the contents into the SQL Editor
4. Click **Run** to execute the script

### 2. Verify Environment Variables

Make sure your `.env.local` file (or environment variables) includes:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Test the Upload

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:3000/results/new`
3. Fill in the test result form
4. Click **Choose File** under "Test Result PDF (Optional)"
5. Select a PDF file (max 10MB)
6. Submit the form

The PDF will be uploaded to Supabase Storage, and the URL will be automatically saved with your test result.

## Features

- **PDF Upload**: Upload PDF files directly from the form
- **File Validation**: Only PDF files are accepted, max size 10MB
- **Progress Indicator**: Shows upload progress during file upload
- **File Preview**: Shows selected file name and size before upload
- **Existing Files**: When editing, shows current file and allows replacement
- **Manual URL**: Still supports manually entering a file URL if needed

## File Storage Structure

Files are stored in Supabase Storage under the `test-results` bucket:
- New uploads: `results/{timestamp}-{random}.pdf`
- Files are organized by timestamp for easy management

## Security Notes

⚠️ **Important**: The current setup uses public storage policies for easier testing. When you add user authentication to your application, you should:

1. Update the storage policies in `supabase/storage-setup.sql` to use `authenticated` instead of `public`
2. Ensure Row Level Security (RLS) is properly configured
3. Consider adding user-specific folders for better organization

## Troubleshooting

### "Failed to upload file: new row violates row-level security policy" error

This error occurs when the storage bucket's RLS policies aren't set up correctly. To fix it:

1. Go to your Supabase Dashboard → **SQL Editor**
2. Copy and paste the contents of `supabase/fix-storage-policies.sql`
3. Click **Run** to execute the script
4. Try uploading again

Alternatively, you can manually set up the policies:
1. Go to **Storage** → **Policies** in your Supabase Dashboard
2. Select the `test-results` bucket
3. Create policies for INSERT, SELECT, UPDATE, and DELETE operations
4. Set them to allow `public` access (or `authenticated` if you have auth enabled)

### "Failed to upload file" error
- Check that the `test-results` bucket exists in Supabase Storage
- Verify the storage policies are set up correctly
- Check browser console for detailed error messages
- Make sure you've run the storage setup SQL script

### File uploads but doesn't appear
- Check that the file URL is being saved in the database
- Verify the storage bucket is set to public (or policies allow access)
- Check the browser network tab for upload errors

### File size too large
- Current limit is 10MB per file
- You can increase this limit in `lib/storage.ts` (change `maxSize` variable)

## Next Steps

- Consider adding file deletion when a result is deleted
- Add image preview for PDFs (using a PDF viewer library)
- Implement file compression for large PDFs
- Add support for other file types if needed

