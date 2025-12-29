'use client'

import { useState, useRef } from 'react'
import { Insurance } from '@/types/database'
import { uploadInsurancePDF } from '@/lib/storage'
import { getInsuranceLogo } from '@/lib/insurance-logos'
import { analyzeInsuranceCoverage } from '@/lib/insurances'
import { useRouter } from 'next/navigation'

interface InsuranceFormProps {
  insurance?: Insurance
  onSubmit: (data: Omit<Insurance, 'id' | 'created_at' | 'updated_at'>) => Promise<Insurance | void>
  onCancel: () => void
}

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

export function InsuranceForm({ insurance, onSubmit, onCancel }: InsuranceFormProps) {
  const [formData, setFormData] = useState({
    provider_name: insurance?.provider_name || '',
    policy_id: insurance?.policy_id || '',
    insurance_type: insurance?.insurance_type || '',
    price: insurance?.price?.toString() || '',
    currency: insurance?.currency || 'CLP',
    logo_url: insurance?.logo_url || '',
    pdf_url: insurance?.pdf_url || '',
    coverage_data: insurance?.coverage_data || null,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string>('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showCustomProvider, setShowCustomProvider] = useState(
    insurance?.provider_name ? !INSURANCE_PROVIDERS.includes(insurance.provider_name as any) : false
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto-detect logo when provider name changes
  const handleProviderNameChange = (name: string) => {
    setFormData({
      ...formData,
      provider_name: name,
      logo_url: name ? getInsuranceLogo(name) : '',
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (file.type !== 'application/pdf') {
        setError('Please select a PDF file')
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        return
      }
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB')
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        return
      }
      setSelectedFile(file)
      setError(null)
      // Clear manual URL input when file is selected
      setFormData({ ...formData, pdf_url: '' })
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      let pdfUrl = formData.pdf_url || null

      // Upload file if one is selected
      if (selectedFile) {
        setUploading(true)
        setUploadProgress('Uploading PDF...')
        try {
          pdfUrl = await uploadInsurancePDF(selectedFile, insurance?.id)
          setUploadProgress('Upload complete!')
        } catch (uploadError) {
          setError(uploadError instanceof Error ? uploadError.message : 'Failed to upload file')
          setIsSubmitting(false)
          setUploading(false)
          return
        } finally {
          setUploading(false)
        }
      }

      // Validate required fields
      if (!formData.provider_name.trim()) {
        setError('Provider name is required')
        setIsSubmitting(false)
        return
      }

      if (!formData.policy_id.trim()) {
        setError('Policy ID is required')
        setIsSubmitting(false)
        return
      }

      const price = formData.price ? parseFloat(formData.price) : null

      const result = await onSubmit({
        provider_name: formData.provider_name.trim(),
        policy_id: formData.policy_id.trim(),
        insurance_type: formData.insurance_type || null,
        price: price,
        currency: formData.price ? formData.currency : null,
        logo_url: formData.logo_url || null,
        pdf_url: pdfUrl,
        coverage_data: formData.coverage_data,
      })

      // Auto-trigger analysis if PDF was uploaded and no coverage data exists
      // Only for new insurance (when result is returned)
      if (pdfUrl && !formData.coverage_data && result && 'id' in result) {
        setIsAnalyzing(true)
        setUploadProgress('Analyzing coverage...')
        try {
          await analyzeInsuranceCoverage(result.id)
          setUploadProgress('Analysis complete!')
          router.refresh()
        } catch (analysisError) {
          // Don't fail the form submission if analysis fails
          console.error('Analysis failed:', analysisError)
          // Show a non-blocking message
          setUploadProgress('Upload complete. Analysis can be run manually.')
        } finally {
          setIsAnalyzing(false)
          setTimeout(() => {
            setUploadProgress('')
            // Navigate after a short delay to show completion message
            if (!insurance) {
              router.push('/insurances')
              router.refresh()
            }
          }, 2000)
        }
      } else if (!insurance && !result) {
        // If no PDF or no result returned, navigate immediately
        router.push('/insurances')
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
      if (!isAnalyzing) {
        setUploadProgress('')
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="insurance_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Insurance Type *
        </label>
        <select
          id="insurance_type"
          required
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
                setFormData({ ...formData, provider_name: '', logo_url: '' })
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
                setFormData({ ...formData, provider_name: '', logo_url: '' })
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
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Logo will be auto-detected based on provider name
        </p>
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
        <label htmlFor="pdf" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Policy PDF (Optional)
        </label>
        
        {insurance?.pdf_url && !selectedFile && (
          <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Current file:</p>
                <a
                  href={insurance.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {insurance.pdf_url.split('/').pop() || 'View PDF'}
                </a>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Upload a new file to replace the existing one, or enter a different URL:
            </p>
          </div>
        )}

        {selectedFile && (
          <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Selected: {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="text-sm text-red-600 dark:text-red-400 hover:underline"
                disabled={uploading || isSubmitting}
              >
                Remove
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            id="pdf"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/20 dark:file:text-blue-300"
            disabled={uploading || isSubmitting}
          />
          {uploadProgress && (
            <div className="flex items-center space-x-2">
              {(isAnalyzing || uploading) && (
                <svg className="animate-spin h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              <p className="text-sm text-blue-600 dark:text-blue-400">{uploadProgress}</p>
            </div>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Upload a PDF file with your insurance policy information, or leave blank if you don't have a file.
            {!insurance && ' Coverage will be analyzed automatically after upload.'}
          </p>
        </div>

        <div className="mt-3">
          <label htmlFor="pdf_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Or enter PDF URL manually (Optional)
          </label>
          <input
            type="url"
            id="pdf_url"
            value={formData.pdf_url}
            onChange={(e) => {
              setFormData({ ...formData, pdf_url: e.target.value })
              if (e.target.value && selectedFile) {
                setSelectedFile(null)
                if (fileInputRef.current) {
                  fileInputRef.current.value = ''
                }
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="https://..."
            disabled={uploading || isSubmitting || !!selectedFile}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting || uploading}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : isSubmitting ? 'Saving...' : insurance ? 'Update' : 'Create'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

