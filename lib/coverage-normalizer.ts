import { InsuranceCoverage } from '@/types/database'
import { CoverageDomain, CoverageSource } from './coverage-types'
import { classifyCoverageDomain, getDomainForBenefitBlock } from './coverage-domain-classifier'
import {
  extractProviderVariations,
  extractCoveragePercentage,
  extractMaxAmount,
  extractPerServiceLimit,
  extractFrequencyLimit,
  extractConditions,
  extractServiceType,
} from './coverage-value-extractor'

/**
 * Normalizes Gemini output into structured insurance coverage rows
 * This function handles the new structure with benefit blocks and provider variations
 * @param geminiOutput - Raw JSON output from Gemini
 * @param insuranceId - ID of the insurance policy
 * @returns Array of normalized InsuranceCoverage objects
 */
export function normalizeGeminiOutput(
  geminiOutput: Record<string, any>,
  insuranceId: string
): InsuranceCoverage[] {
  const coverages: InsuranceCoverage[] = []

  // Skip informacion_general - it contains global rules that should be handled separately
  // Skip exclusions and ambiguities - they're metadata
  const blocksToSkip = ['informacion_general', 'exclusions', 'ambiguities']

  // Process each top-level block
  for (const [blockKey, blockData] of Object.entries(geminiOutput)) {
    if (blocksToSkip.includes(blockKey) || !blockData || typeof blockData !== 'object') {
      continue
    }

    const blockDataObj = blockData as Record<string, any>

    // Determine domain for this block
    const blockDomain = getDomainForBenefitBlock(blockKey)
    
    // Debug logging for dental blocks
    if (blockKey.toLowerCase().includes('dental') || blockKey.toLowerCase().includes('odont')) {
      console.log(`[Normalizer] Processing dental block: ${blockKey}`, {
        blockDomain,
        serviceCount: Object.keys(blockDataObj).length
      })
    }

    // Process each service within the block
    for (const [serviceKey, serviceData] of Object.entries(blockDataObj)) {
      if (!serviceData || typeof serviceData !== 'object' || Array.isArray(serviceData)) {
        continue
      }

      const serviceDataObj = serviceData as Record<string, any>

      // Classify domain (use block domain if available, otherwise classify from service)
      const domain = blockDomain || classifyCoverageDomain(blockKey, serviceKey, serviceDataObj)
      
      // Debug logging for dental services
      if (serviceKey.toLowerCase().includes('dental') || serviceKey.toLowerCase().includes('odont')) {
        console.log(`[Normalizer] Processing dental service: ${serviceKey}`, {
          blockKey,
          blockDomain,
          classifiedDomain: domain,
          hasProviderVariations: extractProviderVariations(serviceDataObj).length > 0
        })
      }
      
      // Skip if domain is ambiguous (null)
      if (!domain) {
        // Log skipped services for debugging
        if (serviceKey.toLowerCase().includes('dental') || serviceKey.toLowerCase().includes('odont')) {
          console.warn(`[Normalizer] Skipping dental service due to ambiguous domain: ${serviceKey}`, {
            blockKey,
            serviceData: Object.keys(serviceDataObj)
          })
        }
        continue
      }

      // Check for provider variations
      const providerVariations = extractProviderVariations(serviceDataObj)

      if (providerVariations.length > 0) {
        // Generate one coverage row per provider variation
        for (const variation of providerVariations) {
          const coverage = createCoverageRow(
            insuranceId,
            domain,
            serviceKey,
            serviceDataObj,
            variation.providerType,
            variation.coveragePercent
          )
          if (coverage) {
            coverages.push(coverage)
          }
        }
      } else {
        // No provider variations - check if there's a coverage percentage or coverage field
        const coveragePercent = extractCoveragePercentage(
          serviceDataObj.cobertura || 
          serviceDataObj.coverage_percentage || 
          serviceDataObj.coverage_percent
        )

        // For dental and other domains, also check if there's other meaningful data
        // (like tope_anual, descripcion, etc.) even without explicit coverage percentage
        const hasOtherData = serviceDataObj.tope_anual || 
                            serviceDataObj.tope_prestacion ||
                            serviceDataObj.descripcion ||
                            serviceDataObj.notes ||
                            serviceDataObj.notas

        // Create coverage if we have coverage percentage OR other meaningful data
        // This is especially important for dental which might not always have explicit percentages
        if (coveragePercent !== null || 
            serviceDataObj.cobertura || 
            serviceDataObj.coverage_percentage ||
            (hasOtherData && domain === CoverageDomain.DENTAL)) {
          const coverage = createCoverageRow(
            insuranceId,
            domain,
            serviceKey,
            serviceDataObj,
            null,
            coveragePercent
          )
          if (coverage) {
            coverages.push(coverage)
          }
        }
      }
    }
  }

  return coverages
}

/**
 * Creates a single coverage row
 */
function createCoverageRow(
  insuranceId: string,
  domain: CoverageDomain,
  serviceKey: string,
  serviceData: Record<string, any>,
  providerType: string | null,
  coveragePercent: number | null
): InsuranceCoverage | null {
  // Extract service type
  const serviceType = extractServiceType(serviceKey, serviceData)

  // Extract max amount and currency from tope_anual
  const { amount: maxAmount, currency } = extractMaxAmount(serviceData.tope_anual)

  // Extract per-service limit (tope_prestacion)
  const { amount: perServiceLimit, currency: perServiceLimitCurrency } = extractPerServiceLimit(serviceData)

  // Extract frequency limit
  const frequencyLimit = extractFrequencyLimit(serviceData.tope_anual)

  // Extract conditions
  const conditions = extractConditions(serviceData)

  // Extract waiting period (if present)
  const waitingPeriodDays = extractWaitingPeriod(serviceData.waiting_period || serviceData.waiting_period_days)

  // Calculate confidence score
  const confidenceScore = calculateConfidenceScore(serviceData)

  // Determine if emergency
  const isEmergency = isEmergencyService(serviceKey, serviceData)

  // Extract specialty if present
  const specialty = extractSpecialty(serviceKey, serviceData)

  const coverage: Omit<InsuranceCoverage, 'id' | 'created_at' | 'updated_at'> = {
    insurance_id: insuranceId,
    coverage_domain: domain,
    service_type: serviceType,
    specialty: specialty || null,
    provider_type: providerType || null,
    is_emergency: isEmergency || null,
    coverage_percent: coveragePercent,
    max_amount: maxAmount,
    currency: currency || null,
    deductible_amount: null, // Deductibles are global, not per-coverage
    copay_amount: null, // Copay would be calculated from coverage_percent if needed
    frequency_limit: frequencyLimit || null,
    waiting_period_days: waitingPeriodDays,
    exclusions: null, // Exclusions are global, not per-coverage
    conditions: conditions.length > 0 ? conditions : null,
    per_service_limit: perServiceLimit,
    per_service_limit_currency: perServiceLimitCurrency || null,
    confidence_score: confidenceScore,
    source: CoverageSource.AI,
  }

  return coverage as InsuranceCoverage
}

/**
 * Extracts waiting period in days
 */
function extractWaitingPeriod(value: any): number | null {
  if (!value) return null

  if (typeof value === 'number') {
    return value
  }

  if (typeof value === 'string') {
    const match = value.match(/(\d+)/)
    if (match) {
      return parseInt(match[1], 10)
    }
  }

  return null
}

/**
 * Calculates confidence score based on data completeness
 */
function calculateConfidenceScore(serviceData: Record<string, any>): number {
  let score = 0.5 // Base score

  // Increase score for explicit values
  if (serviceData.cobertura || serviceData.coverage_percentage || serviceData.coverage_percent) {
    score += 0.2
  }
  if (serviceData.tope_anual) {
    score += 0.1
  }
  if (serviceData.tope_prestacion) {
    score += 0.1
  }

  // Check for provider variations (more specific = higher confidence)
  const providerKeys = ['otras_clinicas', 'clinicas_preferentes_lc_al_uc_ua', 'clinica_las_condes_y_alemana']
  const hasProviderVariations = providerKeys.some(key => key in serviceData)
  if (hasProviderVariations) {
    score += 0.1
  }

  // Clamp between 0 and 1
  return Math.max(0, Math.min(1, score))
}

/**
 * Determines if a service is emergency-related
 */
function isEmergencyService(serviceKey: string, serviceData: Record<string, any>): boolean | null {
  const normalizedKey = serviceKey.toLowerCase()
  const descripcion = (serviceData.descripcion || '').toLowerCase()
  const combinedText = `${normalizedKey} ${descripcion}`

  if (combinedText.includes('emergencia') ||
      combinedText.includes('emergency') ||
      combinedText.includes('urgencia')) {
    return true
  }

  return null
}

/**
 * Extracts specialty from service key or description
 */
function extractSpecialty(serviceKey: string, serviceData: Record<string, any>): string | null {
  const normalizedKey = serviceKey.toLowerCase()
  const descripcion = (serviceData.descripcion || '').toLowerCase()
  const combinedText = `${normalizedKey} ${descripcion}`

  const specialties = [
    'cardiología', 'cardiologia', 'cardiology',
    'dermatología', 'dermatologia', 'dermatology',
    'endocrinología', 'endocrinologia', 'endocrinology',
    'gastroenterología', 'gastroenterologia', 'gastroenterology',
    'neurología', 'neurologia', 'neurology',
    'ortopedia', 'orthopedics',
    'pediatría', 'pediatria', 'pediatrics',
    'psiquiatría', 'psiquiatria', 'psychiatry',
    'oftalmología', 'oftalmologia', 'ophthalmology',
  ]

  for (const spec of specialties) {
    if (combinedText.includes(spec)) {
      return spec
    }
  }

  return null
}
