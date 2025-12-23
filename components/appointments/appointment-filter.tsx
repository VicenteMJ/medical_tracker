'use client'

import { useState } from 'react'
import { Appointment } from '@/types/database'

interface AppointmentFilterProps {
  appointments: Appointment[]
  onFiltered: (filtered: Appointment[]) => void
}

export function AppointmentFilter({ appointments, onFiltered }: AppointmentFilterProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [specialtyFilter, setSpecialtyFilter] = useState('')

  const specialties = Array.from(
    new Set(appointments.map(a => a.specialty).filter(Boolean))
  ) as string[]

  const handleSearchChange = (term: string) => {
    setSearchTerm(term)
    filterAppointments(term, specialtyFilter)
  }

  const handleSpecialtyChange = (specialty: string) => {
    setSpecialtyFilter(specialty)
    filterAppointments(searchTerm, specialty)
  }

  const filterAppointments = (search: string, specialty: string) => {
    let filtered = appointments

    if (search) {
      const lowerSearch = search.toLowerCase()
      filtered = filtered.filter(
        (appointment) =>
          appointment.doctor_name.toLowerCase().includes(lowerSearch) ||
          appointment.specialty?.toLowerCase().includes(lowerSearch) ||
          appointment.notes?.toLowerCase().includes(lowerSearch)
      )
    }

    if (specialty) {
      filtered = filtered.filter((appointment) => appointment.specialty === specialty)
    }

    onFiltered(filtered)
  }

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search appointments..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        {specialties.length > 0 && (
          <div className="sm:w-48">
            <select
              value={specialtyFilter}
              onChange={(e) => handleSpecialtyChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Specialties</option>
              {specialties.map((specialty) => (
                <option key={specialty} value={specialty}>
                  {specialty}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  )
}















