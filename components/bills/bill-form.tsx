'use client'

import { useState, useEffect, useRef } from 'react'
import { Bill, Appointment, Result } from '@/types/database'
import { getAppointments } from '@/lib/appointments'
import { getResults } from '@/lib/results'
import { uploadBillPDF } from '@/lib/storage'

interface BillFormProps {
  bill?: Bill
  onSubmit: (data: Omit<Bill, 'id' | 'created_at'>) => Promise<void>
  onCancel: () => void
  defaultAppointmentId?: string
  defaultResultId?: string
}

export function BillForm({ bill, onSubmit, onCancel, defaultAppointmentId, defaultResultId }: BillFormProps) {
  const [formData, setFormData] = useState({
    appointment_id: bill?.appointment_id || defaultAppointmentId || '',
    result_id: bill?.result_id || defaultResultId || '',
    amount: bill?.amount.toString() || '',
    insurance_coverage: bill?.insurance_coverage?.toString() || '',
    currency: bill?.currency || 'USD',
    payment_date: bill?.payment_date ? new Date(bill.payment_date).toISOString().slice(0, 16) : '',
    payment_method: bill?.payment_method || '',
    receipt_url: bill?.receipt_url || '',
    notes: bill?.notes || '',
  })
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [results, setResults] = useState<Result[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingAppointments, setLoadingAppointments] = useState(true)
  const [loadingResults, setLoadingResults] = useState(true)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const [appointmentsData, resultsData] = await Promise.all([
          getAppointments(),
          getResults(),
        ])
        setAppointments(appointmentsData)
        setResults(resultsData)
      } catch (err) {
        console.error('Failed to load data:', err)
      } finally {
        setLoadingAppointments(false)
        setLoadingResults(false)
      }
    }
    loadData()
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
      setFormData({ ...formData, receipt_url: '' })
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
      let receiptUrl = formData.receipt_url || null

      // Upload file if one is selected
      if (selectedFile) {
        setUploading(true)
        setUploadProgress('Uploading PDF...')
        try {
          receiptUrl = await uploadBillPDF(selectedFile, bill?.id)
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

      const amount = parseFloat(formData.amount)
      const insuranceCoverage = formData.insurance_coverage ? parseFloat(formData.insurance_coverage) : null

      // Validate that insurance coverage doesn't exceed amount
      if (insuranceCoverage !== null && insuranceCoverage > amount) {
        setError('Insurance coverage cannot exceed the full amount')
        setIsSubmitting(false)
        return
      }

      await onSubmit({
        appointment_id: formData.appointment_id || null,
        result_id: formData.result_id || null,
        amount: amount,
        insurance_coverage: insuranceCoverage,
        currency: formData.currency,
        payment_date: formData.payment_date ? formData.payment_date : null,
        payment_method: formData.payment_method || null,
        receipt_url: receiptUrl,
        notes: formData.notes || null,
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
          onChange={(e) => {
            const newAppointmentId = e.target.value
            setFormData({ 
              ...formData, 
              appointment_id: newAppointmentId,
              result_id: newAppointmentId ? '' : formData.result_id // Clear result if appointment is selected
            })
          }}
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
        <label htmlFor="result_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Related Test Result (Optional)
        </label>
        <select
          id="result_id"
          value={formData.result_id}
          onChange={(e) => {
            const newResultId = e.target.value
            setFormData({ 
              ...formData, 
              result_id: newResultId,
              appointment_id: newResultId ? '' : formData.appointment_id // Clear appointment if result is selected
            })
          }}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          disabled={loadingResults}
        >
          <option value="">None</option>
          {results.map((result) => (
            <option key={result.id} value={result.id}>
              {result.test_name} {result.test_type && `- ${result.test_type}`} {result.created_at && `(${new Date(result.created_at).toLocaleDateString()})`}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Note: A bill can be associated with either an appointment or a test result, not both.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Full Amount *
          </label>
          <input
            type="number"
            id="amount"
            step="0.01"
            required
            min="0"
            value={formData.amount}
            onChange={(e) => {
              const newAmount = e.target.value
              setFormData({ ...formData, amount: newAmount })
              // If insurance coverage exceeds new amount, clear it
              if (formData.insurance_coverage && parseFloat(formData.insurance_coverage) > parseFloat(newAmount || '0')) {
                setFormData({ ...formData, amount: newAmount, insurance_coverage: '' })
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label htmlFor="currency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Currency *
          </label>
          <select
            id="currency"
            required
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="CLP">CLP</option>
            <option value="MXN">MXN</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="insurance_coverage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Insurance Coverage (Optional)
        </label>
        <input
          type="number"
          id="insurance_coverage"
          step="0.01"
          min="0"
          max={formData.amount || undefined}
          value={formData.insurance_coverage}
          onChange={(e) => {
            const value = e.target.value
            const amountValue = parseFloat(formData.amount || '0')
            const coverageValue = parseFloat(value || '0')
            
            if (value && coverageValue > amountValue) {
              setError(`Insurance coverage cannot exceed the full amount (${formData.currency} ${amountValue.toFixed(2)})`)
            } else {
              setError(null)
            }
            
            setFormData({ ...formData, insurance_coverage: value })
          }}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="0.00"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          How much of this bill is covered by your medical insurance.
          {formData.amount && formData.insurance_coverage && (
            <span className="block mt-1">
              You will pay: {formData.currency} {(parseFloat(formData.amount) - parseFloat(formData.insurance_coverage || '0')).toFixed(2)}
            </span>
          )}
        </p>
      </div>

      <div>
        <label htmlFor="payment_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Payment Date
        </label>
        <input
          type="datetime-local"
          id="payment_date"
          value={formData.payment_date}
          onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div>
        <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Payment Method
        </label>
        <select
          id="payment_method"
          value={formData.payment_method}
          onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="">Select method</option>
          <option value="Cash">Cash</option>
          <option value="Credit Card">Credit Card</option>
          <option value="Debit Card">Debit Card</option>
          <option value="Bank Transfer">Bank Transfer</option>
          <option value="Insurance">Insurance</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <label htmlFor="receipt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Bill PDF (Optional)
        </label>
        
        {bill?.receipt_url && !selectedFile && (
          <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Current file:</p>
                <a
                  href={bill.receipt_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {bill.receipt_url.split('/').pop() || 'View PDF'}
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
            id="receipt"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/20 dark:file:text-blue-300"
            disabled={uploading || isSubmitting}
          />
          {uploadProgress && (
            <p className="text-sm text-blue-600 dark:text-blue-400">{uploadProgress}</p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Upload a PDF file with your bill information, or leave blank if you don't have a file.
          </p>
        </div>

        <div className="mt-3">
          <label htmlFor="receipt_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Or enter receipt URL manually (Optional)
          </label>
          <input
            type="url"
            id="receipt_url"
            value={formData.receipt_url}
            onChange={(e) => {
              setFormData({ ...formData, receipt_url: e.target.value })
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
          {uploading ? 'Uploading...' : isSubmitting ? 'Saving...' : bill ? 'Update' : 'Create'}
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


