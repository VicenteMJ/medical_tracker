import { supabase } from './supabase'
import { Appointment } from '@/types/database'
import { getEligibleCoveragesForAppointment } from './coverage-eligibility'

export async function getAppointments(): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .order('date', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch appointments: ${error.message}`)
  }

  return data || []
}

export async function getAppointment(id: string): Promise<Appointment | null> {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(`Failed to fetch appointment: ${error.message}`)
  }

  return data
}

export async function createAppointment(
  appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>
): Promise<Appointment> {
  const { data, error } = await supabase
    .from('appointments')
    .insert(appointment)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create appointment: ${error.message}`)
  }

  // Check for eligible coverages (non-blocking, informational only)
  if (data) {
    getEligibleCoveragesForAppointment(data.specialty || null, false)
      .catch((err) => {
        console.error('Failed to check coverage eligibility for appointment:', err)
        // Don't throw - this is informational only
      })
  }

  return data
}

export async function updateAppointment(
  id: string,
  updates: Partial<Omit<Appointment, 'id' | 'created_at' | 'updated_at'>>
): Promise<Appointment> {
  const { data, error } = await supabase
    .from('appointments')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update appointment: ${error.message}`)
  }

  // Check for eligible coverages if specialty was updated (non-blocking, informational only)
  if (data && updates.specialty !== undefined) {
    getEligibleCoveragesForAppointment(data.specialty || null, false)
      .catch((err) => {
        console.error('Failed to check coverage eligibility for appointment:', err)
        // Don't throw - this is informational only
      })
  }

  return data
}

export async function deleteAppointment(id: string): Promise<void> {
  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to delete appointment: ${error.message}`)
  }
}

















