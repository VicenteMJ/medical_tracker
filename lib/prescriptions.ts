import { supabase } from './supabase'
import { Prescription } from '@/types/database'

/**
 * Calculate expiration date based on prescription type, issue date, and chronic use
 */
export function calculateExpirationDate(
  prescriptionType: 'A' | 'B' | 'C' | 'D',
  issueDate: string,
  isChronicUse: boolean
): string | null {
  const issue = new Date(issueDate)
  
  // Type A: 30 days default, 6 months if chronic use
  if (prescriptionType === 'A') {
    if (isChronicUse) {
      // 6 months from issue date
      const expiration = new Date(issue)
      expiration.setMonth(expiration.getMonth() + 6)
      return expiration.toISOString().split('T')[0]
    } else {
      // 30 days from issue date
      const expiration = new Date(issue)
      expiration.setDate(expiration.getDate() + 30)
      return expiration.toISOString().split('T')[0]
    }
  }
  
  // Type B: 30 days strict
  if (prescriptionType === 'B') {
    const expiration = new Date(issue)
    expiration.setDate(expiration.getDate() + 30)
    return expiration.toISOString().split('T')[0]
  }
  
  // Type C and D: Return null for now (may need custom logic)
  // Type C (Narcotics) and Type D (Custom formulas) may have different rules
  return null
}

export async function getPrescriptions(): Promise<Prescription[]> {
  const { data, error } = await supabase
    .from('prescriptions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch prescriptions: ${error.message}`)
  }

  return data || []
}

export async function getPrescription(id: string): Promise<Prescription | null> {
  const { data, error } = await supabase
    .from('prescriptions')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(`Failed to fetch prescription: ${error.message}`)
  }

  return data
}

export async function getPrescriptionsByAppointment(appointmentId: string): Promise<Prescription[]> {
  const { data, error } = await supabase
    .from('prescriptions')
    .select('*')
    .eq('appointment_id', appointmentId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch prescriptions: ${error.message}`)
  }

  return data || []
}

export async function createPrescription(
  prescription: Omit<Prescription, 'id' | 'created_at' | 'updated_at'>
): Promise<Prescription> {
  // Calculate expiration date if not provided
  let expirationDate = prescription.expiration_date
  if (!expirationDate && prescription.issue_date) {
    expirationDate = calculateExpirationDate(
      prescription.prescription_type,
      prescription.issue_date,
      prescription.is_chronic_use
    )
  }

  const { data, error } = await supabase
    .from('prescriptions')
    .insert({
      ...prescription,
      expiration_date: expirationDate,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create prescription: ${error.message}`)
  }

  return data
}

export async function updatePrescription(
  id: string,
  updates: Partial<Omit<Prescription, 'id' | 'created_at' | 'updated_at'>>
): Promise<Prescription> {
  // Recalculate expiration date if issue_date, prescription_type, or is_chronic_use changed
  let expirationDate = updates.expiration_date
  if (updates.issue_date || updates.prescription_type !== undefined || updates.is_chronic_use !== undefined) {
    // Need to get current values for fields not being updated
    const current = await getPrescription(id)
    if (current) {
      const issueDate = updates.issue_date || current.issue_date
      const prescriptionType = updates.prescription_type || current.prescription_type
      const isChronicUse = updates.is_chronic_use !== undefined ? updates.is_chronic_use : current.is_chronic_use
      
      expirationDate = calculateExpirationDate(prescriptionType, issueDate, isChronicUse)
    }
  }

  const { data, error } = await supabase
    .from('prescriptions')
    .update({
      ...updates,
      expiration_date: expirationDate !== undefined ? expirationDate : updates.expiration_date,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update prescription: ${error.message}`)
  }

  return data
}

export async function deletePrescription(id: string): Promise<void> {
  const { error } = await supabase
    .from('prescriptions')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Failed to delete prescription: ${error.message}`)
  }
}

export async function archivePrescription(id: string): Promise<Prescription> {
  const { data, error } = await supabase
    .from('prescriptions')
    .update({ is_archived: true })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to archive prescription: ${error.message}`)
  }

  return data
}
