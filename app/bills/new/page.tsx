'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { BillForm } from '@/components/bills/bill-form'
import { createBill } from '@/lib/bills'
import { Bill } from '@/types/database'

function NewBillForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const appointmentId = searchParams.get('appointment_id') || undefined
  const resultId = searchParams.get('result_id') || undefined
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: Omit<Bill, 'id' | 'created_at'>) => {
    setIsSubmitting(true)
    try {
      await createBill(data)
      if (resultId) {
        router.push(`/results/${resultId}`)
      } else if (appointmentId) {
        router.push(`/appointments/${appointmentId}`)
      } else {
        router.push('/bills')
      }
      router.refresh()
    } catch (error) {
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (resultId) {
      router.push(`/results/${resultId}`)
    } else if (appointmentId) {
      router.push(`/appointments/${appointmentId}`)
    } else {
      router.push('/bills')
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        New Bill
      </h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <BillForm onSubmit={handleSubmit} onCancel={handleCancel} defaultAppointmentId={appointmentId} defaultResultId={resultId} />
      </div>
    </div>
  )
}

export default function NewBillPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">Loading...</div>}>
      <NewBillForm />
    </Suspense>
  )
}
