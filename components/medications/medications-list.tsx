'use client'

import { useState, useEffect } from 'react'
import { Medication } from '@/types/database'
import { MedicationCard } from './medication-card'
import Link from 'next/link'

interface MedicationsListProps {
  initialMedications: Medication[]
}

export function MedicationsList({ initialMedications }: MedicationsListProps) {
  const [filteredMedications, setFilteredMedications] = useState<Medication[]>(initialMedications)

  useEffect(() => {
    setFilteredMedications(initialMedications)
  }, [initialMedications])

  if (initialMedications.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          No medications yet. Add your first medication to get started.
        </p>
        <Link
          href="/medications/new"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add Medication
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredMedications.map((medication) => (
        <MedicationCard key={medication.id} medication={medication} />
      ))}
    </div>
  )
}

