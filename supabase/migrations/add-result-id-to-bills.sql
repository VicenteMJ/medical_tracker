-- Migration: Add result_id to bills table
-- This allows bills to be associated with test results in addition to appointments

-- Add result_id column to bills table
ALTER TABLE bills
ADD COLUMN IF NOT EXISTS result_id UUID REFERENCES results(id) ON DELETE SET NULL;

-- Create index on bills result_id for faster joins
CREATE INDEX IF NOT EXISTS idx_bills_result_id ON bills(result_id);

-- Add a check constraint to ensure a bill is associated with either an appointment or a result, but not both
-- Note: This is optional - you may want to allow bills without any association
-- Uncomment the following if you want to enforce this constraint:
-- ALTER TABLE bills
-- ADD CONSTRAINT check_bill_association CHECK (
--   (appointment_id IS NULL AND result_id IS NOT NULL) OR
--   (appointment_id IS NOT NULL AND result_id IS NULL) OR
--   (appointment_id IS NULL AND result_id IS NULL)
-- );






