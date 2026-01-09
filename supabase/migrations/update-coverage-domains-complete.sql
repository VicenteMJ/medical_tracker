-- Migration: Update coverage domains to include all required domains
-- This migration updates the coverage_domain constraint to include:
-- health, hospitalization, medications, dental, maternity, mental_health, vision, life, catastrophic

-- Drop the existing constraint
ALTER TABLE insurance_coverages
DROP CONSTRAINT IF EXISTS insurance_coverages_coverage_domain_check;

-- Add the updated constraint with all required domains
ALTER TABLE insurance_coverages
ADD CONSTRAINT insurance_coverages_coverage_domain_check 
CHECK (coverage_domain IN (
  'health',
  'hospitalization',
  'medications',
  'dental',
  'maternity',
  'mental_health',
  'vision',
  'life',
  'catastrophic'
));

-- Update existing 'mental' domain to 'mental_health' if any exist
UPDATE insurance_coverages
SET coverage_domain = 'mental_health'
WHERE coverage_domain = 'mental';


