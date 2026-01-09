'use client'

import { useState, useEffect } from 'react'
import { Insurance, InsuranceCoverage, InsuranceRawAnalysis } from '@/types/database'
import { updateInsurance, analyzeInsuranceCoverage, getInsuranceCoverages, getRawAnalysis, deleteInsurance } from '@/lib/insurances'
import { useRouter } from 'next/navigation'
import { getInsuranceLogo } from '@/lib/insurance-logos'

const INSURANCE_TYPES = [
  'Isapre',
  'Fonasa',
  'Seguro Complementario',
  'Seguro Dental',
  'Seguro de Vida',
  'Seguro de Accidentes',
  'Seguro Catastrófico',
  'Seguro Oncológico',
] as const

const COVERAGE_TYPES = [
  'Consultas médicas y exámenes',
  'Medicamentos',
  'Hospitalizaciones',
  'Dental',
  'Salud mental',
  'Vida',
  'Accidentes',
  'Visión',
] as const

const INSURANCE_PROVIDERS = [
  'Banmédica',
  'Colmena',
  'Consalud',
  'CruzBlanca',
  'Nueva Masvida',
  'Vida Tres',
  'Esencial',
  'Isalud',
  'Fundación',
  'Cruz del Norte',
  'MetLife',
  'Bice Vida',
  'Consorcio',
  'Chilena Consolidada',
  'Vida Cámara',
  'Bci Seguros',
  'Confuturo',
  'Alemana Seguros',
  'Seguros Falabella',
  'Seguros Ripley',
  'Banco de Chile / Santander',
  'Other',
] as const

interface CoverageDrawerProps {
  insurance: Insurance | null
  isOpen: boolean
  onClose: () => void
}

export function CoverageDrawer({ insurance, isOpen, onClose }: CoverageDrawerProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    insurance_type: '',
    provider_name: '',
    policy_id: '',
    price: '',
    currency: 'CLP',
    pdf_url: '',
  })
  const [showCustomProvider, setShowCustomProvider] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [normalizedCoverages, setNormalizedCoverages] = useState<InsuranceCoverage[]>([])
  const [rawAnalysis, setRawAnalysis] = useState<InsuranceRawAnalysis | null>(null)
  const [showRawAnalysis, setShowRawAnalysis] = useState(false)
  const [loadingCoverages, setLoadingCoverages] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Initialize form data when insurance changes
  useEffect(() => {
    if (insurance) {
      setFormData({
        insurance_type: insurance.insurance_type || '',
        provider_name: insurance.provider_name || '',
        policy_id: insurance.policy_id || '',
        coverage_types: insurance.coverage_types || [],
        price: insurance.price?.toString() || '',
        currency: insurance.currency || 'CLP',
        pdf_url: insurance.pdf_url || '',
      })
      setShowCustomProvider(insurance.provider_name ? !INSURANCE_PROVIDERS.includes(insurance.provider_name as any) : false)
      
      // Load normalized coverages and raw analysis
      loadCoverageData(insurance.id)
    }
    setIsEditing(false)
    setError(null)
    setShowDeleteConfirm(false)
  }, [insurance])

  // Load normalized coverages and raw analysis
  const loadCoverageData = async (insuranceId: string) => {
    setLoadingCoverages(true)
    try {
      const [coverages, raw] = await Promise.all([
        getInsuranceCoverages(insuranceId),
        getRawAnalysis(insuranceId),
      ])
      setNormalizedCoverages(coverages)
      setRawAnalysis(raw)
    } catch (err) {
      console.error('Failed to load coverage data:', err)
      // Don't show error to user, just log it
    } finally {
      setLoadingCoverages(false)
    }
  }

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (isEditing) {
          handleCancel()
        } else {
          onClose()
        }
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose, isEditing, insurance])

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!insurance) return null

  const handleProviderNameChange = (name: string) => {
    setFormData({
      ...formData,
      provider_name: name,
    })
  }

  const handleSave = async () => {
    if (!insurance) return

    setIsSaving(true)
    setError(null)

    // Validate required fields
    if (!formData.provider_name.trim()) {
      setError('Provider name is required')
      setIsSaving(false)
      return
    }

    if (!formData.policy_id.trim()) {
      setError('Policy ID is required')
      setIsSaving(false)
      return
    }

    try {
      const price = formData.price ? parseFloat(formData.price) : null

      await updateInsurance(insurance.id, {
        insurance_type: formData.insurance_type || null,
        provider_name: formData.provider_name.trim(),
        policy_id: formData.policy_id.trim(),
        coverage_types: (formData.coverage_types && formData.coverage_types.length > 0) ? formData.coverage_types : null,
        price: price,
        currency: formData.price ? formData.currency : null,
        pdf_url: formData.pdf_url.trim() || null,
        logo_url: formData.provider_name ? getInsuranceLogo(formData.provider_name) : null,
      })
      setIsEditing(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (insurance) {
      setFormData({
        insurance_type: insurance.insurance_type || '',
        provider_name: insurance.provider_name || '',
        policy_id: insurance.policy_id || '',
        price: insurance.price?.toString() || '',
        currency: insurance.currency || 'CLP',
        pdf_url: insurance.pdf_url || '',
      })
      setShowCustomProvider(insurance.provider_name ? !INSURANCE_PROVIDERS.includes(insurance.provider_name as any) : false)
    }
    setIsEditing(false)
    setError(null)
    setShowDeleteConfirm(false)
  }

  const handleAnalyzeCoverage = async () => {
    if (!insurance) return

    setIsAnalyzing(true)
    setError(null)

    try {
      await analyzeInsuranceCoverage(insurance.id)
      // Reload coverage data after analysis
      await loadCoverageData(insurance.id)
      router.refresh()
      // Small delay to allow refresh
      setTimeout(() => {
        setIsAnalyzing(false)
      }, 1000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze coverage'
      setError(errorMessage)
      setIsAnalyzing(false)
      
      // Show additional help for quota errors
      if (errorMessage.includes('quota') || errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
        console.error('Gemini API quota exceeded. Consider:', [
          '1. Checking your Google Cloud account billing',
          '2. Enabling Generative Language API in Google Cloud Console',
          '3. Manually editing coverage data using the Edit button'
        ])
      }
    }
  }

  const handleDelete = async () => {
    if (!insurance) return

    setIsDeleting(true)
    setError(null)
    try {
      await deleteInsurance(insurance.id)
      onClose()
      router.push('/insurances')
      router.refresh()
    } catch (error) {
      console.error('Delete insurance error:', error)
      setError(error instanceof Error ? error.message : 'Failed to delete insurance')
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const renderNormalizedCoverages = () => {
    if (loadingCoverages) {
      return (
        <div className="text-center py-8">
          <div className="flex items-center justify-center space-x-2">
            <svg className="animate-spin h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-gray-600 dark:text-gray-400">Loading coverage data...</span>
          </div>
        </div>
      )
    }

    if (normalizedCoverages.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            No normalized coverage data available yet.
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            {insurance.pdf_url 
              ? 'Click "Analyze Coverage" to extract coverage information from the PDF document.'
              : 'Upload a PDF document and analyze it to extract coverage information.'}
          </p>
          {/* Fallback to legacy coverage_data if available */}
          {insurance.coverage_data && renderLegacyCoverageData()}
        </div>
      )
    }

    // Group coverages by domain
    const coveragesByDomain = normalizedCoverages.reduce((acc, coverage) => {
      const domain = coverage.coverage_domain
      if (!acc[domain]) {
        acc[domain] = []
      }
      acc[domain].push(coverage)
      return acc
    }, {} as Record<string, InsuranceCoverage[]>)

    return (
      <div className="space-y-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Note:</strong> These are possible coverage matches based on AI analysis. Coverage is not guaranteed and may vary based on specific circumstances.
          </p>
        </div>
        {Object.entries(coveragesByDomain).map(([domain, coverages]) => (
          <div key={domain} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 capitalize text-lg">
              {domain}
            </h4>
            <div className="space-y-3">
              {coverages.map((coverage) => (
                <div key={coverage.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-medium text-gray-900 dark:text-white capitalize">
                      {coverage.service_type.replace(/_/g, ' ')}
                    </h5>
                    {coverage.confidence_score !== null && (
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Confidence:</span>
                        <div className="flex items-center space-x-0.5">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div
                              key={i}
                              className={`w-1.5 h-1.5 rounded-full ${
                                i <= (coverage.confidence_score || 0) * 5
                                  ? 'bg-green-500'
                                  : 'bg-gray-300 dark:bg-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {coverage.coverage_percent !== null && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Coverage: </span>
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          {coverage.coverage_percent}%
                        </span>
                      </div>
                    )}
                    {coverage.max_amount !== null && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Max Amount: </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {coverage.max_amount} {coverage.currency || 'CLP'}
                        </span>
                      </div>
                    )}
                    {coverage.copay_amount !== null && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Copay: </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {coverage.copay_amount}%
                        </span>
                      </div>
                    )}
                    {coverage.deductible_amount !== null && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Deductible: </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {coverage.deductible_amount} {coverage.currency || 'CLP'}
                        </span>
                      </div>
                    )}
                    {coverage.frequency_limit && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Frequency: </span>
                        <span className="font-medium text-gray-900 dark:text-white capitalize">
                          {coverage.frequency_limit}
                        </span>
                      </div>
                    )}
                    {coverage.waiting_period_days !== null && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Waiting Period: </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {coverage.waiting_period_days} days
                        </span>
                      </div>
                    )}
                    {coverage.specialty && (
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Specialty: </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {coverage.specialty}
                        </span>
                      </div>
                    )}
                    {coverage.is_emergency !== null && coverage.is_emergency && (
                      <div>
                        <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded">
                          Emergency Coverage
                        </span>
                      </div>
                    )}
                  </div>
                  {coverage.exclusions && (
                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-orange-600 dark:text-orange-400">
                        <strong>Exclusions:</strong> {coverage.exclusions}
                      </p>
                    </div>
                  )}
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Source: {coverage.source === 'ai' ? 'AI Analysis' : 'Manual Entry'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderLegacyCoverageData = () => {
    if (!insurance.coverage_data) return null

    return (
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Legacy coverage data:</p>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <pre className="text-sm text-gray-700 dark:text-gray-300 overflow-auto">
            {JSON.stringify(insurance.coverage_data, null, 2)}
          </pre>
        </div>
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {insurance.provider_name}
            </h2>
            {insurance.insurance_type && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {insurance.insurance_type}
              </p>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Policy: {insurance.policy_id}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <>
                {insurance.pdf_url && (
                  <button
                    onClick={handleAnalyzeCoverage}
                    disabled={isAnalyzing}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    aria-label={insurance.coverage_data ? "Re-analyze coverage" : "Analyze coverage"}
                  >
                    {isAnalyzing ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        <span>{insurance.coverage_data ? 'Re-analyze' : 'Analyze Coverage'}</span>
                      </>
                    )}
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setIsEditing(true)
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  aria-label="Edit coverage"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                  aria-label="Delete insurance"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Delete</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  aria-label="Save changes"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{isSaving ? 'Saving...' : 'Save'}</span>
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Cancel editing"
                >
                  Cancel
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {showDeleteConfirm && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-800 dark:text-red-200 mb-4 font-medium">
                  Are you sure you want to delete this insurance? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded">
                <p className="font-medium">{error}</p>
                {(error.includes('quota') || error.includes('429') || error.includes('exceeded') || error.includes('RESOURCE_EXHAUSTED')) && (
                  <div className="mt-2 text-sm">
                    <p className="mb-1 font-medium">You can:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Manually edit coverage data using the Edit button above</li>
                      <li>Check your Google Cloud account billing and add credits</li>
                      <li>Try again later when your quota resets</li>
                    </ul>
                  </div>
                )}
              </div>
            )}

            {isEditing ? (
              /* Edit Form */
              <div className="space-y-4">
                <div>
                  <label htmlFor="insurance_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Insurance Type
                  </label>
                  <select
                    id="insurance_type"
                    value={formData.insurance_type}
                    onChange={(e) => setFormData({ ...formData, insurance_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select insurance type</option>
                    {INSURANCE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="provider_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Insurance Provider *
                  </label>
                  {showCustomProvider || (formData.provider_name && !INSURANCE_PROVIDERS.includes(formData.provider_name as any)) ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        id="provider_name"
                        required
                        value={formData.provider_name}
                        onChange={(e) => handleProviderNameChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Enter provider name"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setShowCustomProvider(false)
                          setFormData({ ...formData, provider_name: '' })
                        }}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        ← Select from list
                      </button>
                    </div>
                  ) : (
                    <select
                      id="provider_name"
                      required
                      value={formData.provider_name}
                      onChange={(e) => {
                        if (e.target.value === 'Other') {
                          setShowCustomProvider(true)
                          setFormData({ ...formData, provider_name: '' })
                        } else {
                          handleProviderNameChange(e.target.value)
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Select provider</option>
                      {INSURANCE_PROVIDERS.map((provider) => (
                        <option key={provider} value={provider}>
                          {provider}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    What does it cover?
                  </label>
                  <div className="space-y-2 border border-gray-300 dark:border-gray-600 rounded-md p-3 bg-gray-50 dark:bg-gray-800">
                    {COVERAGE_TYPES.map((coverageType) => (
                      <label
                        key={coverageType}
                        className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={(formData.coverage_types || []).includes(coverageType)}
                          onChange={(e) => {
                            const currentTypes = formData.coverage_types || []
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                coverage_types: [...currentTypes, coverageType],
                              })
                            } else {
                              setFormData({
                                ...formData,
                                coverage_types: currentTypes.filter((ct) => ct !== coverageType),
                              })
                            }
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{coverageType}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="policy_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Policy ID *
                  </label>
                  <input
                    type="text"
                    id="policy_id"
                    required
                    value={formData.policy_id}
                    onChange={(e) => setFormData({ ...formData, policy_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter your policy number"
                  />
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Price (Optional)
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Leave blank if insurance is paid by your company
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="number"
                      id="price"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="col-span-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="0.00"
                    />
                    <select
                      id="currency"
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      disabled={!formData.price}
                    >
                      <option value="CLP">CLP</option>
                      <option value="UF">UF</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="pdf_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    PDF URL (Optional)
                  </label>
                  <input
                    type="url"
                    id="pdf_url"
                    value={formData.pdf_url}
                    onChange={(e) => setFormData({ ...formData, pdf_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="https://..."
                  />
                </div>
              </div>
            ) : (
              /* View Mode */
              <>
                {/* Coverage Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Coverage Details
                  </h3>
                  {renderNormalizedCoverages()}
                </div>

                {/* Raw Analysis Section */}
                {rawAnalysis && (
                  <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
                    <button
                      onClick={() => setShowRawAnalysis(!showRawAnalysis)}
                      className="flex items-center justify-between w-full text-left mb-2"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Raw AI Analysis
                      </h3>
                      <svg
                        className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${
                          showRawAnalysis ? 'transform rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {rawAnalysis.model_version && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        Model: {rawAnalysis.model_version} • Extracted: {new Date(rawAnalysis.extracted_at).toLocaleDateString()}
                      </p>
                    )}
                    {showRawAnalysis && (
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mt-2">
                        <pre className="text-sm text-gray-700 dark:text-gray-300 overflow-auto max-h-96">
                          {JSON.stringify(rawAnalysis.raw_json, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}

                {/* PDF Link */}
                {insurance.pdf_url && (
                  <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Policy Document
                    </h3>
                    <a
                      href={insurance.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span>View PDF Document</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

