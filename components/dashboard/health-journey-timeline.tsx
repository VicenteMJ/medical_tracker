'use client'

import { TimelineEvent } from '@/lib/dashboard'
import { formatDate, formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { useState } from 'react'
import { getBillsByAppointment, getBillsByResult, getBillsByResultIds } from '@/lib/bills'
import { getResultsByAppointment } from '@/lib/results'
import { Bill, Result } from '@/types/database'

interface HealthJourneyTimelineProps {
  events: TimelineEvent[]
}

interface ExpandedData {
  bills: Bill[]
  results?: Result[]
  loading: boolean
}

// Icon components
function StethoscopeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
      />
    </svg>
  )
}

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  )
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  )
}

export function HealthJourneyTimeline({ events }: HealthJourneyTimelineProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [expandedData, setExpandedData] = useState<Map<string, ExpandedData>>(new Map())

  // Filter to only show appointments and results
  const filteredEvents = events.filter(
    (event) => event.type === 'appointment' || event.type === 'result'
  )

  if (filteredEvents.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          No health events yet. Start tracking your health journey!
        </p>
      </div>
    )
  }

  const toggleExpand = async (eventId: string, eventType: string) => {
    const isExpanded = expandedItems.has(eventId)
    
    if (isExpanded) {
      // Collapse
      setExpandedItems((prev) => {
        const newSet = new Set(prev)
        newSet.delete(eventId)
        return newSet
      })
    } else {
      // Expand - fetch data if not already loaded
      setExpandedItems((prev) => new Set(prev).add(eventId))
      
      if (!expandedData.has(eventId)) {
        setExpandedData((prev) => {
          const newMap = new Map(prev)
          newMap.set(eventId, { bills: [], loading: true })
          return newMap
        })

        try {
          let bills: Bill[] = []
          let results: Result[] | undefined = undefined

          if (eventType === 'appointment') {
            const [billsData, resultsData] = await Promise.all([
              getBillsByAppointment(eventId),
              getResultsByAppointment(eventId),
            ])
            bills = billsData
            results = resultsData

            // Also fetch bills from related results
            if (resultsData.length > 0) {
              const resultIds = resultsData.map((r) => r.id)
              const resultBills = await getBillsByResultIds(resultIds)
              bills = [...bills, ...resultBills]
            }
          } else if (eventType === 'result') {
            bills = await getBillsByResult(eventId)
          }

          setExpandedData((prev) => {
            const newMap = new Map(prev)
            newMap.set(eventId, { bills, results, loading: false })
            return newMap
          })
        } catch (error) {
          console.error('Failed to load expanded data:', error)
          setExpandedData((prev) => {
            const newMap = new Map(prev)
            newMap.set(eventId, { bills: [], loading: false })
            return newMap
          })
        }
      }
    }
  }

  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow p-8 overflow-hidden">
      {/* Subtle grid background */}
      <div 
        className="absolute inset-0 opacity-5 dark:opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      ></div>
      
      <div className="relative flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Health Journey Timeline
        </h2>
        <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
            />
          </svg>
        </button>
      </div>

      <div className="relative">
        {/* Vertical timeline line with glow effect */}
        <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-400 to-green-400 opacity-20 dark:opacity-10"></div>
        <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-blue-500 to-green-500 shadow-lg shadow-blue-500/30 dark:shadow-blue-400/20"></div>

        {/* Timeline events */}
        <div className="space-y-8">
          {filteredEvents.map((event, index) => {
            const isLeft = index % 2 === 0
            const isAppointment = event.type === 'appointment'
            const isResult = event.type === 'result'
            const isExpanded = expandedItems.has(event.id)
            const expandedInfo = expandedData.get(event.id)

            // Determine colors and icon
            let bgColor = 'bg-blue-500'
            let borderColor = 'border-blue-500'
            let IconComponent = StethoscopeIcon

            if (isResult) {
              bgColor = 'bg-green-500'
              borderColor = 'border-green-500'
              IconComponent = DocumentIcon
            }

            // Get event details
            let title = ''
            let subtitle = ''
            let href = ''

            if (isAppointment && event.appointment) {
              title = `${event.appointment.specialty || 'Appointment'} - ${event.appointment.doctor_name}`
              const date = new Date(event.appointment.date)
              const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
              subtitle = `${event.appointment.medical_center || 'Check-up'}, ${time}`
              href = `/appointments/${event.appointment.id}`
            } else if (isResult && event.result) {
              title = `Lab Results - ${event.result.test_name}`
              const details = []
              if (event.result.test_type) {
                details.push(event.result.test_type)
              }
              if (event.result.value && event.result.unit) {
                details.push(`${event.result.value} ${event.result.unit}`)
              }
              if (event.result.reference_range) {
                details.push(event.result.reference_range)
              }
              subtitle = details.length > 0 ? details.join(', ') : 'View details'
              if (event.result.file_url) {
                subtitle += '. View PDF'
              }
              href = `/results/${event.result.id}`
            }

            return (
              <div
                key={event.id}
                className={`relative flex items-start ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}
              >
                {/* Event card */}
                <div className={`w-5/12 ${isLeft ? 'pr-8' : 'pl-8'}`}>
                  <div className={`rounded-lg border-2 ${borderColor} bg-white dark:bg-gray-700 overflow-hidden`}>
                    {/* Main card - clickable */}
                    <button
                      onClick={() => toggleExpand(event.id, event.type)}
                      className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            {title}
                          </h3>
                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            {subtitle}
                          </p>
                        </div>
                        <ChevronDownIcon
                          className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ml-2 ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </button>

                    {/* Expanded content */}
                    {isExpanded && (
                      <div className="border-t border-gray-200 dark:border-gray-600 p-4 space-y-4">
                        {expandedInfo?.loading ? (
                          <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                            Loading...
                          </div>
                        ) : (
                          <>
                            {/* Bills section */}
                            {expandedInfo && expandedInfo.bills.length > 0 && (
                              <div>
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                  Bills ({expandedInfo.bills.length})
                                </h4>
                                <div className="space-y-2">
                                  {expandedInfo.bills.map((bill) => (
                                    <Link
                                      key={bill.id}
                                      href={`/bills/${bill.id}`}
                                      className="block p-2 bg-gray-50 dark:bg-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-500 transition-colors"
                                    >
                                      <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                          {bill.payment_date ? 'Paid' : 'Pending'}
                                        </span>
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                          {formatCurrency(bill.amount, bill.currency)}
                                        </span>
                                      </div>
                                      {bill.payment_date && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                          {formatDate(bill.payment_date)}
                                        </p>
                                      )}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Test Results section (for appointments) */}
                            {isAppointment && expandedInfo?.results && expandedInfo.results.length > 0 && (
                              <div>
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                  Test Results ({expandedInfo.results.length})
                                </h4>
                                <div className="space-y-2">
                                  {expandedInfo.results.map((result) => (
                                    <Link
                                      key={result.id}
                                      href={`/results/${result.id}`}
                                      className="block p-2 bg-gray-50 dark:bg-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-500 transition-colors"
                                    >
                                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                                        {result.test_name}
                                      </div>
                                      {result.value && result.unit && (
                                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                          {result.value} {result.unit}
                                        </div>
                                      )}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* No related data */}
                            {expandedInfo &&
                              expandedInfo.bills.length === 0 &&
                              (!expandedInfo.results || expandedInfo.results.length === 0) && (
                                <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                                  No related bills or results
                                </div>
                              )}

                            {/* View full details link */}
                            <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                              <Link
                                href={href}
                                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                View full details →
                              </Link>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Timeline icon */}
                <div className="relative z-10 flex-shrink-0 w-12 h-12">
                  <div
                    className={`w-12 h-12 rounded-full ${bgColor} flex items-center justify-center shadow-lg`}
                  >
                    <IconComponent className={`w-6 h-6 text-white`} />
                  </div>
                </div>

                {/* Connecting line */}
                <div
                  className={`absolute ${isLeft ? 'right-5/12' : 'left-5/12'} w-8 h-0.5 ${bgColor} opacity-60`}
                  style={{ top: '24px' }}
                ></div>

                {/* Date on opposite side */}
                <div className={`w-5/12 ${isLeft ? 'pl-8' : 'pr-8'} flex items-center ${isLeft ? 'justify-start' : 'justify-end'}`}>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {formatDate(event.date)}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

