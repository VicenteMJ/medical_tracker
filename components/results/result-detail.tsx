'use client'

import { Result, Bill, Appointment } from '@/types/database'
import { formatDate, formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { deleteResult } from '@/lib/results'
import { getBillsByResult } from '@/lib/bills'
import { getAppointment } from '@/lib/appointments'

interface ResultDetailProps {
  result: Result
}

export function ResultDetail({ result }: ResultDetailProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [bills, setBills] = useState<Bill[]>([])
  const [loadingBills, setLoadingBills] = useState(true)
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [loadingAppointment, setLoadingAppointment] = useState(false)

  useEffect(() => {
    async function loadBills() {
      try {
        const billsData = await getBillsByResult(result.id)
        setBills(billsData)
      } catch (error) {
        console.error('Failed to load bills:', error)
      } finally {
        setLoadingBills(false)
      }
    }
    loadBills()
  }, [result.id])

  useEffect(() => {
    async function loadAppointment() {
      if (!result.appointment_id) return
      
      setLoadingAppointment(true)
      try {
        const appointmentData = await getAppointment(result.appointment_id)
        setAppointment(appointmentData)
      } catch (error) {
        console.error('Failed to load appointment:', error)
      } finally {
        setLoadingAppointment(false)
      }
    }
    loadAppointment()
  }, [result.appointment_id])

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteResult(result.id)
      router.push('/results')
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete result')
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Result Details
        </h1>
        <div className="flex gap-3">
          <Link
            href={`/results/${result.id}/edit`}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Edit
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Delete
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <p className="text-red-800 dark:text-red-200 mb-4">
            Are you sure you want to delete this result? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Yes, Delete'}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {result.test_name}
          </h2>
          {result.test_type && (
            <p className="text-gray-600 dark:text-gray-400">{result.test_type}</p>
          )}
        </div>

        {result.value && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              Value
            </h3>
            <p className="text-gray-900 dark:text-white text-lg">
              {result.value} {result.unit && <span className="text-sm">{result.unit}</span>}
            </p>
          </div>
        )}

        {result.reference_range && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              Reference Range
            </h3>
            <p className="text-gray-900 dark:text-white">{result.reference_range}</p>
          </div>
        )}

        {result.appointment_id && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              Related Appointment
            </h3>
            {loadingAppointment ? (
              <p className="text-gray-600 dark:text-gray-400">Loading...</p>
            ) : appointment ? (
              <Link
                href={`/appointments/${result.appointment_id}`}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {appointment.doctor_name} - {new Date(appointment.date).toLocaleDateString()} →
              </Link>
            ) : (
              <Link
                href={`/appointments/${result.appointment_id}`}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                View Appointment →
              </Link>
            )}
          </div>
        )}

        {bills.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Bills ({bills.length})
              </h3>
              <Link
                href={`/bills/new?result_id=${result.id}`}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                + Add Bill
              </Link>
            </div>
            <div className="space-y-2">
              {bills.map((bill) => (
                <Link
                  key={bill.id}
                  href={`/bills/${bill.id}`}
                  className="block p-3 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(bill.amount, bill.currency)}
                      </div>
                      {bill.payment_date && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Paid: {formatDate(bill.payment_date)}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {bills.length === 0 && !loadingBills && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Bills
              </h3>
              <Link
                href={`/bills/new?result_id=${result.id}`}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                + Add Bill
              </Link>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">No bills associated with this test result.</p>
          </div>
        )}

        {result.file_url && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              Document
            </h3>
            <a
              href={result.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              View Document →
            </a>
          </div>
        )}

        {result.notes && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              Notes
            </h3>
            <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
              {result.notes}
            </p>
          </div>
        )}

        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
            Date Added
          </h3>
          <p className="text-gray-900 dark:text-white">{formatDate(result.created_at)}</p>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <Link
            href="/results"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to Results
          </Link>
        </div>
      </div>
    </div>
  )
}


