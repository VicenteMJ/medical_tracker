import { Appointment } from '@/types/database'
import { getAppointments } from './appointments'

/**
 * Check if an appointment is past a certain threshold (default 2 hours)
 */
export function isAppointmentPastThreshold(
  appointment: Appointment,
  hours: number = 2
): boolean {
  const appointmentDate = new Date(appointment.date)
  const now = new Date()
  const thresholdTime = new Date(appointmentDate.getTime() + hours * 60 * 60 * 1000)
  
  return now >= thresholdTime
}

/**
 * Check if the follow-up wizard should be shown for an appointment
 * Conditions:
 * - Appointment is 2+ hours past
 * - Status is not yet set (null)
 */
export function shouldShowFollowupWizard(appointment: Appointment): boolean {
  // Don't show if status is already set
  if (appointment.status !== null) {
    return false
  }
  
  // Show if appointment is past threshold
  return isAppointmentPastThreshold(appointment, 2)
}

/**
 * Get all appointments that need follow-up
 */
export async function getAppointmentsNeedingFollowup(): Promise<Appointment[]> {
  const appointments = await getAppointments()
  return appointments.filter(shouldShowFollowupWizard)
}
