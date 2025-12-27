import { supabase } from './supabase'
import { Medication } from '@/types/database'

export async function getMedications(): Promise<Medication[]> {
  const { data, error } = await supabase
    .from('medications')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch medications: ${error.message}`)
  }

  return data || []
}

export async function getMedication(id: string): Promise<Medication | null> {
  const { data, error } = await supabase
    .from('medications')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(`Failed to fetch medication: ${error.message}`)
  }

  return data
}

export async function createMedication(
  medication: Omit<Medication, 'id' | 'created_at' | 'updated_at'>
): Promise<Medication> {
  const { data, error } = await supabase
    .from('medications')
    .insert(medication)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create medication: ${error.message}`)
  }

  return data
}

export async function updateMedication(
  id: string,
  updates: Partial<Omit<Medication, 'id' | 'created_at' | 'updated_at'>>
): Promise<Medication> {
  const { data, error } = await supabase
    .from('medications')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update medication: ${error.message}`)
  }

  return data
}

export async function deleteMedication(id: string): Promise<void> {
  const { error } = await supabase
    .from('medications')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to delete medication: ${error.message}`)
  }
}



