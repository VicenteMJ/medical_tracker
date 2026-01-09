-- Migration: Migrate existing coverage_data JSONB to new normalized tables
-- This script copies existing coverage_data to insurance_raw_analysis
-- Note: Normalization to insurance_coverages should be done via the application layer
-- using the coverage-normalizer.ts logic, as it requires complex parsing

-- Copy existing coverage_data to insurance_raw_analysis
INSERT INTO insurance_raw_analysis (insurance_id, raw_json, model_version, extracted_at)
SELECT 
  id as insurance_id,
  coverage_data as raw_json,
  'migrated' as model_version,
  updated_at as extracted_at
FROM insurances
WHERE coverage_data IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM insurance_raw_analysis 
    WHERE insurance_raw_analysis.insurance_id = insurances.id
  );

-- Note: The actual normalization of coverage_data JSONB to insurance_coverages rows
-- should be performed by the application using the normalizeGeminiOutput() function
-- in lib/coverage-normalizer.ts. This ensures proper service type mapping and
-- confidence score calculation based on the normalization logic.
--
-- To normalize existing data:
-- 1. Use the API endpoint POST /api/insurance/analyze-coverage with existing insurance IDs
-- 2. Or create a migration script that calls normalizeGeminiOutput() for each insurance
--    that has coverage_data but no normalized coverages
--
-- Example TypeScript migration script (run separately):
-- ```typescript
-- import { getInsurances } from '@/lib/insurances'
-- import { normalizeGeminiOutput } from '@/lib/coverage-normalizer'
-- import { createInsuranceCoverage } from '@/lib/insurances'
--
-- async function migrateExistingCoverages() {
--   const insurances = await getInsurances()
--   for (const insurance of insurances) {
--     if (insurance.coverage_data && !insurance.coverages?.length) {
--       const normalized = normalizeGeminiOutput(insurance.coverage_data, insurance.id)
--       for (const coverage of normalized) {
--         await createInsuranceCoverage(coverage)
--       }
--     }
--   }
-- }
-- ```

