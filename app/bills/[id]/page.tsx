import { getBill } from '@/lib/bills'
import { notFound } from 'next/navigation'
import { BillDetail } from '@/components/bills/bill-detail'

interface BillPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function BillPage({ params }: BillPageProps) {
  const { id } = await params
  const bill = await getBill(id)

  if (!bill) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <BillDetail bill={bill} />
    </div>
  )
}

