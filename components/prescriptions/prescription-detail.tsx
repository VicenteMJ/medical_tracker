'use client'

import { Prescription, Appointment } from '@/types/database'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { deletePrescription, archivePrescription } from '@/lib/prescriptions'
import { getAppointment } from '@/lib/appointments'

interface PrescriptionDetailProps {
  prescription: Prescription
}

const PRESCRIPTION_TYPE_LABELS = {
  A: 'Receta Simple',
  B: 'Receta Retenida',
  C: 'Receta Cheque',
  D: 'Receta Magistral',
}

const PRESCRIPTION_TYPE_DESCRIPTIONS = {
  A: 'Antibiotics, cholesterol, blood pressure meds. 30 days default, 6 months if chronic use.',
  B: 'Psychotropics (Clonazepam, Sentis, etc.) or corticosteroids. Strictly 30 days. Pharmacy retains it.',
  C: 'Strong painkillers, stimulants. Extremely strict handling.',
  D: 'Custom prepared formulas.',
}

function getExpirationStatus(expirationDate: string | null): {
  status: 'valid' | 'expiring-soon' | 'expired'
  label: string
  color: string
  bgColor: string
} {
  if (!expirationDate) {
    return { 
      status: 'valid', 
      label: 'No expiration date', 
      color: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-100 dark:bg-gray-700'
    }
  }

  const expiration = new Date(expirationDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  expiration.setHours(0, 0, 0, 0)

  const daysUntilExpiration = Math.ceil((expiration.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (daysUntilExpiration < 0) {
    return { 
      status: 'expired', 
      label: `Expired ${Math.abs(daysUntilExpiration)} day${Math.abs(daysUntilExpiration) !== 1 ? 's' : ''} ago`, 
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20'
    }
  } else if (daysUntilExpiration <= 7) {
    return { 
      status: 'expiring-soon', 
      label: `Expires in ${daysUntilExpiration} day${daysUntilExpiration !== 1 ? 's' : ''}`, 
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20'
    }
  } else {
    return { 
      status: 'valid', 
      label: `Expires ${formatDate(expirationDate)}`, 
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    }
  }
}

export function PrescriptionDetail({ prescription }: PrescriptionDetailProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isArchiving, setIsArchiving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [loadingRelated, setLoadingRelated] = useState(true)

  useEffect(() => {
    async function loadRelated() {
      try {
        if (prescription.appointment_id) {
          const appointmentData = await getAppointment(prescription.appointment_id)
          setAppointment(appointmentData)
        }
      } catch (error) {
        console.error('Failed to load related data:', error)
      } finally {
        setLoadingRelated(false)
      }
    }
    loadRelated()
  }, [prescription.appointment_id])

  const handleArchive = async () => {
    if (prescription.prescription_type !== 'B') {
      return
    }
    
    setIsArchiving(true)
    try {
      await archivePrescription(prescription.id)
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to archive prescription')
      setIsArchiving(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deletePrescription(prescription.id)
      router.push('/prescriptions')
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete prescription')
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const expirationStatus = getExpirationStatus(prescription.expiration_date)
  const isImage = prescription.file_url && /\.(jpg|jpeg|png)$/i.test(prescription.file_url)

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Prescription Details
        </h1>
        <div className="flex gap-3">
          <Link
            href={`/prescriptions/${prescription.id}/edit`}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Edit
          </Link>
          {prescription.prescription_type === 'B' && !prescription.is_archived && (
            <button
              onClick={handleArchive}
              disabled={isArchiving}
              className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isArchiving ? 'Archiving...' : 'Archive'}
            </button>
          )}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Delete
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <p className="text-red-800 dark:text-red-200 mb-4">
            Are you sure you want to delete this prescription? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Yes, Delete'}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {prescription.name || `Prescription Type ${prescription.prescription_type}`}
          </h2>
          {appointment && (
            <p className="text-base text-gray-600 dark:text-gray-400 mb-4">
              {appointment.doctor_name}
            </p>
          )}
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 text-sm font-semibold rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              Type {prescription.prescription_type}: {PRESCRIPTION_TYPE_LABELS[prescription.prescription_type]}
            </span>
            {prescription.is_archived && (
              <span className="px-3 py-1 text-sm font-semibold rounded bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                Archived
              </span>
            )}
            {prescription.is_chronic_use && prescription.prescription_type === 'A' && (
              <span className="px-3 py-1 text-sm font-semibold rounded bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Chronic Use (6 Months)
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {PRESCRIPTION_TYPE_DESCRIPTIONS[prescription.prescription_type]}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              Issue Date
            </h3>
            <p className="text-gray-900 dark:text-white">{formatDate(prescription.issue_date)}</p>
          </div>
          {prescription.expiration_date && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                Expiration Date
              </h3>
              <div className={`px-3 py-2 rounded ${expirationStatus.bgColor}`}>
                <p className={`font-medium ${expirationStatus.color}`}>
                  {expirationStatus.label}
                </p>
              </div>
            </div>
          )}
        </div>

        {prescription.appointment_id && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              Related Appointment
            </h3>
            {loadingRelated ? (
              <p className="text-gray-600 dark:text-gray-400">Loading...</p>
            ) : appointment ? (
              <Link
                href={`/appointments/${prescription.appointment_id}`}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {appointment.doctor_name} - {new Date(appointment.date).toLocaleDateString()} →
              </Link>
            ) : (
              <Link
                href={`/appointments/${prescription.appointment_id}`}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                View Appointment →
              </Link>
            )}
          </div>
        )}

        {prescription.file_url && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Prescription File
            </h3>
            {isImage ? (
              <div className="mt-2">
                <img
                  src={prescription.file_url}
                  alt="Prescription"
                  className="max-w-full h-auto rounded-lg border border-gray-200 dark:border-gray-700"
                />
                <a
                  href={prescription.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-blue-600 dark:text-blue-400 hover:underline text-sm"
                >
                  Open in new tab →
                </a>
              </div>
            ) : (
              <div>
                <a
                  href={prescription.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  View Prescription PDF →
                </a>
              </div>
            )}
          </div>
        )}

        {prescription.notes && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              Notes
            </h3>
            <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
              {prescription.notes}
            </p>
          </div>
        )}

        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
            Date Added
          </h3>
          <p className="text-gray-900 dark:text-white">{formatDate(prescription.created_at)}</p>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <Link
            href="/prescriptions"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to Prescriptions
          </Link>
        </div>
      </div>
    </div>
  )
}
