'use client'

import { Bill, Appointment, Result, BillInsuranceWithDetails } from '@/types/database'
import { formatDate, formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { deleteBill, getBillInsurances, updateBillInsuranceUsage } from '@/lib/bills'
import { getAppointment } from '@/lib/appointments'
import { getResult } from '@/lib/results'
import { getInsuranceLogo } from '@/lib/insurance-logos'

interface BillDetailProps {
  bill: Bill
}

export function BillDetail({ bill }: BillDetailProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [result, setResult] = useState<Result | null>(null)
  const [loadingRelated, setLoadingRelated] = useState(true)
  const [billInsurances, setBillInsurances] = useState<BillInsuranceWithDetails[]>([])
  const [loadingInsurances, setLoadingInsurances] = useState(true)
  const [updatingInsurance, setUpdatingInsurance] = useState<string | null>(null)

  useEffect(() => {
    async function loadRelated() {
      try {
        if (bill.appointment_id) {
          const appointmentData = await getAppointment(bill.appointment_id)
          setAppointment(appointmentData)
        }
        if (bill.result_id) {
          const resultData = await getResult(bill.result_id)
          setResult(resultData)
        }
      } catch (error) {
        console.error('Failed to load related data:', error)
      } finally {
        setLoadingRelated(false)
      }
    }
    loadRelated()
  }, [bill.appointment_id, bill.result_id])

  useEffect(() => {
    async function loadBillInsurances() {
      try {
        const insurances = await getBillInsurances(bill.id)
        setBillInsurances(insurances)
      } catch (error) {
        console.error('Failed to load bill insurances:', error)
      } finally {
        setLoadingInsurances(false)
      }
    }
    loadBillInsurances()
  }, [bill.id])

  const handleToggleInsuranceUsage = async (insuranceId: string, currentIsUsed: boolean) => {
    setUpdatingInsurance(insuranceId)
    try {
      await updateBillInsuranceUsage(bill.id, insuranceId, !currentIsUsed)
      // Update local state
      setBillInsurances(prev =>
        prev.map(bi =>
          bi.insurance_id === insuranceId
            ? { ...bi, is_used: !currentIsUsed }
            : bi
        )
      )
    } catch (error) {
      console.error('Failed to update insurance usage:', error)
      alert(error instanceof Error ? error.message : 'Failed to update insurance usage')
    } finally {
      setUpdatingInsurance(null)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteBill(bill.id)
      router.push('/bills')
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete bill')
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Bill Details
        </h1>
        <div className="flex gap-3">
          <Link
            href={`/bills/${bill.id}/edit`}
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
            Are you sure you want to delete this bill? This action cannot be undone.
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
          <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-2">
            {formatCurrency(bill.amount, bill.currency)}
          </h2>
          {bill.insurance_coverage !== null && bill.insurance_coverage > 0 && (
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Full Amount:</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {formatCurrency(bill.amount, bill.currency)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Insurance Coverage:</span>
                <span className="text-green-600 dark:text-green-400 font-medium">
                  -{formatCurrency(bill.insurance_coverage, bill.currency)}
                </span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-gray-900 dark:text-white font-semibold">Amount You Pay:</span>
                <span className="text-gray-900 dark:text-white font-bold text-lg">
                  {formatCurrency(bill.amount - bill.insurance_coverage, bill.currency)}
                </span>
              </div>
            </div>
          )}
        </div>

        {billInsurances.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Have you use this insurance already?
            </h3>
            <div className="space-y-2">
              {billInsurances.map((billInsurance) => {
                const logoUrl = billInsurance.insurance.logo_url || getInsuranceLogo(billInsurance.insurance.provider_name)
                const isUsed = billInsurance.is_used
                const isUpdating = updatingInsurance === billInsurance.insurance_id
                
                return (
                  <button
                    key={billInsurance.id}
                    type="button"
                    onClick={() => handleToggleInsuranceUsage(billInsurance.insurance_id, isUsed)}
                    disabled={isUpdating}
                    className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                      isUsed
                        ? 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                    } ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center gap-3">
                      {logoUrl && logoUrl !== '/icons/insurance-default.svg' && (
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                          <img
                            src={logoUrl}
                            alt={billInsurance.insurance.provider_name}
                            className="w-8 h-8 object-contain"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium ${
                            isUsed
                              ? 'line-through text-gray-500 dark:text-gray-400'
                              : 'text-gray-900 dark:text-white'
                          }`}
                        >
                          {billInsurance.insurance.insurance_type
                            ? `${billInsurance.insurance.provider_name} - ${billInsurance.insurance.insurance_type}`
                            : billInsurance.insurance.provider_name}
                        </p>
                        {billInsurance.insurance.policy_id && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Policy: {billInsurance.insurance.policy_id}
                          </p>
                        )}
                      </div>
                      {isUpdating && (
                        <div className="flex-shrink-0">
                          <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {bill.payment_date && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              Payment Date
            </h3>
            <p className="text-gray-900 dark:text-white">{formatDate(bill.payment_date)}</p>
          </div>
        )}

        {bill.payment_method && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              Payment Method
            </h3>
            <p className="text-gray-900 dark:text-white">{bill.payment_method}</p>
          </div>
        )}

        {bill.appointment_id && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              Related Appointment
            </h3>
            {loadingRelated ? (
              <p className="text-gray-600 dark:text-gray-400">Loading...</p>
            ) : appointment ? (
              <Link
                href={`/appointments/${bill.appointment_id}`}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {appointment.doctor_name} - {new Date(appointment.date).toLocaleDateString()} →
              </Link>
            ) : (
              <Link
                href={`/appointments/${bill.appointment_id}`}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                View Appointment →
              </Link>
            )}
          </div>
        )}

        {bill.result_id && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              Related Test Result
            </h3>
            {loadingRelated ? (
              <p className="text-gray-600 dark:text-gray-400">Loading...</p>
            ) : result ? (
              <Link
                href={`/results/${bill.result_id}`}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {result.test_name} {result.test_type && `- ${result.test_type}`} →
              </Link>
            ) : (
              <Link
                href={`/results/${bill.result_id}`}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                View Test Result →
              </Link>
            )}
          </div>
        )}

        {bill.receipt_url && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              Receipt
            </h3>
            <a
              href={bill.receipt_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              View Receipt →
            </a>
          </div>
        )}

        {bill.notes && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              Notes
            </h3>
            <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
              {bill.notes}
            </p>
          </div>
        )}

        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
            Date Added
          </h3>
          <p className="text-gray-900 dark:text-white">{formatDate(bill.created_at)}</p>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <Link
            href="/bills"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to Bills
          </Link>
        </div>
      </div>
    </div>
  )
}


