'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppointmentForm } from '@/components/appointments/appointment-form'
import { getAppointment, updateAppointment } from '@/lib/appointments'
import { Appointment } from '@/types/database'

interface EditAppointmentPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditAppointmentPage({ params }: EditAppointmentPageProps) {
  const router = useRouter()
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [appointmentId, setAppointmentId] = useState<string | null>(null)

  useEffect(() => {
    async function loadParams() {
      const { id } = await params
      setAppointmentId(id)
    }
    loadParams()
  }, [params])

  useEffect(() => {
    if (!appointmentId) return

    async function loadAppointment() {
      try {
        const data = await getAppointment(appointmentId as string)
        if (!data) {
          router.push('/appointments')
          return
        }
        setAppointment(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load appointment')
      } finally {
        setLoading(false)
      }
    }
    loadAppointment()
  }, [appointmentId, router])

  const handleSubmit = async (data: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>) => {
    if (!appointmentId) return
    try {
      await updateAppointment(appointmentId, data)
      router.push(`/appointments/${appointmentId}`)
      router.refresh()
    } catch (error) {
      throw error
    }
  }

  const handleCancel = () => {
    if (!appointmentId) return
    router.push(`/appointments/${appointmentId}`)
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (error || !appointment) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded">
          {error || 'Appointment not found'}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Edit Appointment
      </h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <AppointmentForm
          appointment={appointment}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  )
}

