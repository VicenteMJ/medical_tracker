-- Add name column to prescriptions table
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS name VARCHAR(255);
