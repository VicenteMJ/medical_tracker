'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ResultForm } from '@/components/results/result-form'
import { getResult, updateResult } from '@/lib/results'
import { Result } from '@/types/database'

interface EditResultPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditResultPage({ params }: EditResultPageProps) {
  const router = useRouter()
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [resultId, setResultId] = useState<string | null>(null)

  useEffect(() => {
    async function loadParams() {
      const { id } = await params
      setResultId(id)
    }
    loadParams()
  }, [params])

  useEffect(() => {
    if (!resultId) return

    async function loadResult() {
      try {
        const data = await getResult(resultId as string)
        if (!data) {
          router.push('/results')
          return
        }
        setResult(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load result')
      } finally {
        setLoading(false)
      }
    }
    loadResult()
  }, [resultId, router])

  const handleSubmit = async (data: Omit<Result, 'id' | 'created_at'>) => {
    if (!resultId) return
    try {
      await updateResult(resultId, data)
      router.push(`/results/${resultId}`)
      router.refresh()
    } catch (error) {
      throw error
    }
  }

  const handleCancel = () => {
    if (!resultId) return
    router.push(`/results/${resultId}`)
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (error || !result) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded">
          {error || 'Result not found'}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Edit Result
      </h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <ResultForm
          result={result}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  )
}

