'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BillForm } from '@/components/bills/bill-form'
import { getBill, updateBill } from '@/lib/bills'
import { Bill } from '@/types/database'

interface EditBillPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditBillPage({ params }: EditBillPageProps) {
  const router = useRouter()
  const [bill, setBill] = useState<Bill | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [billId, setBillId] = useState<string | null>(null)

  useEffect(() => {
    async function loadParams() {
      const { id } = await params
      setBillId(id)
    }
    loadParams()
  }, [params])

  useEffect(() => {
    if (!billId) return

    async function loadBill() {
      try {
        const data = await getBill(billId as string)
        if (!data) {
          router.push('/bills')
          return
        }
        setBill(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load bill')
      } finally {
        setLoading(false)
      }
    }
    loadBill()
  }, [billId, router])

  const handleSubmit = async (data: Omit<Bill, 'id' | 'created_at'>) => {
    if (!billId) return
    try {
      await updateBill(billId, data)
      router.push(`/bills/${billId}`)
      router.refresh()
    } catch (error) {
      throw error
    }
  }

  const handleCancel = () => {
    if (!billId) return
    router.push(`/bills/${billId}`)
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (error || !bill) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded">
          {error || 'Bill not found'}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Edit Bill
      </h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <BillForm
          bill={bill}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  )
}

