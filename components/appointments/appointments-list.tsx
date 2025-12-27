'use client'

import { useState, useEffect } from 'react'
import { Appointment } from '@/types/database'
import { AppointmentCard } from './appointment-card'
import { AppointmentFilter } from './appointment-filter'
import Link from 'next/link'

interface AppointmentsListProps {
  initialAppointments: Appointment[]
}

export function AppointmentsList({ initialAppointments }: AppointmentsListProps) {
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>(initialAppointments)

  useEffect(() => {
    setFilteredAppointments(initialAppointments)
  }, [initialAppointments])

  if (initialAppointments.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          No appointments yet. Create your first appointment to get started.
        </p>
        <Link
          href="/appointments/new"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Create Appointment
        </Link>
      </div>
    )
  }

  return (
    <>
      <AppointmentFilter
        appointments={initialAppointments}
        onFiltered={setFilteredAppointments}
      />
      {filteredAppointments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            No appointments match your filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAppointments.map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))}
        </div>
      )}
    </>
  )
}

















