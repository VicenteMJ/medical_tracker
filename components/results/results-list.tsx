'use client'

import { useState } from 'react'
import { Result } from '@/types/database'
import { ResultCard } from './result-card'
import Link from 'next/link'

interface ResultsListProps {
  initialResults: Result[]
}

export function ResultsList({ initialResults }: ResultsListProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredResults = searchTerm
    ? initialResults.filter(
        (result) =>
          result.test_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          result.test_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          result.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : initialResults

  if (initialResults.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          No results yet. Add your first test result to get started.
        </p>
        <Link
          href="/results/new"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add Result
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search results..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>
      {filteredResults.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            No results match your search.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResults.map((result) => (
            <ResultCard key={result.id} result={result} />
          ))}
        </div>
      )}
    </>
  )
}

















