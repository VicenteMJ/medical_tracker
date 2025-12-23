'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MedicationFormWidget } from '@/components/medications/medication-form-widget'
import { getMedication, updateMedication } from '@/lib/medications'
import { Medication } from '@/types/database'

interface EditMedicationPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditMedicationPage({ params }: EditMedicationPageProps) {
  const router = useRouter()
  const [medication, setMedication] = useState<Medication | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [medicationId, setMedicationId] = useState<string | null>(null)

  useEffect(() => {
    async function loadParams() {
      const { id } = await params
      setMedicationId(id)
    }
    loadParams()
  }, [params])

  useEffect(() => {
    if (!medicationId) return

    async function loadMedication() {
      try {
        const data = await getMedication(medicationId)
        if (!data) {
          router.push('/medications')
          return
        }
        setMedication(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load medication')
      } finally {
        setLoading(false)
      }
    }
    loadMedication()
  }, [medicationId, router])

  const handleSubmit = async (data: Omit<Medication, 'id' | 'created_at' | 'updated_at'>) => {
    if (!medicationId) return
    try {
      await updateMedication(medicationId, data)
      router.push(`/medications/${medicationId}`)
      router.refresh()
    } catch (error) {
      throw error
    }
  }

  const handleCancel = () => {
    if (!medicationId) return
    router.push(`/medications/${medicationId}`)
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (error || !medication) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded">
          {error || 'Medication not found'}
        </div>
      </div>
    )
  }

  return (
    <MedicationFormWidget
      medication={medication}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  )
}
