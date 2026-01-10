'use client'

import { useState } from 'react'
import { createMedication } from '@/lib/medications'
import { Medication } from '@/types/database'

interface SimpleMedicationInputProps {
  onMedicationsAdded: (medications: Medication[]) => void
  onCancel?: () => void
}

export function SimpleMedicationInput({ onMedicationsAdded, onCancel }: SimpleMedicationInputProps) {
  const [medicationNames, setMedicationNames] = useState<string[]>([''])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addMedicationField = () => {
    setMedicationNames([...medicationNames, ''])
  }

  const removeMedicationField = (index: number) => {
    if (medicationNames.length > 1) {
      setMedicationNames(medicationNames.filter((_, i) => i !== index))
    }
  }

  const updateMedicationName = (index: number, value: string) => {
    const updated = [...medicationNames]
    updated[index] = value
    setMedicationNames(updated)
  }

  const handleSubmit = async () => {
    setError(null)
    
    // Filter out empty names
    const validNames = medicationNames.filter(name => name.trim() !== '')
    
    if (validNames.length === 0) {
      setError('Please add at least one medication name')
      return
    }

    setIsSubmitting(true)

    try {
      const createdMedications: Medication[] = []
      const today = new Date().toISOString().split('T')[0]

      // Create each medication
      for (const name of validNames) {
        const medication = await createMedication({
          name: name.trim(),
          type: 'Tablet', // Default type
          strength: null,
          unit: null,
          display_name: null,
          notes: `Added from prescription follow-up wizard`,
          frequency: 'daily',
          schedule_times: null,
          start_date: today,
          end_date: null,
        })
        createdMedications.push(medication)
      }

      onMedicationsAdded(createdMedications)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create medications')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Medication Names
        </label>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Enter the names of medications from your prescription. You can add more details later in the medications tab.
        </p>
        
        {medicationNames.map((name, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={name}
              onChange={(e) => updateMedicationName(index, e.target.value)}
              placeholder="Enter medication name"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              disabled={isSubmitting}
            />
            {medicationNames.length > 1 && (
              <button
                type="button"
                onClick={() => removeMedicationField(index)}
                className="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                disabled={isSubmitting}
              >
                Remove
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addMedicationField}
          className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          disabled={isSubmitting}
        >
          + Add another medication
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="flex gap-3 justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
            disabled={isSubmitting}
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Adding...' : 'Add Medications'}
        </button>
      </div>
    </div>
  )
}
