'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PrescriptionForm } from '@/components/prescriptions/prescription-form'
import { createPrescription } from '@/lib/prescriptions'
import { Prescription } from '@/types/database'

function NewPrescriptionForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const appointmentId = searchParams.get('appointment_id') || undefined
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: Omit<Prescription, 'id' | 'created_at' | 'updated_at'>): Promise<Prescription> => {
    setIsSubmitting(true)
    try {
      const createdPrescription = await createPrescription(data)
      if (appointmentId) {
        router.push(`/appointments/${appointmentId}`)
      } else {
        router.push('/prescriptions')
      }
      router.refresh()
      return createdPrescription
    } catch (error) {
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (appointmentId) {
      router.push(`/appointments/${appointmentId}`)
    } else {
      router.push('/prescriptions')
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        New Prescription
      </h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <PrescriptionForm onSubmit={handleSubmit} onCancel={handleCancel} defaultAppointmentId={appointmentId} />
      </div>
    </div>
  )
}

export default function NewPrescriptionPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">Loading...</div>}>
      <NewPrescriptionForm />
    </Suspense>
  )
}
