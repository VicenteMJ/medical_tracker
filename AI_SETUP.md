# AI Coverage Analysis Setup

This guide explains how to set up the AI-powered insurance coverage analysis feature.

## Overview

The application uses Google's Gemini API to automatically extract coverage information from insurance policy PDFs. When you upload a PDF, the system:

1. Extracts text from the PDF
2. Sends it to Gemini for analysis
3. Extracts structured coverage data
4. Stores it in the `coverage_data` field

## Setup Steps

### 1. Get Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **Create API Key**
4. Select or create a Google Cloud project
5. Copy the API key

**Note:** Gemini API has a generous free tier. You can use it without a credit card for testing.

### 2. Add API Key to Environment Variables

Add the following to your `.env.local` file:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

**Important:** 
- Do NOT add `NEXT_PUBLIC_` prefix - this keeps the key server-side only
- Never commit `.env.local` to version control
- The API key is only used server-side in API routes

### 3. Verify Setup

1. Start your development server: `npm run dev`
2. Navigate to `/insurances/new`
3. Create a new insurance with a PDF
4. The analysis should trigger automatically after upload
5. Or click "Analyze Coverage" button in the coverage drawer

## How It Works

### Automatic Analysis
- When you upload a PDF while creating a new insurance, analysis runs automatically
- Only runs if no coverage data already exists
- Shows progress indicator during analysis

### Manual Analysis
- Click "Analyze Coverage" button in the coverage drawer
- Use "Re-analyze" to re-run analysis on existing PDFs
- Useful if the PDF was updated or you want to refresh the data

### Analysis Process
1. PDF is fetched from Supabase Storage or URL
2. Text is extracted using `pdf-parse` library
3. First 30,000 characters are sent to Gemini (to manage token limits)
4. AI analyzes and extracts coverage information
5. Results are stored as JSON in `coverage_data` field
6. UI updates to show extracted coverage

## Cost Considerations

- Uses `gemini-pro` model (widely available and stable)
- PDF text is truncated to 30,000 characters to manage costs
- Analysis only runs when explicitly triggered
- Gemini API has a generous free tier for testing
- Consider implementing caching for repeated analyses

## Troubleshooting

### "GEMINI_API_KEY is not configured"
- Make sure `.env.local` file exists in the root directory
- Verify the key is named `GEMINI_API_KEY` (no `NEXT_PUBLIC_` prefix)
- Restart your development server after adding the key

### "You exceeded your current quota" (429 Error)
- **This means your Gemini API quota has been exceeded**
- Options:
  1. **Add credits**: Go to [Google Cloud Console](https://console.cloud.google.com/) and add billing
  2. **Use free tier**: Gemini API has a generous free tier - wait for quota reset
  3. **Manual entry**: Use the "Edit" button to manually enter coverage data
  4. **Enable API**: Make sure Generative Language API is enabled in your Google Cloud project

### "Failed to extract text from PDF"
- Verify the PDF URL is accessible
- Check if the PDF is corrupted or password-protected
- Ensure the PDF contains extractable text (not just images)

### "AI analysis failed"
- Check your Gemini API key is valid
- Verify you have credits/quota available
- Check Gemini API status page for outages
- Review error message in browser console
- Ensure Generative Language API is enabled in Google Cloud Console

### Analysis takes too long
- Large PDFs may take 10-30 seconds
- Check network connection
- Verify Gemini API is responding

### "PERMISSION_DENIED" or "403" Error
- Make sure Generative Language API is enabled in your Google Cloud project
- Go to [Google Cloud Console](https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com)
- Click "Enable" if not already enabled

## API Endpoint

The analysis runs through: `POST /api/insurance/analyze-coverage`

**Request Body:**
```json
{
  "insuranceId": "uuid-of-insurance"
}
```

**Response:**
```json
{
  "success": true,
  "coverage_data": { ... },
  "insurance": { ... }
}
```

## Model Information

- **Model**: `gemini-pro`
- **Why**: Widely available and stable model
- **Temperature**: 0.3 (for consistent extraction)
- **Max Output Tokens**: 2000
- **Response Format**: JSON (parsed from text response)

**Note**: If you have access to newer models, you can update the model name in `lib/ai-coverage-analyzer.ts` to:
- `gemini-1.5-pro` (if available)
- `gemini-1.5-flash-latest` (if available)
