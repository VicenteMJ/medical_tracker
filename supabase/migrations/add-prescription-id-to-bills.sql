-- Migration: Add prescription_id to bills table
-- This allows bills to be associated with prescriptions (e.g., pharmacy purchases)

-- Add prescription_id column to bills table
ALTER TABLE bills
ADD COLUMN IF NOT EXISTS prescription_id UUID REFERENCES prescriptions(id) ON DELETE SET NULL;

-- Create index on bills prescription_id for faster joins
CREATE INDEX IF NOT EXISTS idx_bills_prescription_id ON bills(prescription_id);

-- Add comment to document the column
COMMENT ON COLUMN bills.prescription_id IS 'Links a bill to a prescription, typically used for pharmacy purchases';
