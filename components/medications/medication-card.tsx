'use client'

import { Medication } from '@/types/database'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteMedication } from '@/lib/medications'

interface MedicationCardProps {
  medication: Medication
}

const formatTime = (time24: string) => {
  const [hours, minutes] = time24.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  return `${hour12}:${minutes} ${ampm}`
}

export function MedicationCard({ medication }: MedicationCardProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const displayName = medication.display_name || medication.name
  const strengthDisplay = medication.strength && medication.unit 
    ? `${medication.strength} ${medication.unit}`
    : null

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!confirm('Are you sure you want to delete this medication?')) {
      return
    }

    setIsDeleting(true)
    try {
      await deleteMedication(medication.id)
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete medication')
      setIsDeleting(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow p-6 relative group">
      <Link
        href={`/medications/${medication.id}`}
        className="block"
      >
        <div className="flex justify-between items-start">
          <div className="flex-1 pr-12">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {displayName}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
              {medication.type}
            </p>
            {strengthDisplay && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {strengthDisplay}
              </p>
            )}
            {medication.frequency && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Frequency: {medication.frequency}
              </p>
            )}
            {medication.schedule_times && medication.schedule_times.length > 0 && (
              <div className="mt-2 space-y-1">
                {medication.schedule_times.map((schedule, index) => (
                  <p key={index} className="text-xs text-gray-500 dark:text-gray-400">
                    {formatTime(schedule.time)} - {schedule.dosage}
                  </p>
                ))}
              </div>
            )}
            {medication.start_date && (
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Start: {formatDate(medication.start_date)}
              </p>
            )}
            {medication.notes && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 line-clamp-2">
                {medication.notes}
              </p>
            )}
          </div>
        </div>
      </Link>
      
      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Link
          href={`/medications/${medication.id}/edit`}
          onClick={(e) => e.stopPropagation()}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
          title="Edit"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </Link>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 disabled:opacity-50 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
          title="Delete"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  )
}

