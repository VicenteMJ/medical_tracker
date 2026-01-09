-- Migration: Create insurance_global_rules table
-- This table stores global rules that apply to all coverages (deductibles, annual limits, special conditions)
-- These rules should NOT be duplicated in individual coverage rows

CREATE TABLE IF NOT EXISTS insurance_global_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  insurance_id UUID NOT NULL REFERENCES insurances(id) ON DELETE CASCADE,
  deductible_by_family_type JSONB, -- {titular_sin_cargas: "1.5 UF", titular_con_1_carga: "3.0 UF", ...}
  annual_reimbursement_limit_per_beneficiary NUMERIC(10, 2),
  annual_reimbursement_limit_currency VARCHAR(3) CHECK (annual_reimbursement_limit_currency IS NULL OR annual_reimbursement_limit_currency IN ('UF', 'CLP')),
  special_conditions JSONB, -- condiciones_especiales del JSON (servicio_i_med, convenio_tarjeta_farmacia, etc.)
  coverage_abroad TEXT,
  source TEXT NOT NULL DEFAULT 'ai' CHECK (source IN ('ai', 'manual')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_insurance_global_rules_insurance_id ON insurance_global_rules(insurance_id);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_insurance_global_rules_updated_at
  BEFORE UPDATE ON insurance_global_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment to document the table
COMMENT ON TABLE insurance_global_rules IS 'Stores global insurance rules that apply to all coverages (deductibles, annual limits, special conditions). These should NOT be duplicated in individual coverage rows.';


