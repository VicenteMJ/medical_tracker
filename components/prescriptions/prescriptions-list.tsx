'use client'

import { useState, useMemo } from 'react'
import { Prescription } from '@/types/database'
import { PrescriptionCard } from './prescription-card'
import Link from 'next/link'

interface PrescriptionsListProps {
  initialPrescriptions: Prescription[]
}

const PRESCRIPTION_TYPE_LABELS = {
  A: 'Receta Simple',
  B: 'Receta Retenida',
  C: 'Receta Cheque',
  D: 'Receta Magistral',
}

function getExpirationStatus(expirationDate: string | null): 'valid' | 'expiring-soon' | 'expired' {
  if (!expirationDate) {
    return 'valid'
  }

  const expiration = new Date(expirationDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  expiration.setHours(0, 0, 0, 0)

  const daysUntilExpiration = Math.ceil((expiration.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (daysUntilExpiration < 0) {
    return 'expired'
  } else if (daysUntilExpiration <= 7) {
    return 'expiring-soon'
  } else {
    return 'valid'
  }
}

export function PrescriptionsList({ initialPrescriptions }: PrescriptionsListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [expirationFilter, setExpirationFilter] = useState<string>('')

  const filteredPrescriptions = useMemo(() => {
    let filtered = initialPrescriptions

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (prescription) =>
          prescription.name?.toLowerCase().includes(lowerSearch) ||
          prescription.notes?.toLowerCase().includes(lowerSearch) ||
          PRESCRIPTION_TYPE_LABELS[prescription.prescription_type].toLowerCase().includes(lowerSearch)
      )
    }

    if (typeFilter) {
      filtered = filtered.filter((prescription) => prescription.prescription_type === typeFilter)
    }

    if (expirationFilter) {
      filtered = filtered.filter((prescription) => {
        const status = getExpirationStatus(prescription.expiration_date)
        return status === expirationFilter
      })
    }

    return filtered
  }, [initialPrescriptions, searchTerm, typeFilter, expirationFilter])

  const prescriptionTypes = Array.from(new Set(initialPrescriptions.map(p => p.prescription_type)))

  if (initialPrescriptions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          No prescriptions yet. Add your first prescription to get started.
        </p>
        <Link
          href="/prescriptions/new"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add Prescription
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search prescriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          {prescriptionTypes.length > 0 && (
            <div className="sm:w-48">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Types</option>
                {prescriptionTypes.map((type) => (
                  <option key={type} value={type}>
                    Type {type}: {PRESCRIPTION_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="sm:w-48">
            <select
              value={expirationFilter}
              onChange={(e) => setExpirationFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Status</option>
              <option value="valid">Valid</option>
              <option value="expiring-soon">Expiring Soon</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
      </div>
      {filteredPrescriptions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            No prescriptions match your filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrescriptions.map((prescription) => (
            <PrescriptionCard key={prescription.id} prescription={prescription} />
          ))}
        </div>
      )}
    </>
  )
}
