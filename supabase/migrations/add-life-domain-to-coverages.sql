-- Migration: Add 'life' as a valid coverage domain
-- This allows storing life insurance coverage information

-- Drop the existing constraint
ALTER TABLE insurance_coverages
DROP CONSTRAINT IF EXISTS insurance_coverages_coverage_domain_check;

-- Add the updated constraint with 'life' domain
ALTER TABLE insurance_coverages
ADD CONSTRAINT insurance_coverages_coverage_domain_check 
CHECK (coverage_domain IN ('health', 'dental', 'vision', 'mental', 'accident', 'life'));


