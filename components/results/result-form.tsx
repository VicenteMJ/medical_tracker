'use client'

import { useState, useEffect, useRef } from 'react'
import { Result, Appointment } from '@/types/database'
import { getAppointments } from '@/lib/appointments'
import { uploadResultPDF } from '@/lib/storage'
import { TEST_RESULT_CATEGORIES } from '@/lib/test-result-categories'

interface ResultFormProps {
  result?: Result
  onSubmit: (data: Omit<Result, 'id' | 'created_at'>) => Promise<void>
  onCancel: () => void
  defaultAppointmentId?: string
}

export function ResultForm({ result, onSubmit, onCancel, defaultAppointmentId }: ResultFormProps) {
  const [formData, setFormData] = useState({
    appointment_id: result?.appointment_id || defaultAppointmentId || '',
    test_name: result?.test_name || '',
    test_type: result?.test_type || '',
    value: result?.value || '',
    unit: result?.unit || '',
    reference_range: result?.reference_range || '',
    notes: result?.notes || '',
    file_url: result?.file_url || '',
  })
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingAppointments, setLoadingAppointments] = useState(true)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string>('')
  const [showTestTypeDropdown, setShowTestTypeDropdown] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function loadAppointments() {
      try {
        const data = await getAppointments()
        setAppointments(data)
      } catch (err) {
        console.error('Failed to load appointments:', err)
      } finally {
        setLoadingAppointments(false)
      }
    }
    loadAppointments()
  }, [])

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
      setFormData({ ...formData, file_url: '' })
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
      let fileUrl = formData.file_url || null

      // Upload file if one is selected
      if (selectedFile) {
        setUploading(true)
        setUploadProgress('Uploading PDF...')
        try {
          fileUrl = await uploadResultPDF(selectedFile)
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

      await onSubmit({
        appointment_id: formData.appointment_id || null,
        test_name: formData.test_name,
        test_type: formData.test_type || null,
        value: formData.value || null,
        unit: formData.unit || null,
        reference_range: formData.reference_range || null,
        notes: formData.notes || null,
        file_url: fileUrl,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
      setUploadProgress('')
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
        <label htmlFor="appointment_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Related Appointment (Optional)
        </label>
        <select
          id="appointment_id"
          value={formData.appointment_id}
          onChange={(e) => setFormData({ ...formData, appointment_id: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          disabled={loadingAppointments}
        >
          <option value="">None</option>
          {appointments.map((appointment) => (
            <option key={appointment.id} value={appointment.id}>
              {appointment.doctor_name} - {new Date(appointment.date).toLocaleDateString()}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="test_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Test Name *
        </label>
        <input
          type="text"
          id="test_name"
          required
          value={formData.test_name}
          onChange={(e) => setFormData({ ...formData, test_name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div className="relative">
        <label htmlFor="test_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Test Type
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowTestTypeDropdown(!showTestTypeDropdown)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-left flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              {formData.test_type ? (
                <>
                  <span className="text-lg">
                    {TEST_RESULT_CATEGORIES.find(c => c.value === formData.test_type)?.icon || ''}
                  </span>
                  <span className="font-semibold">{formData.test_type}</span>
                </>
              ) : (
                <span className="text-gray-500 dark:text-gray-400">Select a category...</span>
              )}
            </span>
            <svg
              className={`w-5 h-5 transition-transform ${showTestTypeDropdown ? 'transform rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showTestTypeDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowTestTypeDropdown(false)}
              />
              <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-96 overflow-auto">
                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, test_type: '' })
                      setShowTestTypeDropdown(false)
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <span className="text-gray-500 dark:text-gray-400">None</span>
                  </button>
                  {TEST_RESULT_CATEGORIES.map((category) => (
                    <button
                      key={category.value}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, test_type: category.value })
                        setShowTestTypeDropdown(false)
                      }}
                      className={`w-full px-3 py-2.5 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-start gap-3 ${
                        formData.test_type === category.value ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <span className="text-lg flex-shrink-0">{category.icon}</span>
                      <span className="flex-1 min-w-0">
                        <span className="font-bold block mb-0.5">{category.value}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                          ({category.description})
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="value" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Value
          </label>
          <input
            type="text"
            id="value"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label htmlFor="unit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Unit
          </label>
          <input
            type="text"
            id="unit"
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      <div>
        <label htmlFor="reference_range" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Reference Range
        </label>
        <input
          type="text"
          id="reference_range"
          value={formData.reference_range}
          onChange={(e) => setFormData({ ...formData, reference_range: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div>
        <label htmlFor="pdf_file" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Test Result PDF (Optional)
        </label>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              id="pdf_file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              disabled={uploading || isSubmitting}
              className="block w-full text-sm text-gray-500 dark:text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-900 dark:file:text-blue-200
                hover:file:bg-blue-100 dark:hover:file:bg-blue-800
                file:cursor-pointer
                disabled:opacity-50 disabled:cursor-not-allowed
                dark:bg-gray-700 dark:text-white"
            />
          </div>
          {selectedFile && (
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                disabled={uploading || isSubmitting}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 disabled:opacity-50"
                aria-label="Remove file"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          {uploadProgress && (
            <p className="text-sm text-blue-600 dark:text-blue-400">{uploadProgress}</p>
          )}
          {formData.file_url && !selectedFile && (
            <div className="mt-2 space-y-2">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {result ? 'Current file attached' : 'File URL provided'}
                  </span>
                </div>
                <a
                  href={formData.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                >
                  View →
                </a>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Upload a new file to replace the existing one, or enter a different URL:
              </p>
              <input
                type="url"
                id="file_url"
                value={formData.file_url}
                onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                placeholder="https://..."
                disabled={uploading || isSubmitting}
              />
            </div>
          )}
          {!formData.file_url && !selectedFile && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Upload a PDF file with your test results, or leave blank if you don't have a file.
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Notes
        </label>
        <textarea
          id="notes"
          rows={4}
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting || uploading}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : isSubmitting ? 'Saving...' : result ? 'Update' : 'Create'}
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


