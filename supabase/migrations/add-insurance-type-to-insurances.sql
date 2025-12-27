-- Migration: Add insurance_type column to insurances table
-- This allows categorizing insurance policies by type

-- Add insurance_type column to insurances table
ALTER TABLE insurances
ADD COLUMN IF NOT EXISTS insurance_type VARCHAR(50);

-- Create index on insurance_type for faster queries
CREATE INDEX IF NOT EXISTS idx_insurances_insurance_type ON insurances(insurance_type);

