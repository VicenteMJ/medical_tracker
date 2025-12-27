'use client'

import { useState } from 'react'
import { Insurance } from '@/types/database'
import { InsuranceCard } from './insurance-card'
import { CoverageDrawer } from './coverage-drawer'
import Link from 'next/link'

interface InsurancesListProps {
  initialInsurances: Insurance[]
}

export function InsurancesList({ initialInsurances }: InsurancesListProps) {
  const [selectedInsurance, setSelectedInsurance] = useState<Insurance | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const handleCardClick = (insurance: Insurance) => {
    setSelectedInsurance(insurance)
    setIsDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false)
    // Small delay to allow animation to complete before clearing selection
    setTimeout(() => {
      setSelectedInsurance(null)
    }, 300)
  }

  if (initialInsurances.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          No insurance policies yet. Add your first insurance to get started.
        </p>
        <Link
          href="/insurances/new"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add Insurance
        </Link>
      </div>
    )
  }

  return (
    <>
      {/* Card Stack Container */}
      <div className="relative max-w-md mx-auto">
        <div className="space-y-0">
          {initialInsurances.map((insurance, index) => (
            <InsuranceCard
              key={insurance.id}
              insurance={insurance}
              index={index}
              onClick={() => handleCardClick(insurance)}
            />
          ))}
        </div>
      </div>

      {/* Coverage Drawer */}
      <CoverageDrawer
        insurance={selectedInsurance}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
      />
    </>
  )
}

