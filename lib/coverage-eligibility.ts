import { supabase } from './supabase'
import { CoverageQueryParams, CoverageMatch } from './coverage-types'
import { InsuranceCoverage, Insurance } from '@/types/database'

/**
 * Gets eligible coverages for a given medical event
 * @param params - Query parameters for coverage eligibility
 * @returns Array of coverage matches with insurance policy info
 */
export async function getEligibleCoverages(params: CoverageQueryParams): Promise<CoverageMatch[]> {
  let query = supabase
    .from('insurance_coverages')
    .select(`
      *,
      insurances!inner (
        id,
        provider_name,
        policy_id,
        insurance_type,
        is_active
      )
    `)
    .eq('insurances.is_active', true)

  // Filter by service type if provided
  if (params.serviceType) {
    query = query.eq('service_type', params.serviceType)
  }

  // Filter by specialty if provided
  if (params.specialty) {
    // Try exact match first, then partial match
    query = query.or(`specialty.eq.${params.specialty},specialty.ilike.%${params.specialty}%`)
  }

  // Filter by provider type if provided
  if (params.providerType) {
    query = query.or(`provider_type.eq.${params.providerType},provider_type.ilike.%${params.providerType}%`)
  }

  // Filter by emergency flag if provided
  if (params.isEmergency !== undefined) {
    query = query.eq('is_emergency', params.isEmergency)
  }

  // Filter by waiting period if date provided
  if (params.date) {
    // This would require checking if the insurance was active long enough
    // For now, we'll skip this check as it requires more complex logic
    // TODO: Implement waiting period check based on insurance activation date
  }

  const { data, error } = await query.order('confidence_score', { ascending: false })
    .order('coverage_percent', { ascending: false })

  if (error) {
    throw new Error(`Failed to query eligible coverages: ${error.message}`)
  }

  if (!data || data.length === 0) {
    return []
  }

  // Transform results into CoverageMatch format
  const matches: CoverageMatch[] = data.map((row: any) => {
    const coverage = row as InsuranceCoverage
    const insurance = row.insurances as Insurance

    // Build match reasons
    const matchReasons: string[] = []
    if (params.serviceType && coverage.service_type === params.serviceType) {
      matchReasons.push(`Service type: ${coverage.service_type}`)
    }
    if (params.specialty && coverage.specialty && coverage.specialty.toLowerCase().includes(params.specialty.toLowerCase())) {
      matchReasons.push(`Specialty: ${coverage.specialty}`)
    }
    if (params.isEmergency !== undefined && coverage.is_emergency === params.isEmergency) {
      matchReasons.push('Emergency coverage')
    }
    if (coverage.coverage_percent !== null) {
      matchReasons.push(`${coverage.coverage_percent}% coverage`)
    }

    return {
      insurance: {
        id: insurance.id,
        provider_name: insurance.provider_name,
        policy_id: insurance.policy_id,
        insurance_type: insurance.insurance_type,
      },
      coverage: {
        id: coverage.id,
        coverage_domain: coverage.coverage_domain,
        service_type: coverage.service_type,
        specialty: coverage.specialty,
        provider_type: coverage.provider_type,
        is_emergency: coverage.is_emergency,
        coverage_percent: coverage.coverage_percent,
        max_amount: coverage.max_amount,
        currency: coverage.currency,
        deductible_amount: coverage.deductible_amount,
        copay_amount: coverage.copay_amount,
        frequency_limit: coverage.frequency_limit,
        waiting_period_days: coverage.waiting_period_days,
        exclusions: coverage.exclusions,
        conditions: coverage.conditions,
        per_service_limit: coverage.per_service_limit,
        per_service_limit_currency: coverage.per_service_limit_currency,
        confidence_score: coverage.confidence_score,
        source: coverage.source,
      },
      matchReasons,
    }
  })

  return matches
}

/**
 * Gets eligible coverages for an appointment
 * Helper function that maps appointment data to coverage query
 */
export async function getEligibleCoveragesForAppointment(
  specialty: string | null,
  isEmergency: boolean = false
): Promise<CoverageMatch[]> {
  // Map appointment specialty to service type
  let serviceType: string | undefined

  if (specialty) {
    const normalizedSpecialty = specialty.toLowerCase()
    
    // Map common specialties to service types
    if (normalizedSpecialty.includes('general') || normalizedSpecialty.includes('primaria')) {
      serviceType = 'consulta_general'
    } else {
      serviceType = 'consulta_especialista'
    }
  }

  return getEligibleCoverages({
    serviceType,
    specialty: specialty || undefined,
    isEmergency,
  })
}

/**
 * Gets eligible coverages for a bill
 * Helper function that maps bill data to coverage query
 */
export async function getEligibleCoveragesForBill(
  appointmentId: string | null,
  resultId: string | null
): Promise<CoverageMatch[]> {
  // If bill is linked to an appointment, use appointment's specialty
  if (appointmentId) {
    const { data: appointment } = await supabase
      .from('appointments')
      .select('specialty')
      .eq('id', appointmentId)
      .single()

    if (appointment?.specialty) {
      return getEligibleCoveragesForAppointment(appointment.specialty, false)
    }
  }

  // If bill is linked to a result, try to infer service type
  if (resultId) {
    const { data: result } = await supabase
      .from('results')
      .select('test_type')
      .eq('id', resultId)
      .single()

    if (result?.test_type) {
      const normalizedTestType = result.test_type.toLowerCase()
      let serviceType: string | undefined

      if (normalizedTestType.includes('laboratorio') || normalizedTestType.includes('laboratory')) {
        serviceType = 'examen_laboratorio'
      } else if (normalizedTestType.includes('imagen') || normalizedTestType.includes('imagenología')) {
        serviceType = 'imagenologia'
      }

      if (serviceType) {
        return getEligibleCoverages({
          serviceType,
        })
      }
    }
  }

  // Default: return all active coverages (very broad match)
  return getEligibleCoverages({})
}

