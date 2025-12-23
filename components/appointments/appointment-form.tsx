'use client'

import { useState } from 'react'
import { Appointment } from '@/types/database'

interface AppointmentFormProps {
  appointment?: Appointment
  onSubmit: (data: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  onCancel: () => void
}

const APPOINTMENT_CATEGORIES = [
  {
    value: 'Primary Care',
    icon: '🩺',
    description: 'Standard visits to a General Practitioner (GP/Médico General), annual check-ups, and sick leave requests.'
  },
  {
    value: 'Specialist',
    icon: '👨‍⚕️',
    description: 'Consultations with a specific focus (e.g., Dermatologist, Cardiologist, Gastroenterologist, Gynecologist, Urologist).'
  },
  {
    value: 'Dental Care',
    icon: '🦷',
    description: 'Any visit to a dentist or orthodontist, including cleanings, fillings, root canals, and braces.'
  },
  {
    value: 'Mental Health',
    icon: '🧠',
    description: 'Sessions with a Psychologist or Psychiatrist, including therapy, counseling, and medication management.'
  },
  {
    value: 'Vision & Eye',
    icon: '👁️',
    description: 'Visits to an Ophthalmologist or Optometrist for eye exams, prescription checks, or eye health issues.'
  },
  {
    value: 'Procedures',
    icon: '🩹',
    description: 'Scheduled outpatient interventions like mole removal, stitches, colonoscopy, or minor surgeries.'
  },
  {
    value: 'Physical Therapy',
    icon: '🤸',
    description: 'Rehabilitation sessions, Kinesiology, or Physiotherapy (often a series of visits).'
  },
  {
    value: 'Urgent Care',
    icon: '🚑',
    description: 'Unplanned visits to the Emergency Room (Urgencias), ambulance services, or after-hours clinics.'
  }
]

export function AppointmentForm({ appointment, onSubmit, onCancel }: AppointmentFormProps) {
  const [formData, setFormData] = useState({
    date: appointment?.date ? new Date(appointment.date).toISOString().slice(0, 16) : '',
    doctor_name: appointment?.doctor_name || '',
    specialty: appointment?.specialty || '',
    medical_center: appointment?.medical_center || '',
    notes: appointment?.notes || '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await onSubmit({
        date: formData.date,
        doctor_name: formData.doctor_name,
        specialty: formData.specialty || null,
        medical_center: formData.medical_center || null,
        notes: formData.notes || null,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
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
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Date & Time *
        </label>
        <input
          type="datetime-local"
          id="date"
          required
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div>
        <label htmlFor="doctor_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Doctor Name *
        </label>
        <input
          type="text"
          id="doctor_name"
          required
          value={formData.doctor_name}
          onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div className="relative">
        <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Specialty
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-left flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              {formData.specialty ? (
                <>
                  <span>{APPOINTMENT_CATEGORIES.find(c => c.value === formData.specialty)?.icon || ''}</span>
                  <span>{formData.specialty}</span>
                </>
              ) : (
                <span className="text-gray-500 dark:text-gray-400">Select a category...</span>
              )}
            </span>
            <svg
              className={`w-5 h-5 transition-transform ${showDropdown ? 'transform rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-96 overflow-auto">
                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, specialty: '' })
                      setShowDropdown(false)
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <span className="text-gray-500 dark:text-gray-400">None</span>
                  </button>
                  {APPOINTMENT_CATEGORIES.map((category) => (
                    <button
                      key={category.value}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, specialty: category.value })
                        setShowDropdown(false)
                      }}
                      className={`w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 ${
                        formData.specialty === category.value ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <span className="text-lg">{category.icon}</span>
                      <span className="flex-1">
                        <span className="font-bold">{category.value}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
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

      <div>
        <label htmlFor="medical_center" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Medical Center / Clinic
        </label>
        <input
          type="text"
          id="medical_center"
          value={formData.medical_center}
          onChange={(e) => setFormData({ ...formData, medical_center: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="e.g., Mayo Clinic, Hospital Name"
        />
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
          placeholder="Additional notes about the appointment..."
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : appointment ? 'Update' : 'Create'}
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
