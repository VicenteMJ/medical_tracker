'use client'

import { Appointment, Result, Bill } from '@/types/database'
import { formatDate, formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { deleteAppointment } from '@/lib/appointments'
import { getResultsByAppointment } from '@/lib/results'
import { getBillsByAppointment, getBillsByResultIds } from '@/lib/bills'

interface AppointmentDetailProps {
  appointment: Appointment
}

export function AppointmentDetail({ appointment }: AppointmentDetailProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [results, setResults] = useState<Result[]>([])
  const [appointmentBills, setAppointmentBills] = useState<Bill[]>([])
  const [resultBills, setResultBills] = useState<Bill[]>([])
  const [loadingRelated, setLoadingRelated] = useState(true)

  useEffect(() => {
    async function loadRelated() {
      try {
        const [resultsData, appointmentBillsData] = await Promise.all([
          getResultsByAppointment(appointment.id),
          getBillsByAppointment(appointment.id),
        ])
        setResults(resultsData)
        setAppointmentBills(appointmentBillsData)

        // Fetch bills from test results
        if (resultsData.length > 0) {
          const resultIds = resultsData.map(r => r.id)
          const resultBillsData = await getBillsByResultIds(resultIds)
          setResultBills(resultBillsData)
        } else {
          setResultBills([])
        }
      } catch (error) {
        console.error('Failed to load related data:', error)
      } finally {
        setLoadingRelated(false)
      }
    }
    loadRelated()
  }, [appointment.id])

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteAppointment(appointment.id)
      router.push('/appointments')
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete appointment')
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Appointment Details
        </h1>
        <div className="flex gap-3">
          <Link
            href={`/appointments/${appointment.id}/edit`}
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
            Are you sure you want to delete this appointment? This action cannot be undone.
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
            {appointment.doctor_name}
          </h2>
          {appointment.specialty && (
            <p className="text-gray-600 dark:text-gray-400">{appointment.specialty}</p>
          )}
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
            Date & Time
          </h3>
          <p className="text-gray-900 dark:text-white">{formatDate(appointment.date)}</p>
        </div>

        {appointment.medical_center && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              Medical Center
            </h3>
            <p className="text-gray-900 dark:text-white">{appointment.medical_center}</p>
          </div>
        )}

        {appointment.notes && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              Notes
            </h3>
            <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
              {appointment.notes}
            </p>
          </div>
        )}

        {!loadingRelated && (
          <>
            {results.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Test Results ({results.length})
                  </h3>
                  <Link
                    href={`/results/new?appointment_id=${appointment.id}`}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    + Add Result
                  </Link>
                </div>
                <div className="space-y-2">
                  {results.map((result) => {
                    // Get bills for this specific result
                    const billsForResult = resultBills.filter(bill => bill.result_id === result.id)
                    
                    // Group bills by currency and calculate totals
                    const totalsByCurrency = billsForResult.reduce((acc, bill) => {
                      if (!acc[bill.currency]) {
                        acc[bill.currency] = 0
                      }
                      acc[bill.currency] += bill.amount
                      return acc
                    }, {} as Record<string, number>)
                    
                    const totalDisplay = Object.entries(totalsByCurrency)
                      .map(([currency, total]) => formatCurrency(total, currency))
                      .join(' + ')
                    
                    return (
                      <Link
                        key={result.id}
                        href={`/results/${result.id}`}
                        className="block p-3 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {result.test_name}
                            </div>
                            {result.value && (
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {result.value} {result.unit}
                              </div>
                            )}
                          </div>
                          {billsForResult.length > 0 && (
                            <div className="ml-4 text-right">
                              <div className="font-medium text-gray-900 dark:text-white">
                                {totalDisplay}
                              </div>
                              {billsForResult.length > 1 && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {billsForResult.length} bills
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            {appointmentBills.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Appointment Bills ({appointmentBills.length})
                  </h3>
                  <Link
                    href={`/bills/new?appointment_id=${appointment.id}`}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    + Add Bill
                  </Link>
                </div>
                <div className="space-y-2">
                  {appointmentBills.map((bill) => (
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

            {(appointmentBills.length > 0 || resultBills.length > 0) && (
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Total:
                  </span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {(() => {
                      // Combine all bills (appointment bills + result bills)
                      const allBills = [...appointmentBills, ...resultBills]
                      
                      // Group bills by currency and sum them
                      const totalsByCurrency = allBills.reduce((acc, bill) => {
                        if (!acc[bill.currency]) {
                          acc[bill.currency] = 0
                        }
                        acc[bill.currency] += bill.amount
                        return acc
                      }, {} as Record<string, number>)

                      // Format each currency total
                      return Object.entries(totalsByCurrency)
                        .map(([currency, total]) => formatCurrency(total, currency))
                        .join(' + ')
                    })()}
                  </span>
                </div>
              </div>
            )}

            {(results.length === 0 || appointmentBills.length === 0) && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-3">
                  {results.length === 0 && (
                    <Link
                      href={`/results/new?appointment_id=${appointment.id}`}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      + Add Test Result
                    </Link>
                  )}
                  {appointmentBills.length === 0 && (
                    <Link
                      href={`/bills/new?appointment_id=${appointment.id}`}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      + Add Bill
                    </Link>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <Link
            href="/appointments"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to Appointments
          </Link>
        </div>
      </div>
    </div>
  )
}
