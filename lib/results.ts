import { supabase } from './supabase'
import { Result } from '@/types/database'

export async function getResults(): Promise<Result[]> {
  const { data, error } = await supabase
    .from('results')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch results: ${error.message}`)
  }

  return data || []
}

export async function getResult(id: string): Promise<Result | null> {
  const { data, error } = await supabase
    .from('results')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(`Failed to fetch result: ${error.message}`)
  }

  return data
}

export async function getResultsByAppointment(appointmentId: string): Promise<Result[]> {
  const { data, error } = await supabase
    .from('results')
    .select('*')
    .eq('appointment_id', appointmentId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch results: ${error.message}`)
  }

  return data || []
}

export async function createResult(
  result: Omit<Result, 'id' | 'created_at'>
): Promise<Result> {
  const { data, error } = await supabase
    .from('results')
    .insert(result)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create result: ${error.message}`)
  }

  return data
}

export async function updateResult(
  id: string,
  updates: Partial<Omit<Result, 'id' | 'created_at'>>
): Promise<Result> {
  const { data, error } = await supabase
    .from('results')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update result: ${error.message}`)
  }

  return data
}

export async function deleteResult(id: string): Promise<void> {
  const { error } = await supabase
    .from('results')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to delete result: ${error.message}`)
  }
}

















