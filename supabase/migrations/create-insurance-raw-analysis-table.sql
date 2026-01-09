-- Migration: Create insurance_raw_analysis table
-- This table preserves the original raw JSON output from Gemini AI analysis

CREATE TABLE IF NOT EXISTS insurance_raw_analysis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  insurance_id UUID NOT NULL REFERENCES insurances(id) ON DELETE CASCADE,
  raw_json JSONB NOT NULL,
  model_version TEXT,
  extracted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_insurance_raw_analysis_insurance_id ON insurance_raw_analysis(insurance_id);
CREATE INDEX IF NOT EXISTS idx_insurance_raw_analysis_extracted_at ON insurance_raw_analysis(extracted_at DESC);


