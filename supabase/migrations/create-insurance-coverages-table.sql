-- Migration: Create insurance_coverages table
-- This table stores normalized, queryable coverage rules extracted from insurance policies

CREATE TABLE IF NOT EXISTS insurance_coverages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  insurance_id UUID NOT NULL REFERENCES insurances(id) ON DELETE CASCADE,
  coverage_domain TEXT NOT NULL CHECK (coverage_domain IN ('health', 'dental', 'vision', 'mental', 'accident')),
  service_type TEXT NOT NULL,
  specialty TEXT,
  provider_type TEXT,
  is_emergency BOOLEAN,
  coverage_percent NUMERIC(5, 2),
  max_amount NUMERIC(10, 2),
  currency VARCHAR(3) CHECK (currency IS NULL OR currency IN ('UF', 'CLP')),
  deductible_amount NUMERIC(10, 2),
  copay_amount NUMERIC(10, 2),
  frequency_limit TEXT,
  waiting_period_days INTEGER,
  exclusions TEXT,
  confidence_score NUMERIC(3, 2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  source TEXT NOT NULL DEFAULT 'ai' CHECK (source IN ('ai', 'manual')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_insurance_coverages_insurance_id ON insurance_coverages(insurance_id);
CREATE INDEX IF NOT EXISTS idx_insurance_coverages_service_type ON insurance_coverages(service_type);
CREATE INDEX IF NOT EXISTS idx_insurance_coverages_coverage_domain ON insurance_coverages(coverage_domain);
CREATE INDEX IF NOT EXISTS idx_insurance_coverages_composite ON insurance_coverages(insurance_id, service_type, coverage_domain);
CREATE INDEX IF NOT EXISTS idx_insurance_coverages_specialty ON insurance_coverages(specialty) WHERE specialty IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_insurance_coverages_is_emergency ON insurance_coverages(is_emergency) WHERE is_emergency IS NOT NULL;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_insurance_coverages_updated_at
  BEFORE UPDATE ON insurance_coverages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


