-- Create prescriptions table migration
-- If you encounter column errors with an existing table, you can drop and recreate it:
-- DROP TABLE IF EXISTS prescriptions CASCADE;
-- Then run this migration again.

-- Ensure the update_updated_at_column function exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create prescriptions table if it doesn't exist
CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID,
  prescription_type VARCHAR(10) NOT NULL CHECK (prescription_type IN ('A', 'B', 'C', 'D')),
  file_url TEXT,
  issue_date DATE NOT NULL,
  is_chronic_use BOOLEAN DEFAULT FALSE,
  expiration_date DATE,
  is_archived BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'prescriptions_appointment_id_fkey'
  ) THEN
    ALTER TABLE prescriptions 
    ADD CONSTRAINT prescriptions_appointment_id_fkey 
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create indexes for performance (only if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_prescriptions_appointment_id'
  ) THEN
    CREATE INDEX idx_prescriptions_appointment_id ON prescriptions(appointment_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_prescriptions_type'
  ) THEN
    CREATE INDEX idx_prescriptions_type ON prescriptions(prescription_type);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_prescriptions_expiration_date'
  ) THEN
    CREATE INDEX idx_prescriptions_expiration_date ON prescriptions(expiration_date);
  END IF;
END $$;

-- Drop trigger if it exists to avoid conflicts
DROP TRIGGER IF EXISTS update_prescriptions_updated_at ON prescriptions;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_prescriptions_updated_at
  BEFORE UPDATE ON prescriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
