'use client'

import { useState, useEffect, useRef } from 'react'
import { Prescription, Appointment } from '@/types/database'
import { getAppointments } from '@/lib/appointments'
import { uploadPrescriptionFile } from '@/lib/storage'

interface PrescriptionFormProps {
  prescription?: Prescription
  onSubmit: (data: Omit<Prescription, 'id' | 'created_at' | 'updated_at'>) => Promise<Prescription | void>
  onCancel: () => void
  defaultAppointmentId?: string
}

const PRESCRIPTION_TYPES = [
  { value: 'A', label: 'Type A: Receta Simple', description: 'Antibiotics, cholesterol, blood pressure meds. 30 days default, 6 months if chronic use.' },
  { value: 'B', label: 'Type B: Receta Retenida', description: 'Psychotropics, corticosteroids. Strictly 30 days. Pharmacy retains it.' },
  { value: 'C', label: 'Type C: Receta Cheque', description: 'Strong painkillers, stimulants. Extremely strict handling.' },
  { value: 'D', label: 'Type D: Receta Magistral', description: 'Custom prepared formulas.' },
]

export function PrescriptionForm({ prescription, onSubmit, onCancel, defaultAppointmentId }: PrescriptionFormProps) {
  const [formData, setFormData] = useState({
    name: prescription?.name || '',
    appointment_id: prescription?.appointment_id || defaultAppointmentId || '',
    prescription_type: prescription?.prescription_type || ('A' as 'A' | 'B' | 'C' | 'D'),
    issue_date: prescription?.issue_date ? new Date(prescription.issue_date).toISOString().split('T')[0] : '',
    is_chronic_use: prescription?.is_chronic_use || false,
    file_url: prescription?.file_url || '',
    notes: prescription?.notes || '',
  })
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingAppointments, setLoadingAppointments] = useState(true)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string>('')
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

  // Update issue_date when appointment is selected
  useEffect(() => {
    if (formData.appointment_id && !prescription?.issue_date) {
      const selectedAppointment = appointments.find(a => a.id === formData.appointment_id)
      if (selectedAppointment) {
        const appointmentDate = new Date(selectedAppointment.date).toISOString().split('T')[0]
        setFormData(prev => ({ ...prev, issue_date: appointmentDate }))
      }
    }
  }, [formData.appointment_id, appointments, prescription?.issue_date])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a PDF, JPG, JPEG, or PNG file')
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
      // Validate required fields
      if (!formData.appointment_id) {
        setError('Please select an appointment')
        setIsSubmitting(false)
        return
      }

      if (!formData.issue_date) {
        setError('Issue date is required')
        setIsSubmitting(false)
        return
      }

      let fileUrl = formData.file_url || null

      // Upload file if one is selected
      if (selectedFile) {
        setUploading(true)
        setUploadProgress('Uploading file...')
        try {
          fileUrl = await uploadPrescriptionFile(selectedFile, prescription?.id)
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

      // Create or update the prescription
      const prescriptionData = {
        name: formData.name || null,
        appointment_id: formData.appointment_id || null,
        prescription_type: formData.prescription_type,
        issue_date: formData.issue_date,
        is_chronic_use: formData.prescription_type === 'A' ? formData.is_chronic_use : false,
        file_url: fileUrl,
        notes: formData.notes || null,
        expiration_date: null, // Will be calculated by the library function
        is_archived: prescription?.is_archived || false,
      }

      await onSubmit(prescriptionData)
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
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Name for this prescription?
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="e.g., Antibiotics for infection"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Give this prescription a descriptive name to easily identify it.
        </p>
      </div>

      <div>
        <label htmlFor="appointment_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Related Appointment *
        </label>
        <select
          id="appointment_id"
          required
          value={formData.appointment_id}
          onChange={(e) => {
            const newAppointmentId = e.target.value
            setFormData({ ...formData, appointment_id: newAppointmentId })
          }}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          disabled={loadingAppointments}
        >
          <option value="">Select an appointment</option>
          {appointments.map((appointment) => (
            <option key={appointment.id} value={appointment.id}>
              {appointment.doctor_name} - {new Date(appointment.date).toLocaleDateString()}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Prescription Type *
        </label>
        <div className="space-y-2">
          {PRESCRIPTION_TYPES.map((type) => (
            <label
              key={type.value}
              className={`flex items-start p-3 border-2 rounded-lg cursor-pointer transition-all ${
                formData.prescription_type === type.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <input
                type="radio"
                name="prescription_type"
                value={type.value}
                checked={formData.prescription_type === type.value}
                onChange={(e) => {
                  const newType = e.target.value as 'A' | 'B' | 'C' | 'D'
                  setFormData({
                    ...formData,
                    prescription_type: newType,
                    is_chronic_use: newType !== 'A' ? false : formData.is_chronic_use,
                  })
                }}
                className="mt-1 mr-3"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-white">{type.label}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{type.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="issue_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Issue Date (Fecha de Emisión) *
        </label>
        <input
          type="date"
          id="issue_date"
          required
          value={formData.issue_date}
          onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Defaults to appointment date, but you can change it if needed.
        </p>
      </div>

      {formData.prescription_type === 'A' && (
        <div>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_chronic_use}
              onChange={(e) => setFormData({ ...formData, is_chronic_use: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                🔄 Is this for Chronic Use? (Uso Permanente)
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                If enabled, extends expiration to 6 months from issue date
              </p>
            </div>
          </label>
        </div>
      )}

      <div>
        <label htmlFor="file" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Prescription PDF or Photo (Optional)
        </label>
        
        {prescription?.file_url && !selectedFile && (
          <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Current file:</p>
                <a
                  href={prescription.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {prescription.file_url.split('/').pop() || 'View File'}
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
            id="file"
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/jpg,image/png"
            onChange={handleFileChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/20 dark:file:text-blue-300"
            disabled={uploading || isSubmitting}
          />
          {uploadProgress && (
            <p className="text-sm text-blue-600 dark:text-blue-400">{uploadProgress}</p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Upload a PDF or image file (JPG, JPEG, PNG) with your prescription, or leave blank if you don't have a file.
          </p>
        </div>

        <div className="mt-3">
          <label htmlFor="file_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Or enter file URL manually (Optional)
          </label>
          <input
            type="url"
            id="file_url"
            value={formData.file_url}
            onChange={(e) => {
              setFormData({ ...formData, file_url: e.target.value })
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
          {uploading ? 'Uploading...' : isSubmitting ? 'Saving...' : prescription ? 'Update' : 'Create'}
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
