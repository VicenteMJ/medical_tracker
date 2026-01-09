import { CoverageDomain, COVERAGE_DOMAIN_KEYWORDS } from './coverage-types'

/**
 * Maps benefit blocks from Gemini JSON to coverage domains
 */
const BENEFIT_BLOCK_TO_DOMAIN: Record<string, CoverageDomain> = {
  'beneficio_maternidad': CoverageDomain.MATERNITY,
  'beneficio_ambulatorio': CoverageDomain.HEALTH,
  'beneficio_hospitalizacion': CoverageDomain.HOSPITALIZATION,
  'beneficio_medicamentos_ambulatorios': CoverageDomain.MEDICATIONS,
  'beneficio_dental': CoverageDomain.DENTAL,
  'dental': CoverageDomain.DENTAL,
  'plan_dental': CoverageDomain.DENTAL,
  'seguro_dental': CoverageDomain.DENTAL,
  'cobertura_dental': CoverageDomain.DENTAL,
}

/**
 * Classifies coverage domain based on block name, service key, and data
 * @param blockKey - The parent block key (e.g., "beneficio_maternidad")
 * @param serviceKey - The service key (e.g., "consulta_medica")
 * @param serviceData - The service data object
 * @returns The classified coverage domain, or null if ambiguous
 */
export function classifyCoverageDomain(
  blockKey: string | null,
  serviceKey: string,
  serviceData: Record<string, any>
): CoverageDomain | null {
  const normalizedBlockKey = blockKey?.toLowerCase() || ''
  const normalizedServiceKey = serviceKey.toLowerCase()
  const notes = (serviceData.descripcion || serviceData.notes || '').toLowerCase()
  const combinedText = `${normalizedBlockKey} ${normalizedServiceKey} ${notes}`

  // First, check if we have a direct block mapping
  if (normalizedBlockKey && BENEFIT_BLOCK_TO_DOMAIN[normalizedBlockKey]) {
    return BENEFIT_BLOCK_TO_DOMAIN[normalizedBlockKey]
  }

  // Check for dental coverage early (common in insurance policies)
  if (normalizedBlockKey.includes('dental') || 
      normalizedBlockKey.includes('odontología') ||
      normalizedBlockKey.includes('odontologia') ||
      normalizedServiceKey.includes('dental') ||
      normalizedServiceKey.includes('odontología') ||
      normalizedServiceKey.includes('odontologia') ||
      combinedText.includes('dental') ||
      combinedText.includes('odontología') ||
      combinedText.includes('odontologia')) {
    return CoverageDomain.DENTAL
  }

  // Check for catastrophic coverage (GES/CAEC)
  if (normalizedServiceKey.includes('cobertura_ges') || 
      normalizedServiceKey.includes('cobertura_caec') ||
      normalizedServiceKey.includes('ges_caec') ||
      normalizedServiceKey.includes('caec')) {
    return CoverageDomain.CATASTROPHIC
  }

  // Score each domain based on keyword matches
  const domainScores: Record<CoverageDomain, number> = {
    [CoverageDomain.HEALTH]: 0,
    [CoverageDomain.HOSPITALIZATION]: 0,
    [CoverageDomain.MEDICATIONS]: 0,
    [CoverageDomain.DENTAL]: 0,
    [CoverageDomain.MATERNITY]: 0,
    [CoverageDomain.MENTAL_HEALTH]: 0,
    [CoverageDomain.VISION]: 0,
    [CoverageDomain.LIFE]: 0,
    [CoverageDomain.CATASTROPHIC]: 0,
  }

  // Score domains based on keywords
  for (const [domain, keywords] of Object.entries(COVERAGE_DOMAIN_KEYWORDS)) {
    for (const keyword of keywords) {
      if (combinedText.includes(keyword)) {
        domainScores[domain as CoverageDomain]++
      }
    }
  }

  // Find domain with highest score
  let maxScore = 0
  let selectedDomain: CoverageDomain | null = null

  for (const [domain, score] of Object.entries(domainScores)) {
    if (score > maxScore) {
      maxScore = score
      selectedDomain = domain as CoverageDomain
    }
  }

  // Only return domain if we have a clear match (score > 0)
  // Return null if ambiguous to avoid forcing incorrect classification
  return maxScore > 0 ? selectedDomain : null
}

/**
 * Gets the domain for a benefit block
 */
export function getDomainForBenefitBlock(blockKey: string): CoverageDomain | null {
  const normalized = blockKey.toLowerCase()
  return BENEFIT_BLOCK_TO_DOMAIN[normalized] || null
}

