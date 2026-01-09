import { getPrescription } from '@/lib/prescriptions'
import { notFound } from 'next/navigation'
import { PrescriptionDetail } from '@/components/prescriptions/prescription-detail'

interface PrescriptionPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function PrescriptionPage({ params }: PrescriptionPageProps) {
  const { id } = await params
  const prescription = await getPrescription(id)

  if (!prescription) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PrescriptionDetail prescription={prescription} />
    </div>
  )
}
