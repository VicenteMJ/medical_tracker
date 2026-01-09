import { Prescription, Appointment } from '@/types/database'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { getAppointment } from '@/lib/appointments'

interface PrescriptionCardProps {
  prescription: Prescription
}

const PRESCRIPTION_TYPE_LABELS = {
  A: 'Receta Simple',
  B: 'Receta Retenida',
  C: 'Receta Cheque',
  D: 'Receta Magistral',
}

const PRESCRIPTION_TYPE_COLORS = {
  A: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  B: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  C: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  D: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
}

function getExpirationStatus(expirationDate: string | null): {
  status: 'valid' | 'expiring-soon' | 'expired'
  label: string
  color: string
} {
  if (!expirationDate) {
    return { status: 'valid', label: 'No expiration', color: 'text-gray-600 dark:text-gray-400' }
  }

  const expiration = new Date(expirationDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  expiration.setHours(0, 0, 0, 0)

  const daysUntilExpiration = Math.ceil((expiration.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (daysUntilExpiration < 0) {
    return { status: 'expired', label: 'Expired', color: 'text-red-600 dark:text-red-400' }
  } else if (daysUntilExpiration <= 7) {
    return { status: 'expiring-soon', label: `Expires in ${daysUntilExpiration} day${daysUntilExpiration !== 1 ? 's' : ''}`, color: 'text-yellow-600 dark:text-yellow-400' }
  } else {
    return { status: 'valid', label: `Expires ${formatDate(expirationDate)}`, color: 'text-gray-600 dark:text-gray-400' }
  }
}

export function PrescriptionCard({ prescription }: PrescriptionCardProps) {
  const expirationStatus = getExpirationStatus(prescription.expiration_date)
  const typeLabel = PRESCRIPTION_TYPE_LABELS[prescription.prescription_type]
  const typeColor = PRESCRIPTION_TYPE_COLORS[prescription.prescription_type]
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [loadingAppointment, setLoadingAppointment] = useState(false)

  useEffect(() => {
    async function loadAppointment() {
      if (!prescription.appointment_id) return
      setLoadingAppointment(true)
      try {
        const data = await getAppointment(prescription.appointment_id)
        setAppointment(data)
      } catch (error) {
        console.error('Failed to load appointment:', error)
      } finally {
        setLoadingAppointment(false)
      }
    }
    loadAppointment()
  }, [prescription.appointment_id])

  return (
    <Link
      href={`/prescriptions/${prescription.id}`}
      className="block bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow p-6"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          {/* Prescription Name as Title */}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {prescription.name || `Prescription ${prescription.prescription_type}`}
          </h3>
          
          {/* Doctor Name below title */}
          {appointment && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {appointment.doctor_name}
            </p>
          )}
          
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 text-xs font-semibold rounded ${typeColor}`}>
              Type {prescription.prescription_type}: {typeLabel}
            </span>
            {prescription.is_archived && (
              <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                Archived
              </span>
            )}
            {prescription.is_chronic_use && prescription.prescription_type === 'A' && (
              <span className="px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Chronic Use
              </span>
            )}
          </div>
          
          <div className="space-y-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Issue Date: {formatDate(prescription.issue_date)}
            </p>
            {prescription.expiration_date && (
              <p className={`text-sm font-medium ${expirationStatus.color}`}>
                {expirationStatus.label}
              </p>
            )}
            {prescription.notes && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                {prescription.notes}
              </p>
            )}
          </div>
        </div>
        {prescription.file_url && (
          <div className="ml-4 flex-shrink-0">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>
    </Link>
  )
}
