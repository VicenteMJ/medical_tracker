'use client'

import { useState, useEffect } from 'react'
import { CoverageMatch } from '@/lib/coverage-types'
import { getEligibleCoverages } from '@/lib/coverage-eligibility'

interface CoverageSuggestionsProps {
  serviceType?: string
  specialty?: string | null
  providerType?: string | null
  isEmergency?: boolean
  date?: Date
}

export function CoverageSuggestions({
  serviceType,
  specialty,
  providerType,
  isEmergency,
  date,
}: CoverageSuggestionsProps) {
  const [matches, setMatches] = useState<CoverageMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCoverages() {
      setLoading(true)
      setError(null)
      try {
        const results = await getEligibleCoverages({
          serviceType,
          specialty: specialty || undefined,
          providerType: providerType || undefined,
          isEmergency,
          date,
        })
        setMatches(results)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load coverage suggestions')
        console.error('Error fetching coverage suggestions:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCoverages()
  }, [serviceType, specialty, providerType, isEmergency, date])

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex items-center space-x-2">
          <svg className="animate-spin h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-gray-600 dark:text-gray-400">Checking coverage eligibility...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <p className="text-yellow-800 dark:text-yellow-200 text-sm">
          Unable to check coverage eligibility: {error}
        </p>
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          No potential coverage matches found for this service.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Possible Coverage
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {matches.length} {matches.length === 1 ? 'match' : 'matches'}
        </span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        These are potential coverage matches based on your active insurance policies. Coverage is not guaranteed.
      </p>
      <div className="space-y-3">
        {matches.map((match) => (
          <div
            key={match.coverage.id}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {match.insurance.provider_name}
                  </h4>
                  {match.insurance.insurance_type && (
                    <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded">
                      {match.insurance.insurance_type}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Policy: {match.insurance.policy_id}
                </p>
                {match.coverage.coverage_percent !== null && (
                  <div className="flex items-center space-x-4 mb-2">
                    <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                      {match.coverage.coverage_percent}% coverage
                    </span>
                    {match.coverage.confidence_score !== null && (
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Confidence:</span>
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full ${
                                i <= (match.coverage.confidence_score || 0) * 5
                                  ? 'bg-green-500'
                                  : 'bg-gray-300 dark:bg-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {match.coverage.max_amount !== null && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Max: {match.coverage.max_amount} {match.coverage.currency || 'CLP'}
                    {match.coverage.frequency_limit && ` per ${match.coverage.frequency_limit}`}
                  </p>
                )}
                {match.coverage.copay_amount !== null && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Copay: {match.coverage.copay_amount}%
                  </p>
                )}
                {match.coverage.deductible_amount !== null && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Deductible: {match.coverage.deductible_amount} {match.coverage.currency || 'CLP'}
                  </p>
                )}
                {match.coverage.exclusions && (
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                    Exclusions: {match.coverage.exclusions}
                  </p>
                )}
                {match.matchReasons.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {match.matchReasons.map((reason, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                      >
                        {reason}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


