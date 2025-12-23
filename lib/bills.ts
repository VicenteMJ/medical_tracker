import { supabase } from './supabase'
import { Bill } from '@/types/database'

export async function getBills(): Promise<Bill[]> {
  const { data, error } = await supabase
    .from('bills')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch bills: ${error.message}`)
  }

  return data || []
}

export async function getBill(id: string): Promise<Bill | null> {
  const { data, error } = await supabase
    .from('bills')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(`Failed to fetch bill: ${error.message}`)
  }

  return data
}

export async function getBillsByAppointment(appointmentId: string): Promise<Bill[]> {
  const { data, error } = await supabase
    .from('bills')
    .select('*')
    .eq('appointment_id', appointmentId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch bills: ${error.message}`)
  }

  return data || []
}

export async function getBillsByResult(resultId: string): Promise<Bill[]> {
  const { data, error } = await supabase
    .from('bills')
    .select('*')
    .eq('result_id', resultId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch bills: ${error.message}`)
  }

  return data || []
}

export async function getBillsByResultIds(resultIds: string[]): Promise<Bill[]> {
  if (resultIds.length === 0) {
    return []
  }

  const { data, error } = await supabase
    .from('bills')
    .select('*')
    .in('result_id', resultIds)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch bills: ${error.message}`)
  }

  return data || []
}

export async function createBill(
  bill: Omit<Bill, 'id' | 'created_at'>
): Promise<Bill> {
  const { data, error } = await supabase
    .from('bills')
    .insert(bill)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create bill: ${error.message}`)
  }

  return data
}

export async function updateBill(
  id: string,
  updates: Partial<Omit<Bill, 'id' | 'created_at'>>
): Promise<Bill> {
  const { data, error } = await supabase
    .from('bills')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update bill: ${error.message}`)
  }

  return data
}

export async function deleteBill(id: string): Promise<void> {
  const { error } = await supabase
    .from('bills')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to delete bill: ${error.message}`)
  }
}
