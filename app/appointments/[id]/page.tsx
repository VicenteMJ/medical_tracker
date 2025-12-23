import { getAppointment } from '@/lib/appointments'
import { notFound } from 'next/navigation'
import { AppointmentDetail } from '@/components/appointments/appointment-detail'

interface AppointmentPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function AppointmentPage({ params }: AppointmentPageProps) {
  const { id } = await params
  const appointment = await getAppointment(id)

  if (!appointment) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AppointmentDetail appointment={appointment} />
    </div>
  )
}

