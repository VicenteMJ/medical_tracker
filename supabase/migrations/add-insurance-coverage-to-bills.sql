-- Migration: Add insurance_coverage to bills table
-- This allows tracking how much of the bill is covered by insurance

-- Add insurance_coverage column to bills table
ALTER TABLE bills
ADD COLUMN IF NOT EXISTS insurance_coverage DECIMAL(10, 2) DEFAULT 0;

-- Add a check constraint to ensure insurance_coverage doesn't exceed the amount
ALTER TABLE bills
DROP CONSTRAINT IF EXISTS check_insurance_coverage;

ALTER TABLE bills
ADD CONSTRAINT check_insurance_coverage CHECK (
  insurance_coverage IS NULL OR 
  insurance_coverage >= 0 AND 
  (amount IS NULL OR insurance_coverage <= amount)
);



