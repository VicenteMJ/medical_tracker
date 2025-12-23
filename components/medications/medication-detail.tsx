'use client'

import { Medication } from '@/types/database'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { deleteMedication } from '@/lib/medications'

interface MedicationDetailProps {
  medication: Medication
}

const formatTime = (time24: string) => {
  const [hours, minutes] = time24.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  return `${hour12}:${minutes} ${ampm}`
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'No date'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  })
}

const FREQUENCY_LABELS: Record<string, string> = {
  daily: 'Every Day',
  weekly: 'Weekly',
  as_needed: 'As Needed',
  custom: 'Custom',
}

export function MedicationDetail({ medication }: MedicationDetailProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  const displayName = medication.display_name || medication.name
  const strengthDisplay = medication.strength && medication.unit 
    ? `${medication.strength} ${medication.unit}`
    : null

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteMedication(medication.id)
      router.push('/medications')
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete medication')
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Medication Details
        </h1>
        <div className="flex gap-3">
          <Link
            href={`/medications/${medication.id}/edit`}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Edit
          </Link>
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
            Are you sure you want to delete this medication? This action cannot be undone.
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
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {displayName}
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-400 capitalize">
            {medication.type}
          </p>
          {strengthDisplay && (
            <p className="text-lg text-gray-700 dark:text-gray-300 mt-2">
              {strengthDisplay}
            </p>
          )}
        </div>

        {/* Schedule Section */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
            Schedule
          </h3>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
            <p className="font-medium text-gray-900 dark:text-white">
              {FREQUENCY_LABELS[medication.frequency] || medication.frequency}
            </p>
            {medication.schedule_times && medication.schedule_times.length > 0 ? (
              <div className="space-y-1 mt-2">
                {medication.schedule_times.map((schedule, index) => (
                  <p key={index} className="text-gray-700 dark:text-gray-300">
                    {formatTime(schedule.time)} - {schedule.dosage}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No specific times scheduled</p>
            )}
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700 mt-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Start Date:</span> {formatDate(medication.start_date)}
              </p>
              {medication.end_date && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <span className="font-medium">End Date:</span> {formatDate(medication.end_date)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Notes Section */}
        {medication.notes && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              Notes
            </h3>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {medication.notes}
              </p>
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Created: {new Date(medication.created_at).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
          {medication.updated_at !== medication.created_at && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Updated: {new Date(medication.updated_at).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          )}
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <Link
            href="/medications"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to Medications
          </Link>
        </div>
      </div>
    </div>
  )
}
