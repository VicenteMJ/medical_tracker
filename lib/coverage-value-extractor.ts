/**
 * Provider type mappings from Gemini JSON keys
 */
const PROVIDER_TYPE_MAPPINGS: Record<string, string> = {
  'otras_clinicas': 'otras_clinicas',
  'clinicas_preferentes_lc_al_uc_ua': 'clinicas_preferentes_lc_al_uc_ua',
  'clinica_las_condes_y_alemana': 'clinica_las_condes_y_alemana',
}

/**
 * Extracts provider type from service data
 * Looks for keys like "otras_clinicas", "clinicas_preferentes_lc_al_uc_ua", etc.
 */
export function extractProviderType(serviceData: Record<string, any>): string | null {
  for (const [key, providerType] of Object.entries(PROVIDER_TYPE_MAPPINGS)) {
    if (key in serviceData && serviceData[key]) {
      return providerType
    }
  }
  return null
}

/**
 * Extracts all provider variations from service data
 * Returns array of {providerType, coveragePercent} pairs
 */
export function extractProviderVariations(serviceData: Record<string, any>): Array<{providerType: string, coveragePercent: number | null}> {
  const variations: Array<{providerType: string, coveragePercent: number | null}> = []
  
  for (const [key, providerType] of Object.entries(PROVIDER_TYPE_MAPPINGS)) {
    if (key in serviceData && serviceData[key]) {
      const coveragePercent = extractCoveragePercentage(serviceData[key])
      variations.push({ providerType, coveragePercent })
    }
  }
  
  return variations
}

/**
 * Extracts coverage percentage from various formats
 * Handles "60%", "100%", 60, etc.
 */
export function extractCoveragePercentage(value: any): number | null {
  if (typeof value === 'number') {
    return Math.min(100, Math.max(0, value))
  }
  if (typeof value === 'string') {
    // Remove % and extract number
    const match = value.replace('%', '').match(/(\d+(?:\.\d+)?)/)
    if (match) {
      const num = parseFloat(match[1])
      return Math.min(100, Math.max(0, num))
    }
  }
  return null
}

/**
 * Extracts max amount and currency from limit strings
 * Handles "Sin Tope" → null, "35 UF" → {amount: 35, currency: "UF"}, etc.
 */
export function extractMaxAmount(limit: any): { amount: number | null; currency: string | null } {
  if (!limit) {
    return { amount: null, currency: null }
  }

  const limitStr = String(limit).toLowerCase().trim()

  // Check for "unlimited" or "sin límite" / "sin tope"
  if (limitStr.includes('unlimited') || 
      limitStr.includes('sin límite') || 
      limitStr.includes('sin limite') ||
      limitStr.includes('sin tope')) {
    return { amount: null, currency: null }
  }

  // Extract currency (UF or CLP)
  let currency: string | null = null
  if (limitStr.includes('uf')) {
    currency = 'UF'
  } else if (limitStr.includes('clp') || limitStr.includes('peso')) {
    currency = 'CLP'
  }

  // Extract numeric amount (handle comma as decimal separator)
  const amountMatch = limitStr.match(/(\d+(?:[.,]\d+)?)/)
  if (amountMatch) {
    const amountStr = amountMatch[1].replace(',', '.')
    const amount = parseFloat(amountStr)
    if (!isNaN(amount)) {
      return { amount, currency }
    }
  }

  return { amount: null, currency: null }
}

/**
 * Extracts per-service limit (tope_prestacion)
 * Handles "4 UF", "1 UF", etc.
 */
export function extractPerServiceLimit(serviceData: Record<string, any>): { amount: number | null; currency: string | null } {
  const topePrestacion = serviceData.tope_prestacion
  if (!topePrestacion) {
    return { amount: null, currency: null }
  }

  return extractMaxAmount(topePrestacion)
}

/**
 * Extracts frequency limit from limit strings
 * Handles "30 días al año" → "yearly", "por mes" → "monthly", etc.
 */
export function extractFrequencyLimit(limit: any): string | null {
  if (!limit) {
    return null
  }

  const limitStr = String(limit).toLowerCase()

  if (limitStr.includes('por mes') || 
      limitStr.includes('per month') || 
      limitStr.includes('mensual') ||
      limitStr.includes('mes')) {
    return 'monthly'
  }
  
  if (limitStr.includes('por año') || 
      limitStr.includes('anual') || 
      limitStr.includes('per year') || 
      limitStr.includes('annual') ||
      limitStr.includes('año') ||
      limitStr.includes('días al año') ||
      limitStr.includes('dias al año')) {
    return 'yearly'
  }

  return null
}

/**
 * Extracts conditions from service data
 * Combines descripcion, notes, and other condition fields
 */
export function extractConditions(serviceData: Record<string, any>): string[] {
  const conditions: string[] = []
  
  if (serviceData.descripcion) {
    conditions.push(String(serviceData.descripcion))
  }
  
  if (serviceData.notes) {
    conditions.push(String(serviceData.notes))
  }
  
  if (serviceData.notas) {
    conditions.push(String(serviceData.notas))
  }
  
  // Remove duplicates and empty strings
  return [...new Set(conditions.filter(c => c.trim().length > 0))]
}

/**
 * Extracts service type from service key
 * Maps service keys to normalized service types
 */
export function extractServiceType(serviceKey: string, serviceData: Record<string, any>): string {
  const normalizedKey = serviceKey.toLowerCase().trim()
  
  // Direct mappings based on common patterns from real JSON examples
  const mappings: Record<string, string> = {
    // Ambulatory services
    'consulta_medica': 'consulta_general',
    'consulta general': 'consulta_general',
    'examenes_de_laboratorio': 'examen_laboratorio',
    'examenes_de_imagenologia_ultrasonido_y_medicina_nuclear': 'imagenologia',
    'examenes_de_imagenologia': 'imagenologia',
    'kinesiologia_o_fisioterapia': 'kinesiologia',
    'fonoaudiologia': 'fonoaudiologia',
    'cirugia_ambulatoria': 'cirugia_ambulatoria',
    'procedimientos_terapeuticos': 'procedimiento_terapeutico',
    'procedimientos_de_diagnosticos': 'procedimiento_diagnostico',
    'cobertura_ges_caec_ambulatorio': 'ges_caec_ambulatorio',
    
    // Hospitalization services
    'dia_cama_hospitalizacion': 'dia_cama',
    'dia_cama_hospitalizacion_luego_de_30_dias': 'dia_cama',
    'dia_cama_acompanante_hijo_menor_14_anos': 'dia_cama_acompanante',
    'servicios_hospitalarios': 'servicios_hospitalarios',
    'hospitalizacion_domiciliaria': 'hospitalizacion_domiciliaria',
    'gastos_donante_vivo': 'donante_vivo',
    'gastos_donante_post_mortem': 'donante_post_mortem',
    'protesis_y_ortesis_hospitalaria': 'protesis_ortesis',
    'cirugia_reparadora_por_accidente': 'cirugia_reparadora',
    'cirugia_maxilofacial_por_accidente': 'cirugia_maxilofacial',
    'cirugia_maxilofacial_por_enfermedad': 'cirugia_maxilofacial',
    'servicio_ambulancia_terrestre_radio_50_km': 'ambulancia',
    'cobertura_ges_y_caec_hospitalario': 'ges_caec_hospitalario',
    
    // Medications
    'medicamentos_ambulatorios_genericos': 'medicamento_generico',
    'medicamentos_ambulatorios_no_genericos': 'medicamento_no_generico',
    'medicamentos_antineoplasicos_no_genericos_sin_convenio': 'medicamento_antineoplasico',
    'medicamentos_ambulatorios_no_genericos_en_convenio_farmacia': 'medicamento_convenio',
    'medicamentos_inmunosupresores_o_inmunomoduladores_no_genericos_sin_convenio': 'medicamento_inmunosupresor',
    
    // Maternity
    'parto_normal': 'parto_normal',
    'parto_multiple': 'parto_multiple',
    'parto_por_cesarea': 'parto_cesarea',
    'aborto_involuntario': 'aborto_involuntario',
    'complicaciones_del_parto': 'complicaciones_parto',
    'complicaciones_del_embarazo': 'complicaciones_embarazo',
    'interrupcion_voluntaria_del_embarazo': 'interrupcion_voluntaria',
    'tratamiento_de_fertilidad_y_esterilidad': 'fertilidad',
  }
  
  // Check direct mapping first
  if (mappings[normalizedKey]) {
    return mappings[normalizedKey]
  }
  
  // Check partial matches (key contains mapping key or vice versa)
  for (const [key, serviceType] of Object.entries(mappings)) {
    if (normalizedKey.includes(key) || key.includes(normalizedKey)) {
      return serviceType
    }
  }
  
  // Pattern-based matching for common structures
  if (normalizedKey.includes('parto')) {
    if (normalizedKey.includes('cesarea') || normalizedKey.includes('cesárea')) {
      return 'parto_cesarea'
    }
    if (normalizedKey.includes('multiple')) {
      return 'parto_multiple'
    }
    return 'parto_normal'
  }
  
  if (normalizedKey.includes('medicamento')) {
    if (normalizedKey.includes('generico') || normalizedKey.includes('genérico')) {
      return 'medicamento_generico'
    }
    return 'medicamento_no_generico'
  }
  
  if (normalizedKey.includes('dia_cama') || normalizedKey.includes('día cama')) {
    return 'dia_cama'
  }
  
  if (normalizedKey.includes('cirugia') || normalizedKey.includes('cirugía')) {
    return 'cirugia'
  }
  
  // Default: return normalized key as service type (replace spaces with underscores)
  return normalizedKey.replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '_')
}

