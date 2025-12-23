import { getResult } from '@/lib/results'
import { notFound } from 'next/navigation'
import { ResultDetail } from '@/components/results/result-detail'

interface ResultPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ResultPage({ params }: ResultPageProps) {
  const { id } = await params
  const result = await getResult(id)

  if (!result) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ResultDetail result={result} />
    </div>
  )
}

