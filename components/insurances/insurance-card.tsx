'use client'

import { useState } from 'react'
import { Insurance } from '@/types/database'
import { getInsuranceLogo } from '@/lib/insurance-logos'

interface InsuranceCardProps {
  insurance: Insurance
  index: number
  onClick: () => void
}

export function InsuranceCard({ insurance, index, onClick }: InsuranceCardProps) {
  const logoUrl = insurance.logo_url || getInsuranceLogo(insurance.provider_name)
  const [logoError, setLogoError] = useState(false)
  
  // Calculate card offset and shadow depth for stacked effect
  const offsetY = index * 8
  const shadowDepth = index * 2 + 4

  return (
    <div
      className="relative cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
      style={{
        transform: `translateY(${offsetY}px)`,
        zIndex: 100 - index,
      }}
      onClick={onClick}
    >
      <div
        className="bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 rounded-2xl p-6 text-white relative overflow-hidden"
        style={{
          boxShadow: `0 ${shadowDepth}px ${shadowDepth * 2}px rgba(0, 0, 0, ${0.2 + index * 0.05})`,
        }}
      >
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full -ml-12 -mb-12"></div>
        </div>

        {/* Card content */}
        <div className="relative z-10 flex items-center justify-between">
          {/* Left side - Logo */}
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              {logoUrl && logoUrl !== '/icons/insurance-default.svg' && !logoError ? (
                <img
                  src={logoUrl}
                  alt={insurance.provider_name}
                  className="w-10 h-10 object-contain"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {insurance.provider_name}
              </h3>
              {insurance.insurance_type && (
                <p className="text-xs text-blue-200 mt-0.5">
                  {insurance.insurance_type}
                </p>
              )}
              <p className="text-sm text-blue-100 mt-1">
                Policy: {insurance.policy_id}
              </p>
              {insurance.price && insurance.currency && (
                <p className="text-sm text-blue-100 mt-1 font-medium">
                  {insurance.price.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {insurance.currency}
                </p>
              )}
            </div>
          </div>

          {/* Right side - View Coverage button */}
          <button
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
            onClick={(e) => {
              e.stopPropagation()
              onClick()
            }}
          >
            <span>View Coverage</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

