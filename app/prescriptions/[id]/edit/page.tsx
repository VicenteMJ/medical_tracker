'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PrescriptionForm } from '@/components/prescriptions/prescription-form'
import { getPrescription, updatePrescription } from '@/lib/prescriptions'
import { Prescription } from '@/types/database'

interface EditPrescriptionPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditPrescriptionPage({ params }: EditPrescriptionPageProps) {
  const router = useRouter()
  const [prescription, setPrescription] = useState<Prescription | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [prescriptionId, setPrescriptionId] = useState<string | null>(null)

  useEffect(() => {
    async function loadParams() {
      const { id } = await params
      setPrescriptionId(id)
    }
    loadParams()
  }, [params])

  useEffect(() => {
    if (!prescriptionId) return

    async function loadPrescription() {
      try {
        const data = await getPrescription(prescriptionId as string)
        if (!data) {
          router.push('/prescriptions')
          return
        }
        setPrescription(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load prescription')
      } finally {
        setLoading(false)
      }
    }
    loadPrescription()
  }, [prescriptionId, router])

  const handleSubmit = async (data: Omit<Prescription, 'id' | 'created_at' | 'updated_at'>): Promise<Prescription> => {
    if (!prescriptionId) throw new Error('Prescription ID is required')
    try {
      const updatedPrescription = await updatePrescription(prescriptionId, data)
      router.push(`/prescriptions/${prescriptionId}`)
      router.refresh()
      return updatedPrescription
    } catch (error) {
      throw error
    }
  }

  const handleCancel = () => {
    if (!prescriptionId) return
    router.push(`/prescriptions/${prescriptionId}`)
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (error || !prescription) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded">
          {error || 'Prescription not found'}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Edit Prescription
      </h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <PrescriptionForm
          prescription={prescription}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  )
}
