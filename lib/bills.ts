import { supabase } from './supabase'
import { Bill, BillInsurance, BillInsuranceWithDetails } from '@/types/database'
import { getEligibleCoveragesForBill } from './coverage-eligibility'

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

  // Check for eligible coverages (non-blocking, informational only)
  if (data) {
    getEligibleCoveragesForBill(data.appointment_id || null, data.result_id || null)
      .catch((err) => {
        console.error('Failed to check coverage eligibility for bill:', err)
        // Don't throw - this is informational only
      })
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

  // Check for eligible coverages if appointment_id or result_id was updated (non-blocking, informational only)
  if (data && (updates.appointment_id !== undefined || updates.result_id !== undefined)) {
    getEligibleCoveragesForBill(data.appointment_id || null, data.result_id || null)
      .catch((err) => {
        console.error('Failed to check coverage eligibility for bill:', err)
        // Don't throw - this is informational only
      })
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

/**
 * Get all insurances associated with a bill, including insurance details
 */
export async function getBillInsurances(billId: string): Promise<BillInsuranceWithDetails[]> {
  const { data, error } = await supabase
    .from('bill_insurances')
    .select(`
      *,
      insurance:insurances (*)
    `)
    .eq('bill_id', billId)
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch bill insurances: ${error.message}`)
  }

  return (data || []).map((item: any) => ({
    id: item.id,
    bill_id: item.bill_id,
    insurance_id: item.insurance_id,
    is_used: item.is_used,
    created_at: item.created_at,
    insurance: item.insurance,
  }))
}

/**
 * Set all insurances for a bill (replaces existing relationships)
 */
export async function setBillInsurances(billId: string, insuranceIds: string[]): Promise<void> {
  // First, delete all existing relationships
  const { error: deleteError } = await supabase
    .from('bill_insurances')
    .delete()
    .eq('bill_id', billId)

  if (deleteError) {
    throw new Error(`Failed to remove existing bill insurances: ${deleteError.message}`)
  }

  // If no insurances to add, we're done
  if (insuranceIds.length === 0) {
    return
  }

  // Insert new relationships
  const insertData = insuranceIds.map((insuranceId) => ({
    bill_id: billId,
    insurance_id: insuranceId,
    is_used: false,
  }))

  const { error: insertError } = await supabase
    .from('bill_insurances')
    .insert(insertData)

  if (insertError) {
    throw new Error(`Failed to set bill insurances: ${insertError.message}`)
  }
}

/**
 * Update the usage status of an insurance for a bill
 */
export async function updateBillInsuranceUsage(
  billId: string,
  insuranceId: string,
  isUsed: boolean
): Promise<BillInsurance> {
  const { data, error } = await supabase
    .from('bill_insurances')
    .update({ is_used: isUsed })
    .eq('bill_id', billId)
    .eq('insurance_id', insuranceId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update bill insurance usage: ${error.message}`)
  }

  return data
}

/**
 * Add a single insurance to a bill
 */
export async function addInsuranceToBill(billId: string, insuranceId: string): Promise<BillInsurance> {
  const { data, error } = await supabase
    .from('bill_insurances')
    .insert({
      bill_id: billId,
      insurance_id: insuranceId,
      is_used: false,
    })
    .select()
    .single()

  if (error) {
    // If it's a unique constraint error, the relationship already exists
    if (error.code === '23505') {
      // Return the existing relationship
      const { data: existing } = await supabase
        .from('bill_insurances')
        .select()
        .eq('bill_id', billId)
        .eq('insurance_id', insuranceId)
        .single()
      
      if (existing) {
        return existing
      }
    }
    throw new Error(`Failed to add insurance to bill: ${error.message}`)
  }

  return data
}

/**
 * Remove an insurance from a bill
 */
export async function removeInsuranceFromBill(billId: string, insuranceId: string): Promise<void> {
  const { error } = await supabase
    .from('bill_insurances')
    .delete()
    .eq('bill_id', billId)
    .eq('insurance_id', insuranceId)

  if (error) {
    throw new Error(`Failed to remove insurance from bill: ${error.message}`)
  }
}
