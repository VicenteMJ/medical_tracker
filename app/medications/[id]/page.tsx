import { getMedication } from '@/lib/medications'
import { notFound } from 'next/navigation'
import { MedicationDetail } from '@/components/medications/medication-detail'

interface MedicationPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function MedicationPage({ params }: MedicationPageProps) {
  const { id } = await params
  const medication = await getMedication(id)

  if (!medication) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <MedicationDetail medication={medication} />
    </div>
  )
}


