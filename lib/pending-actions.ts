import { supabase } from './supabase'
import { PendingAction } from '@/types/database'

export interface PendingActionInput {
  appointment_id?: string | null
  prescription_id?: string | null
  medication_name?: string | null
  action_type?: string
  description: string
}

export async function getPendingActions(): Promise<PendingAction[]> {
  const { data, error } = await supabase
    .from('pending_actions')
    .select('*')
    .eq('is_completed', false)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch pending actions: ${error.message}`)
  }

  return data || []
}

export async function getPendingAction(id: string): Promise<PendingAction | null> {
  const { data, error } = await supabase
    .from('pending_actions')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(`Failed to fetch pending action: ${error.message}`)
  }

  return data
}

export async function getPendingActionsByAppointment(
  appointmentId: string
): Promise<PendingAction[]> {
  const { data, error } = await supabase
    .from('pending_actions')
    .select('*')
    .eq('appointment_id', appointmentId)
    .eq('is_completed', false)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch pending actions: ${error.message}`)
  }

  return data || []
}

export async function getPendingActionsByPrescription(
  prescriptionId: string
): Promise<PendingAction[]> {
  const { data, error } = await supabase
    .from('pending_actions')
    .select('*')
    .eq('prescription_id', prescriptionId)
    .eq('is_completed', false)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch pending actions: ${error.message}`)
  }

  return data || []
}

export async function createPendingAction(
  action: PendingActionInput
): Promise<PendingAction> {
  const { data, error } = await supabase
    .from('pending_actions')
    .insert({
      appointment_id: action.appointment_id || null,
      prescription_id: action.prescription_id || null,
      medication_name: action.medication_name || null,
      action_type: action.action_type || 'reminder',
      description: action.description,
      is_completed: false,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create pending action: ${error.message}`)
  }

  return data
}

export async function completePendingAction(id: string): Promise<PendingAction> {
  const { data, error } = await supabase
    .from('pending_actions')
    .update({ is_completed: true })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to complete pending action: ${error.message}`)
  }

  return data
}

export async function deletePendingAction(id: string): Promise<void> {
  const { error } = await supabase
    .from('pending_actions')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to delete pending action: ${error.message}`)
  }
}
