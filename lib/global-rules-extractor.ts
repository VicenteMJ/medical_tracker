/**
 * Extracts global rules from informacion_general block
 * These rules apply to all coverages and should NOT be duplicated in individual coverage rows
 */
export interface GlobalRules {
  deductible_by_family_type: Record<string, any> | null
  annual_reimbursement_limit_per_beneficiary: number | null
  annual_reimbursement_limit_currency: string | null
  special_conditions: Record<string, any> | null
  coverage_abroad: string | null
}

/**
 * Extracts global rules from the informacion_general block
 */
export function extractGlobalRules(rawJson: Record<string, any>): GlobalRules | null {
  const informacionGeneral = rawJson.informacion_general
  
  if (!informacionGeneral || typeof informacionGeneral !== 'object') {
    return null
  }

  const rules: GlobalRules = {
    deductible_by_family_type: null,
    annual_reimbursement_limit_per_beneficiary: null,
    annual_reimbursement_limit_currency: null,
    special_conditions: null,
    coverage_abroad: null,
  }

  // Extract deductible by family type
  if (informacionGeneral.deducible_anual_por_grupo_familiar) {
    rules.deductible_by_family_type = informacionGeneral.deducible_anual_por_grupo_familiar
  }

  // Extract annual reimbursement limit
  const topeAnual = informacionGeneral.tope_anual_reembolso_por_beneficiario
  if (topeAnual) {
    const { amount, currency } = parseLimitValue(topeAnual)
    rules.annual_reimbursement_limit_per_beneficiary = amount
    rules.annual_reimbursement_limit_currency = currency
  }

  // Extract special conditions
  if (informacionGeneral.condiciones_especiales) {
    rules.special_conditions = informacionGeneral.condiciones_especiales
  }

  // Extract coverage abroad
  if (informacionGeneral.cobertura_en_el_extranjero) {
    rules.coverage_abroad = String(informacionGeneral.cobertura_en_el_extranjero)
  }

  // Return null if no rules were found
  const hasRules = rules.deductible_by_family_type ||
                   rules.annual_reimbursement_limit_per_beneficiary ||
                   rules.special_conditions ||
                   rules.coverage_abroad

  return hasRules ? rules : null
}

/**
 * Parses a limit value string to extract amount and currency
 * Handles "500 UF", "1.5 UF", etc.
 */
function parseLimitValue(value: any): { amount: number | null; currency: string | null } {
  if (!value) {
    return { amount: null, currency: null }
  }

  const valueStr = String(value).toLowerCase().trim()

  // Extract currency
  let currency: string | null = null
  if (valueStr.includes('uf')) {
    currency = 'UF'
  } else if (valueStr.includes('clp') || valueStr.includes('peso')) {
    currency = 'CLP'
  }

  // Extract numeric amount (handle comma as decimal separator)
  const amountMatch = valueStr.match(/(\d+(?:[.,]\d+)?)/)
  if (amountMatch) {
    const amountStr = amountMatch[1].replace(',', '.')
    const amount = parseFloat(amountStr)
    if (!isNaN(amount)) {
      return { amount, currency }
    }
  }

  return { amount: null, currency: null }
}


