'use client'

import { useState } from 'react'
import { Medication } from '@/types/database'

interface MedicationFormData {
  name: string
  type: string
  strength: string
  unit: string
  frequency: string
  scheduleTimes: Array<{ time: string; dosage: string }>
  startDate: string
  endDate: string
  displayName: string
  notes: string
}

interface MedicationFormWidgetProps {
  medication?: Medication
  onSubmit: (data: Omit<Medication, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  onCancel: () => void
}

const MEDICATION_TYPES = [
  { value: 'Capsule', label: 'Capsule' },
  { value: 'Tablet', label: 'Tablet' },
  { value: 'Liquid', label: 'Liquid' },
  { value: 'Topical', label: 'Topical' },
  { value: 'Cream', label: 'Cream' },
  { value: 'Device', label: 'Device' },
  { value: 'Drops', label: 'Drops' },
  { value: 'Injection', label: 'Injection' },
  { value: 'Patch', label: 'Patch' },
  { value: 'Spray', label: 'Spray' },
]

const COMMON_TYPES = ['Capsule', 'Tablet', 'Liquid', 'Topical']

const UNITS = ['mg', 'mcg', 'g', 'mL', '%']

const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Every Day' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'as_needed', label: 'As Needed' },
  { value: 'custom', label: 'Custom' },
]

export function MedicationFormWidget({ medication, onSubmit, onCancel }: MedicationFormWidgetProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<MedicationFormData>({
    name: medication?.name || '',
    type: medication?.type || '',
    strength: medication?.strength?.toString() || '',
    unit: medication?.unit || '',
    frequency: medication?.frequency || 'daily',
    scheduleTimes: medication?.schedule_times || [],
    startDate: medication?.start_date ? new Date(medication.start_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    endDate: medication?.end_date ? new Date(medication.end_date).toISOString().split('T')[0] : '',
    displayName: medication?.display_name || '',
    notes: medication?.notes || '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setError(null)
    setIsSubmitting(true)

    try {
      await onSubmit({
        name: formData.name,
        type: formData.type,
        strength: formData.strength ? parseFloat(formData.strength) : null,
        unit: formData.unit || null,
        display_name: formData.displayName || null,
        notes: formData.notes || null,
        frequency: formData.frequency,
        schedule_times: formData.scheduleTimes.length > 0 ? formData.scheduleTimes : null,
        start_date: formData.startDate,
        end_date: formData.endDate || null,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setIsSubmitting(false)
    }
  }

  const addScheduleTime = () => {
    setFormData({
      ...formData,
      scheduleTimes: [...formData.scheduleTimes, { time: '14:00', dosage: '1' }],
    })
  }

  const removeScheduleTime = (index: number) => {
    setFormData({
      ...formData,
      scheduleTimes: formData.scheduleTimes.filter((_, i) => i !== index),
    })
  }

  const updateScheduleTime = (index: number, field: 'time' | 'dosage', value: string) => {
    const updated = [...formData.scheduleTimes]
    updated[index] = { ...updated[index], [field]: value }
    setFormData({ ...formData, scheduleTimes: updated })
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim() !== ''
      case 2:
        return formData.type !== ''
      case 3:
        return true // Can skip strength
      case 4:
        return true // Can proceed with or without schedule
      case 5:
        return true
      default:
        return false
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'None'
    const date = new Date(dateString)
    const today = new Date()
    const isToday = date.toDateString() === today.toDateString()
    
    if (isToday) {
      return `${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} (Today)`
    }
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }

  const formatTime = (time24: string) => {
    const [hours, minutes] = time24.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          {currentStep > 1 ? (
            <button
              onClick={handleBack}
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          ) : (
            <div className="w-8" />
          )}
          
          <div className="flex-1 text-center">
            {currentStep === 1 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Medication Name</h2>
              </div>
            )}
            {currentStep === 2 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{formData.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{formData.type || 'Select type'}</p>
              </div>
            )}
            {currentStep === 3 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{formData.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{formData.type}</p>
              </div>
            )}
            {currentStep === 4 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{formData.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{formData.type}</p>
              </div>
            )}
            {currentStep === 5 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Review Details</h2>
              </div>
            )}
          </div>

          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Step 1: Medication Name */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="flex gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full"></div>
                  <div className="w-8 h-8 bg-yellow-100 rounded-full"></div>
                  <div className="w-8 h-8 bg-blue-100 rounded-full"></div>
                  <div className="w-8 h-8 bg-green-100 rounded-full"></div>
                  <div className="w-8 h-8 bg-pink-100 rounded-full"></div>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center">Medication Name</h1>
              <div>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ibuprofeno"
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Step 2: Medication Type */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="flex gap-2">
                  <div className="w-6 h-6 border-2 border-blue-500 rounded"></div>
                  <div className="w-6 h-6 border-2 border-green-500 rounded-full"></div>
                  <div className="w-6 h-6 border-2 border-pink-500"></div>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center">Choose the Medication Type</h1>
              
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Common Forms</h3>
                  <div className="space-y-2">
                    {MEDICATION_TYPES.filter(t => COMMON_TYPES.includes(t.value)).map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, type: type.value })}
                        className={`w-full px-4 py-3 rounded-xl text-left transition-colors ${
                          formData.type === type.value
                            ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500'
                            : 'bg-gray-50 dark:bg-gray-800 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <span className="font-medium text-gray-900 dark:text-white">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">More Forms</h3>
                  <div className="space-y-2">
                    {MEDICATION_TYPES.filter(t => !COMMON_TYPES.includes(t.value)).map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, type: type.value })}
                        className={`w-full px-4 py-3 rounded-xl text-left transition-colors ${
                          formData.type === type.value
                            ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500'
                            : 'bg-gray-50 dark:bg-gray-800 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <span className="font-medium text-gray-900 dark:text-white">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Medication Strength */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add the Medication Strength</h1>
              
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Strength</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.strength}
                  onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                  placeholder="Add Strength"
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Choose Unit</label>
                <div className="space-y-2">
                  {UNITS.map((unit) => (
                    <button
                      key={unit}
                      type="button"
                      onClick={() => setFormData({ ...formData, unit })}
                      className={`w-full px-4 py-3 rounded-xl text-left transition-colors ${
                        formData.unit === unit
                          ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500'
                          : 'bg-gray-50 dark:bg-gray-800 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span className="font-medium text-gray-900 dark:text-white">{unit}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Schedule */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Set a Schedule</h1>
              
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">When will you take this?</label>
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {FREQUENCY_OPTIONS.find(f => f.value === formData.frequency)?.label || 'Every Day'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const currentIndex = FREQUENCY_OPTIONS.findIndex(f => f.value === formData.frequency)
                      const nextIndex = (currentIndex + 1) % FREQUENCY_OPTIONS.length
                      setFormData({ ...formData, frequency: FREQUENCY_OPTIONS[nextIndex].value })
                    }}
                    className="text-blue-600 dark:text-blue-400 font-medium"
                  >
                    Change
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">At what time?</label>
                <div className="space-y-2">
                  {formData.scheduleTimes.map((schedule, index) => (
                    <div key={index} className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <button
                        type="button"
                        onClick={() => removeScheduleTime(index)}
                        className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center hover:bg-red-200 dark:hover:bg-red-900/50"
                      >
                        <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <input
                        type="time"
                        value={schedule.time}
                        onChange={(e) => updateScheduleTime(index, 'time', e.target.value)}
                        className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={schedule.dosage}
                        onChange={(e) => updateScheduleTime(index, 'dosage', e.target.value)}
                        placeholder="1 capsule"
                        className="w-24 px-3 py-2 bg-white dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addScheduleTime}
                    className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium"
                  >
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <span>Add a Time</span>
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  If you schedule a time, Health will send you a notification to take your medications.
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">START DATE</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-white dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">END DATE</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      min={formData.startDate}
                      className="w-full mt-1 px-3 py-2 bg-white dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Review Details */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{formData.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{formData.type}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Schedule</h3>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-2">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {FREQUENCY_OPTIONS.find(f => f.value === formData.frequency)?.label || 'Every Day'}
                  </p>
                  {formData.scheduleTimes.map((schedule, index) => (
                    <p key={index} className="font-medium text-gray-900 dark:text-white">
                      {formatTime(schedule.time)} {schedule.dosage}
                    </p>
                  ))}
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {(() => {
                      const startDateStr = formatDate(formData.startDate)
                      const startDisplay = startDateStr.includes('Today') ? 'Today' : startDateStr.replace(' (Today)', '')
                      const endDisplay = formData.endDate ? formatDate(formData.endDate) : 'No end date'
                      return `Starts ${startDisplay}, Ends ${endDisplay}`
                    })()}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Optional Details</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    placeholder="Display Name"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Notes"
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-4">
          {currentStep === 3 && (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white px-4 py-3 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Skip
              </button>
            </div>
          )}
          {currentStep === 5 && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !canProceed()}
              className="w-full bg-blue-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : medication ? 'Update' : 'Done'}
            </button>
          )}
          {currentStep !== 3 && currentStep !== 5 && (
            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceed()}
              className="w-full bg-blue-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
