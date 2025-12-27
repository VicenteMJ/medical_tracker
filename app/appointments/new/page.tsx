'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppointmentForm } from '@/components/appointments/appointment-form'
import { createAppointment } from '@/lib/appointments'
import { Appointment } from '@/types/database'

export default function NewAppointmentPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>) => {
    setIsSubmitting(true)
    try {
      await createAppointment(data)
      router.push('/appointments')
      router.refresh()
    } catch (error) {
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push('/appointments')
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        New Appointment
      </h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <AppointmentForm onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    </div>
  )
}

















