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

