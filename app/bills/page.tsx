import { getBills } from '@/lib/bills'
import { BillsList } from '@/components/bills/bills-list'
import { Bill } from '@/types/database'
import Link from 'next/link'

export default async function BillsPage() {
  let bills: Bill[] = []
  let error: string | null = null

  try {
    bills = await getBills()
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load bills'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Bills
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Track your medical expenses and bills
          </p>
        </div>
        <Link
          href="/bills/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          + New Bill
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <BillsList initialBills={bills} />
    </div>
  )
}










