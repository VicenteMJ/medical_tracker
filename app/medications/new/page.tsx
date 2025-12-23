'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MedicationFormWidget } from '@/components/medications/medication-form-widget'
import { createMedication } from '@/lib/medications'
import { Medication } from '@/types/database'

export default function NewMedicationPage() {
  const router = useRouter()

  const handleSubmit = async (data: Omit<Medication, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await createMedication(data)
      router.push('/medications')
      router.refresh()
    } catch (error) {
      throw error
    }
  }

  const handleCancel = () => {
    router.push('/medications')
  }

  return (
    <MedicationFormWidget
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  )
}

