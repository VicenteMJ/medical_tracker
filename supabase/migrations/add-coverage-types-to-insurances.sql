-- Migration: Add coverage_types column to insurances table
-- This column stores an array of coverage types selected by the user
-- (e.g., ["Consultas médicas y exámenes", "Medicamentos", "Hospitalizaciones"])

-- Add coverage_types column as TEXT array
ALTER TABLE insurances
ADD COLUMN IF NOT EXISTS coverage_types TEXT[];

-- Add comment to document the column
COMMENT ON COLUMN insurances.coverage_types IS 'Array of coverage types that this insurance covers (e.g., Consultas médicas, Medicamentos, Dental, etc.)';


