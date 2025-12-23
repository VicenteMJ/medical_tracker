import { Appointment } from '@/types/database'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

interface AppointmentCardProps {
  appointment: Appointment
}

export function AppointmentCard({ appointment }: AppointmentCardProps) {
  return (
    <Link
      href={`/appointments/${appointment.id}`}
      className="block bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow p-6"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {appointment.doctor_name}
          </h3>
          {appointment.specialty && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {appointment.specialty}
            </p>
          )}
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            {formatDate(appointment.date)}
          </p>
          {appointment.notes && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 line-clamp-2">
              {appointment.notes}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}











