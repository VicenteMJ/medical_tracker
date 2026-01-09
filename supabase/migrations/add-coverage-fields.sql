-- Migration: Add new fields to insurance_coverages table
-- Adds conditions array, per_service_limit, and per_service_limit_currency

-- Add conditions array for specific coverage conditions
ALTER TABLE insurance_coverages
ADD COLUMN IF NOT EXISTS conditions TEXT[];

-- Add per_service_limit for tope_prestacion (limit per individual service/claim)
ALTER TABLE insurance_coverages
ADD COLUMN IF NOT EXISTS per_service_limit NUMERIC(10, 2);

-- Add currency for per_service_limit
ALTER TABLE insurance_coverages
ADD COLUMN IF NOT EXISTS per_service_limit_currency VARCHAR(3) CHECK (per_service_limit_currency IS NULL OR per_service_limit_currency IN ('UF', 'CLP'));

-- Add comments to document the new fields
COMMENT ON COLUMN insurance_coverages.conditions IS 'Array of specific conditions that apply to this coverage (e.g., descriptions, special requirements)';
COMMENT ON COLUMN insurance_coverages.per_service_limit IS 'Maximum amount per individual service/claim (tope_prestacion). Different from max_amount which is annual limit.';
COMMENT ON COLUMN insurance_coverages.per_service_limit_currency IS 'Currency for per_service_limit (UF or CLP)';


