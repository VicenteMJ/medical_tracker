-- Migration: Add is_active column to insurances table
-- This allows filtering active vs inactive insurance policies for coverage queries

ALTER TABLE insurances
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Create index for faster queries on active policies
CREATE INDEX IF NOT EXISTS idx_insurances_is_active ON insurances(is_active) WHERE is_active = true;


