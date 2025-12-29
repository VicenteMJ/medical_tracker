import { supabase } from './supabase'
import { Insurance } from '@/types/database'

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

