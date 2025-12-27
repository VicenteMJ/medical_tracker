'use client'

import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { InsuranceForm } from '@/components/insurances/insurance-form'
import { createInsurance } from '@/lib/insurances'
import { Insurance } from '@/types/database'

function NewInsuranceForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: Omit<Insurance, 'id' | 'created_at' | 'updated_at'>) => {
    setIsSubmitting(true)
    try {
      await createInsurance(data)
      router.push('/insurances')
      router.refresh()
    } catch (error) {
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push('/insurances')
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        New Insurance
      </h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <InsuranceForm onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    </div>
  )
}

export default function NewInsurancePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewInsuranceForm />
    </Suspense>
  )
}

