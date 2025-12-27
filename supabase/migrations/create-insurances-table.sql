-- Migration: Create insurances table
-- This table stores insurance policy information with PDF documents and coverage data

-- Create insurances table
CREATE TABLE IF NOT EXISTS insurances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_name VARCHAR(255) NOT NULL,
  policy_id VARCHAR(255) NOT NULL,
  insurance_type VARCHAR(50),
  price DECIMAL(10, 2),
  currency VARCHAR(3),
  logo_url TEXT,
  pdf_url TEXT,
  coverage_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add check constraint to ensure currency is either UF or CLP
ALTER TABLE insurances
DROP CONSTRAINT IF EXISTS check_insurance_currency;

ALTER TABLE insurances
ADD CONSTRAINT check_insurance_currency CHECK (
  currency IS NULL OR 
  currency IN ('UF', 'CLP')
);

-- Create index on provider_name for faster queries
CREATE INDEX IF NOT EXISTS idx_insurances_provider_name ON insurances(provider_name);

-- Create index on insurance_type for faster queries
CREATE INDEX IF NOT EXISTS idx_insurances_insurance_type ON insurances(insurance_type);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_insurances_created_at ON insurances(created_at DESC);

