'use client'

import { useState, useMemo } from 'react'
import { Bill } from '@/types/database'
import { BillCard } from './bill-card'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

interface BillsListProps {
  initialBills: Bill[]
}

export function BillsList({ initialBills }: BillsListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [currencyFilter, setCurrencyFilter] = useState('')

  const currencies = Array.from(new Set(initialBills.map(b => b.currency)))

  const filteredBills = useMemo(() => {
    let filtered = initialBills

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (bill) =>
          bill.notes?.toLowerCase().includes(lowerSearch) ||
          bill.payment_method?.toLowerCase().includes(lowerSearch)
      )
    }

    if (currencyFilter) {
      filtered = filtered.filter((bill) => bill.currency === currencyFilter)
    }

    return filtered
  }, [initialBills, searchTerm, currencyFilter])

  const totalAmount = useMemo(() => {
    return filteredBills.reduce((sum, bill) => sum + Number(bill.amount), 0)
  }, [filteredBills])

  const totalByCurrency = useMemo(() => {
    const totals: Record<string, number> = {}
    filteredBills.forEach((bill) => {
      totals[bill.currency] = (totals[bill.currency] || 0) + Number(bill.amount)
    })
    return totals
  }, [filteredBills])

  if (initialBills.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          No bills yet. Add your first bill to get started.
        </p>
        <Link
          href="/bills/new"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add Bill
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search bills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          {currencies.length > 0 && (
            <div className="sm:w-48">
              <select
                value={currencyFilter}
                onChange={(e) => setCurrencyFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Currencies</option>
                {currencies.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        {Object.keys(totalByCurrency).length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Total Costs:
            </div>
            <div className="flex flex-wrap gap-4">
              {Object.entries(totalByCurrency).map(([currency, amount]) => (
                <div key={currency} className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(amount, currency)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {filteredBills.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            No bills match your filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBills.map((bill) => (
            <BillCard key={bill.id} bill={bill} />
          ))}
        </div>
      )}
    </>
  )
}

















