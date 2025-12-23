'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ResultForm } from '@/components/results/result-form'
import { createResult } from '@/lib/results'
import { Result } from '@/types/database'

function NewResultForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const appointmentId = searchParams.get('appointment_id') || undefined
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: Omit<Result, 'id' | 'created_at'>) => {
    setIsSubmitting(true)
    try {
      await createResult(data)
      if (appointmentId) {
        router.push(`/appointments/${appointmentId}`)
      } else {
        router.push('/results')
      }
      router.refresh()
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
      router.push('/results')
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        New Test Result
      </h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <ResultForm onSubmit={handleSubmit} onCancel={handleCancel} defaultAppointmentId={appointmentId} />
      </div>
    </div>
  )
}

export default function NewResultPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">Loading...</div>}>
      <NewResultForm />
    </Suspense>
  )
}










