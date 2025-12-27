import { Result } from '@/types/database'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

interface ResultCardProps {
  result: Result
}

export function ResultCard({ result }: ResultCardProps) {
  return (
    <Link
      href={`/results/${result.id}`}
      className="block bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow p-6"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {result.test_name}
          </h3>
          {result.test_type && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {result.test_type}
            </p>
          )}
          {result.value && (
            <div className="mt-2">
              <span className="text-lg font-medium text-gray-900 dark:text-white">
                {result.value}
              </span>
              {result.unit && (
                <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                  {result.unit}
                </span>
              )}
            </div>
          )}
          {result.reference_range && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Reference: {result.reference_range}
            </p>
          )}
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            {formatDate(result.created_at)}
          </p>
        </div>
      </div>
    </Link>
  )
}

















