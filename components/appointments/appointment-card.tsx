'use client'

import { Appointment } from '@/types/database'
import { formatDate } from '@/lib/utils'
import { shouldShowFollowupWizard } from '@/lib/appointment-followup'
import Link from 'next/link'
import { useState } from 'react'
import { AppointmentFollowupWizard } from './appointment-followup-wizard'
import { useRouter } from 'next/navigation'

interface AppointmentCardProps {
  appointment: Appointment
}

export function AppointmentCard({ appointment }: AppointmentCardProps) {
  const router = useRouter()
  const [showWizard, setShowWizard] = useState(false)
  const needsFollowup = shouldShowFollowupWizard(appointment)

  const handleWizardComplete = () => {
    setShowWizard(false)
    router.refresh()
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow p-6 relative">
        <div className="flex justify-between items-start">
          <Link
            href={`/appointments/${appointment.id}`}
            className="flex-1"
          >
            <div className="flex items-start gap-2">
              {needsFollowup && (
                <span className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2 animate-pulse" title="Follow-up needed" />
              )}
              {appointment.status && (
                <span className={`flex-shrink-0 px-2 py-1 rounded-full text-xs font-medium ${
                  appointment.status === 'attended'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                }`}>
                  {appointment.status === 'attended' ? 'Attended' : 'Missed'}
                </span>
              )}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {appointment.doctor_name}
                </h3>
                {appointment.specialty && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {appointment.specialty}
                  </p>
                )}
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  {formatDate(appointment.date)}
                </p>
                {appointment.notes && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 line-clamp-2">
                    {appointment.notes}
                  </p>
                )}
              </div>
            </div>
          </Link>
        </div>
        
        {needsFollowup && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={(e) => {
                e.preventDefault()
                setShowWizard(true)
              }}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm font-medium"
            >
              Complete Follow-up
            </button>
          </div>
        )}
      </div>

      {showWizard && (
        <AppointmentFollowupWizard
          appointment={appointment}
          onComplete={handleWizardComplete}
          onClose={() => setShowWizard(false)}
        />
      )}
    </>
  )
}











