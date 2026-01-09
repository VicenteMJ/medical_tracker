import { supabase } from './supabase'
import { Insurance, InsuranceCoverage, InsuranceRawAnalysis } from '@/types/database'

export async function getInsurances(): Promise<Insurance[]> {
  const { data, error } = await supabase
    .from('insurances')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch insurances: ${error.message}`)
  }

  return data || []
}

export async function getInsurance(id: string): Promise<Insurance | null> {
  const { data, error } = await supabase
    .from('insurances')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(`Failed to fetch insurance: ${error.message}`)
  }

  return data
}

export async function createInsurance(
  insurance: Omit<Insurance, 'id' | 'created_at' | 'updated_at'>
): Promise<Insurance> {
  const { data, error } = await supabase
    .from('insurances')
    .insert(insurance)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create insurance: ${error.message}`)
  }

  return data
}

export async function updateInsurance(
  id: string,
  updates: Partial<Omit<Insurance, 'id' | 'created_at' | 'updated_at'>>
): Promise<Insurance> {
  const { data, error } = await supabase
    .from('insurances')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update insurance: ${error.message}`)
  }

  return data
}

export async function deleteInsurance(id: string): Promise<void> {
  const { error } = await supabase
    .from('insurances')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to delete insurance: ${error.message}`)
  }
}

/**
 * Analyzes insurance coverage from PDF using AI
 * @param insuranceId - The ID of the insurance to analyze
 * @returns The updated insurance with coverage_data populated
 */
/**
 * Analyzes insurance coverage from PDF using AI
 * @param insuranceId - The ID of the insurance to analyze
 * @returns The updated insurance with coverage_data populated
 */
export async function analyzeInsuranceCoverage(insuranceId: string): Promise<Insurance> {
  try {
    const response = await fetch('/api/insurance/analyze-coverage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ insuranceId }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(errorData.error || `Failed to analyze coverage: ${response.statusText}`)
    }

    const data = await response.json()
    return data.insurance
  } catch (error) {
    throw new Error(`Failed to analyze insurance coverage: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Gets all coverage rules for an insurance policy
 */
export async function getInsuranceCoverages(insuranceId: string): Promise<InsuranceCoverage[]> {
  const { data, error } = await supabase
    .from('insurance_coverages')
    .select('*')
    .eq('insurance_id', insuranceId)
    .order('coverage_domain', { ascending: true })
    .order('service_type', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch insurance coverages: ${error.message}`)
  }

  return data || []
}

/**
 * Creates a new insurance coverage rule
 */
export async function createInsuranceCoverage(
  coverage: Omit<InsuranceCoverage, 'id' | 'created_at' | 'updated_at'>
): Promise<InsuranceCoverage> {
  const { data, error } = await supabase
    .from('insurance_coverages')
    .insert(coverage)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create insurance coverage: ${error.message}`)
  }

  return data
}

/**
 * Updates an insurance coverage rule
 */
export async function updateInsuranceCoverage(
  id: string,
  updates: Partial<Omit<InsuranceCoverage, 'id' | 'created_at' | 'updated_at'>>
): Promise<InsuranceCoverage> {
  const { data, error } = await supabase
    .from('insurance_coverages')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update insurance coverage: ${error.message}`)
  }

  return data
}

/**
 * Deletes an insurance coverage rule
 */
export async function deleteInsuranceCoverage(id: string): Promise<void> {
  const { error } = await supabase
    .from('insurance_coverages')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to delete insurance coverage: ${error.message}`)
  }
}

/**
 * Gets the raw analysis for an insurance policy
 */
export async function getRawAnalysis(insuranceId: string): Promise<InsuranceRawAnalysis | null> {
  const { data, error } = await supabase
    .from('insurance_raw_analysis')
    .select('*')
    .eq('insurance_id', insuranceId)
    .order('extracted_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null
    }
    throw new Error(`Failed to fetch raw analysis: ${error.message}`)
  }

  return data
}
