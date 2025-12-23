import { DashboardStats, TimelineEvent } from '@/lib/dashboard'
import { formatDate, formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { CostBreakdown } from './cost-breakdown'
import { HealthJourneyTimeline } from './health-journey-timeline'

interface DashboardOverviewProps {
  stats: DashboardStats
  timelineEvents?: TimelineEvent[]
}

export function DashboardOverview({ stats, timelineEvents }: DashboardOverviewProps) {
  return (
    <div className="space-y-6">
      {/* Cost Breakdown */}
      <CostBreakdown 
        categoryBreakdown={stats.categoryBreakdown} 
        currency={stats.primaryCurrency}
      />

      {/* Health Journey Timeline */}
      {timelineEvents && timelineEvents.length > 0 && (
        <HealthJourneyTimeline events={timelineEvents} />
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Total Appointments
          </h3>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {stats.totalAppointments}
          </p>
          <Link
            href="/appointments"
            className="mt-4 inline-block text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            View All →
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            This Month Costs
          </h3>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(stats.totalCosts.thisMonth, stats.primaryCurrency)}
          </p>
          <Link
            href="/bills"
            className="mt-4 inline-block text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            View Bills →
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            This Year Costs
          </h3>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {Object.keys(stats.totalCosts.byCurrency).length > 0
              ? Object.entries(stats.totalCosts.byCurrency)
                  .map(([currency, amount]) => formatCurrency(amount, currency))
                  .join(' / ')
              : formatCurrency(stats.totalCosts.thisYear, stats.primaryCurrency)}
          </p>
          <Link
            href="/bills"
            className="mt-4 inline-block text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            View Bills →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Upcoming Appointments
            </h2>
            <Link
              href="/appointments"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              View All →
            </Link>
          </div>
          {stats.upcomingAppointments.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">
              No upcoming appointments
            </p>
          ) : (
            <div className="space-y-3">
              {stats.upcomingAppointments.map((appointment) => (
                <Link
                  key={appointment.id}
                  href={`/appointments/${appointment.id}`}
                  className="block p-3 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <div className="font-medium text-gray-900 dark:text-white">
                    {appointment.doctor_name}
                  </div>
                  {appointment.specialty && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {appointment.specialty}
                    </div>
                  )}
                  <div className="text-sm text-gray-500 dark:text-gray-500">
                    {formatDate(appointment.date)}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Results */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Test Results
            </h2>
            <Link
              href="/results"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              View All →
            </Link>
          </div>
          {stats.recentResults.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">
              No test results yet
            </p>
          ) : (
            <div className="space-y-3">
              {stats.recentResults.map((result) => (
                <Link
                  key={result.id}
                  href={`/results/${result.id}`}
                  className="block p-3 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <div className="font-medium text-gray-900 dark:text-white">
                    {result.test_name}
                  </div>
                  {result.value && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {result.value} {result.unit}
                    </div>
                  )}
                  <div className="text-sm text-gray-500 dark:text-gray-500">
                    {formatDate(result.created_at)}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Bills */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Bills
          </h2>
          <Link
            href="/bills"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            View All →
          </Link>
        </div>
        {stats.recentBills.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">No bills yet</p>
        ) : (
          <div className="space-y-3">
            {stats.recentBills.map((bill) => {
              // Determine the name to display (appointment or result)
              let displayName = 'Medical Bill'
              if (bill.relatedAppointment) {
                displayName = bill.relatedAppointment.specialty
                  ? `${bill.relatedAppointment.specialty} - ${bill.relatedAppointment.doctor_name}`
                  : bill.relatedAppointment.doctor_name
              } else if (bill.relatedResult) {
                displayName = bill.relatedResult.test_name
              }

              return (
                <Link
                  key={bill.id}
                  href={`/bills/${bill.id}`}
                  className="block p-3 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white truncate">
                        {displayName}
                      </div>
                      {bill.payment_date && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Paid: {formatDate(bill.payment_date)}
                        </div>
                      )}
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(bill.amount, bill.currency)}
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
