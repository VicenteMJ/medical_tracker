import { getInsurances } from '@/lib/insurances'
import { InsurancesList } from '@/components/insurances/insurances-list'
import { Insurance } from '@/types/database'
import Link from 'next/link'

export default async function InsurancesPage() {
  let insurances: Insurance[] = []
  let error: string | null = null

  try {
    insurances = await getInsurances()
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load insurances'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Insurance
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your insurance policies and view coverage details
          </p>
        </div>
        <Link
          href="/insurances/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          + New Insurance
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <InsurancesList initialInsurances={insurances} />
    </div>
  )
}

