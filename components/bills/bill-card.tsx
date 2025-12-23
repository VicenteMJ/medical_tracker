import { Bill } from '@/types/database'
import { formatDate, formatCurrency } from '@/lib/utils'
import Link from 'next/link'

interface BillCardProps {
  bill: Bill
}

export function BillCard({ bill }: BillCardProps) {
  return (
    <Link
      href={`/bills/${bill.id}`}
      className="block bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow p-6"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatCurrency(bill.amount, bill.currency)}
              </h3>
              {bill.insurance_coverage !== null && bill.insurance_coverage > 0 && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  Insurance: {formatCurrency(bill.insurance_coverage, bill.currency)} • 
                  You pay: {formatCurrency(bill.amount - bill.insurance_coverage, bill.currency)}
                </p>
              )}
            </div>
          </div>
          {bill.payment_date && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Paid: {formatDate(bill.payment_date)}
            </p>
          )}
          {bill.payment_method && (
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              {bill.payment_method}
            </p>
          )}
          {bill.notes && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
              {bill.notes}
            </p>
          )}
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            {formatDate(bill.created_at)}
          </p>
        </div>
      </div>
    </Link>
  )
}





