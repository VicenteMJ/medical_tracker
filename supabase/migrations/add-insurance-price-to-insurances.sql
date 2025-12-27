-- Migration: Add price and currency columns to insurances table
-- This allows tracking the cost of insurance policies in UF or CLP

-- Add price column to insurances table
ALTER TABLE insurances
ADD COLUMN IF NOT EXISTS price DECIMAL(10, 2);

-- Add currency column to insurances table (UF or CLP)
ALTER TABLE insurances
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'CLP';

-- Add check constraint to ensure currency is either UF or CLP
ALTER TABLE insurances
DROP CONSTRAINT IF EXISTS check_insurance_currency;

ALTER TABLE insurances
ADD CONSTRAINT check_insurance_currency CHECK (
  currency IS NULL OR 
  currency IN ('UF', 'CLP')
);

