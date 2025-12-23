-- Migration: Update medications table to simplified schema
-- This migration alters the existing medications table to match the simplified schema

-- Drop old columns if they exist (from the previous complex schema)
ALTER TABLE medications DROP COLUMN IF EXISTS type;
ALTER TABLE medications DROP COLUMN IF EXISTS strength;
ALTER TABLE medications DROP COLUMN IF EXISTS unit;
ALTER TABLE medications DROP COLUMN IF EXISTS display_name;
ALTER TABLE medications DROP COLUMN IF EXISTS schedule_times;

-- Add new columns if they don't exist
ALTER TABLE medications
ADD COLUMN IF NOT EXISTS dosage VARCHAR(255),
ADD COLUMN IF NOT EXISTS frequency VARCHAR(255),
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE,
ADD COLUMN IF NOT EXISTS prescribed_by VARCHAR(255);

-- Ensure name column exists and is NOT NULL
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medications' AND column_name = 'name') THEN
    ALTER TABLE medications ADD COLUMN name VARCHAR(255) NOT NULL;
  ELSE
    ALTER TABLE medications ALTER COLUMN name SET NOT NULL;
  END IF;
END $$;

-- Ensure notes column exists
ALTER TABLE medications ADD COLUMN IF NOT EXISTS notes TEXT;

-- Ensure created_at and updated_at exist
ALTER TABLE medications
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create index on medications name for faster queries
CREATE INDEX IF NOT EXISTS idx_medications_name ON medications(name);

-- Create index on medications start_date for faster queries
CREATE INDEX IF NOT EXISTS idx_medications_start_date ON medications(start_date DESC);

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_medications_updated_at ON medications;
CREATE TRIGGER update_medications_updated_at
  BEFORE UPDATE ON medications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
