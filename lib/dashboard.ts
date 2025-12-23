import { getAppointments } from './appointments'
import { getResults } from './results'
import { getBills } from './bills'
import { Appointment, Result, Bill } from '@/types/database'

export type TimelineEventType = 'appointment' | 'result' | 'bill'

export interface TimelineEvent {
  id: string
  type: TimelineEventType
  date: string
  appointment?: Appointment
  result?: Result
  bill?: Bill
}

export interface BillWithRelation extends Bill {
  relatedAppointment?: Appointment | null
  relatedResult?: Result | null
}

export interface CategoryBreakdown {
  category: string
  totalAmount: number
  insuranceCoverage: number
  userPaid: number
  coveragePercentage: number
}

export interface DashboardStats {
  totalAppointments: number
  upcomingAppointments: Appointment[]
  recentResults: Result[]
  totalCosts: {
    thisMonth: number
    thisYear: number
    byCurrency: Record<string, number>
  }
  recentBills: BillWithRelation[]
  categoryBreakdown: CategoryBreakdown[]
  primaryCurrency: string
}

function getBillCategory(bill: Bill, appointment?: Appointment, result?: Result): string {
  if (bill.appointment_id && appointment?.specialty) {
    return appointment.specialty
  }
  if (bill.appointment_id) {
    return 'Appointment'
  }
  if (bill.result_id && result?.test_type) {
    return result.test_type
  }
  if (bill.result_id) {
    return 'Test'
  }
  return 'Other'
}

export function getCategoryBreakdown(
  bills: Bill[],
  appointments: Appointment[],
  results: Result[]
): CategoryBreakdown[] {
  const categoryMap = new Map<string, {
    totalAmount: number
    insuranceCoverage: number
  }>()

  // Group bills by currency and use the most common one
  const currencyCounts = new Map<string, number>()
  bills.forEach((bill) => {
    const currency = bill.currency || 'USD'
    currencyCounts.set(currency, (currencyCounts.get(currency) || 0) + 1)
  })
  
  // Get most common currency, default to USD
  let primaryCurrency = 'USD'
  let maxCount = 0
  currencyCounts.forEach((count, currency) => {
    if (count > maxCount) {
      maxCount = count
      primaryCurrency = currency
    }
  })

  bills.forEach((bill) => {
    // Only include bills with the primary currency for consistency
    const billCurrency = bill.currency || 'USD'
    if (billCurrency !== primaryCurrency) {
      return
    }

    const appointment = bill.appointment_id
      ? appointments.find((apt) => apt.id === bill.appointment_id)
      : undefined
    const result = bill.result_id
      ? results.find((r) => r.id === bill.result_id)
      : undefined

    const category = getBillCategory(bill, appointment, result)
    const insuranceCoverage = bill.insurance_coverage || 0
    const totalAmount = Number(bill.amount)

    const existing = categoryMap.get(category) || {
      totalAmount: 0,
      insuranceCoverage: 0,
    }

    categoryMap.set(category, {
      totalAmount: existing.totalAmount + totalAmount,
      insuranceCoverage: existing.insuranceCoverage + insuranceCoverage,
    })
  })

  const breakdown: CategoryBreakdown[] = Array.from(categoryMap.entries()).map(
    ([category, data]) => {
      const userPaid = data.totalAmount - data.insuranceCoverage
      const coveragePercentage =
        data.totalAmount > 0
          ? (data.insuranceCoverage / data.totalAmount) * 100
          : 0

      return {
        category,
        totalAmount: data.totalAmount,
        insuranceCoverage: data.insuranceCoverage,
        userPaid,
        coveragePercentage,
      }
    }
  )

  return breakdown.sort((a, b) => b.userPaid - a.userPaid)
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [appointments, results, bills] = await Promise.all([
    getAppointments(),
    getResults(),
    getBills(),
  ])

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfYear = new Date(now.getFullYear(), 0, 1)

  // Get upcoming appointments (future dates)
  const upcomingAppointments = appointments
    .filter((apt) => new Date(apt.date) > now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5)

  // Get recent results
  const recentResults = results.slice(0, 5)

  // Calculate costs
  const thisMonthBills = bills.filter(
    (bill) => bill.payment_date && new Date(bill.payment_date) >= startOfMonth
  )
  const thisYearBills = bills.filter(
    (bill) => bill.payment_date && new Date(bill.payment_date) >= startOfYear
  )

  const thisMonthTotal = thisMonthBills.reduce(
    (sum, bill) => sum + Number(bill.amount),
    0
  )
  const thisYearTotal = thisYearBills.reduce(
    (sum, bill) => sum + Number(bill.amount),
    0
  )

  // Calculate by currency for this year
  const byCurrency: Record<string, number> = {}
  thisYearBills.forEach((bill) => {
    byCurrency[bill.currency] = (byCurrency[bill.currency] || 0) + Number(bill.amount)
  })

  // Get recent bills with related appointment/result information
  const recentBills: BillWithRelation[] = bills.slice(0, 5).map((bill) => {
    const billWithRelation: BillWithRelation = { ...bill }
    
    // Find related appointment if bill is linked to one
    if (bill.appointment_id) {
      billWithRelation.relatedAppointment = appointments.find(
        (apt) => apt.id === bill.appointment_id
      ) || null
    }
    
    // Find related result if bill is linked to one
    if (bill.result_id) {
      billWithRelation.relatedResult = results.find(
        (result) => result.id === bill.result_id
      ) || null
    }
    
    return billWithRelation
  })

  // Calculate primary currency
  const currencyCounts = new Map<string, number>()
  bills.forEach((bill) => {
    const currency = bill.currency || 'USD'
    currencyCounts.set(currency, (currencyCounts.get(currency) || 0) + 1)
  })
  
  let primaryCurrency = 'USD'
  let maxCount = 0
  currencyCounts.forEach((count, currency) => {
    if (count > maxCount) {
      maxCount = count
      primaryCurrency = currency
    }
  })

  // Calculate category breakdown
  const categoryBreakdown = getCategoryBreakdown(bills, appointments, results)

  return {
    totalAppointments: appointments.length,
    upcomingAppointments,
    recentResults,
    totalCosts: {
      thisMonth: thisMonthTotal,
      thisYear: thisYearTotal,
      byCurrency,
    },
    recentBills,
    categoryBreakdown,
    primaryCurrency,
  }
}

export async function getTimelineEvents(): Promise<TimelineEvent[]> {
  const [appointments, results, bills] = await Promise.all([
    getAppointments(),
    getResults(),
    getBills(),
  ])

  const events: TimelineEvent[] = []

  // Add appointments
  appointments.forEach((appointment) => {
    events.push({
      id: appointment.id,
      type: 'appointment',
      date: appointment.date,
      appointment,
    })
  })

  // Add results (use created_at or appointment date if linked)
  results.forEach((result) => {
    const date = result.appointment_id
      ? appointments.find((a) => a.id === result.appointment_id)?.date || result.created_at
      : result.created_at
    events.push({
      id: result.id,
      type: 'result',
      date,
      result,
    })
  })

  // Add bills (use payment_date or appointment date or created_at)
  bills.forEach((bill) => {
    const date = bill.payment_date || 
      (bill.appointment_id 
        ? appointments.find((a) => a.id === bill.appointment_id)?.date || bill.created_at
        : bill.created_at)
    events.push({
      id: bill.id,
      type: 'bill',
      date,
      bill,
    })
  })

  // Sort by date (most recent first)
  return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}
