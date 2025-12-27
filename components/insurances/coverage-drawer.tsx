'use client'

import { useState, useEffect } from 'react'
import { Insurance } from '@/types/database'
import { updateInsurance } from '@/lib/insurances'
import { useRouter } from 'next/navigation'
import { getInsuranceLogo } from '@/lib/insurance-logos'

const INSURANCE_TYPES = [
  'Fonasa',
  'Isapre',
  'Complementario',
  'Dental',
  'Oncológico',
  'Accidentes personales',
  'Catastrófico',
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
  const [error, setError] = useState<string | null>(null)

  // Initialize form data when insurance changes
  useEffect(() => {
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
  }, [insurance])

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
  }

  const renderCoverageData = () => {
    if (!insurance.coverage_data) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            No coverage data available yet.
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            Coverage information will be extracted from the PDF document.
          </p>
        </div>
      )
    }

    // If coverage_data is an object, render it as a table
    if (typeof insurance.coverage_data === 'object' && !Array.isArray(insurance.coverage_data)) {
      const entries = Object.entries(insurance.coverage_data)
      
      if (entries.length === 0) {
        return (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              Coverage data is empty.
            </p>
          </div>
        )
      }

      return (
        <div className="space-y-4">
          {entries.map(([key, value]) => (
            <div key={key} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 capitalize">
                {key.replace(/_/g, ' ')}
              </h4>
              {typeof value === 'object' && value !== null ? (
                <div className="ml-4 space-y-2">
                  {Object.entries(value as Record<string, any>).map(([subKey, subValue]) => (
                    <div key={subKey} className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400 capitalize">
                        {subKey.replace(/_/g, ' ')}:
                      </span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {String(subValue)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-700 dark:text-gray-300">
                  {String(value)}
                </p>
              )}
            </div>
          ))}
        </div>
      )
    }

    // If it's an array or other format, render as JSON
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <pre className="text-sm text-gray-700 dark:text-gray-300 overflow-auto">
          {JSON.stringify(insurance.coverage_data, null, 2)}
        </pre>
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
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                aria-label="Edit coverage"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Edit</span>
              </button>
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
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded">
                {error}
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
                  {renderCoverageData()}
                </div>

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

