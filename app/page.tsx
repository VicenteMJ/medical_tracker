import { getDashboardStats, getTimelineEvents } from '@/lib/dashboard'
import { DashboardOverview } from '@/components/dashboard/dashboard-overview'

export default async function Home() {
  let stats = null
  let timelineEvents = null
  let error = null

  try {
    const [statsData, eventsData] = await Promise.all([
      getDashboardStats(),
      getTimelineEvents(),
    ])
    stats = statsData
    timelineEvents = eventsData
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load dashboard data'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Track your medical appointments, results, and bills
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {stats && <DashboardOverview stats={stats} timelineEvents={timelineEvents || undefined} />}
    </div>
  )
}
