'use client'

import { useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { CategoryBreakdown } from '@/lib/dashboard'
import { formatCurrency } from '@/lib/utils'

interface CostBreakdownProps {
  categoryBreakdown: CategoryBreakdown[]
  currency?: string
}

// Color palette for categories
const CATEGORY_COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // orange
  '#8B5CF6', // purple
  '#EF4444', // red
  '#14B8A6', // teal
  '#EC4899', // pink
  '#6366F1', // indigo
]

function getCategoryColor(category: string, index: number): string {
  // Use a consistent color based on category name hash
  const hash = category.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return CATEGORY_COLORS[hash % CATEGORY_COLORS.length]
}

export function CostBreakdown({ categoryBreakdown, currency = 'USD' }: CostBreakdownProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (categoryBreakdown.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <p className="text-gray-600 dark:text-gray-400 text-center">
          No bills data available for breakdown
        </p>
      </div>
    )
  }

  // Calculate totals
  const totalAmount = categoryBreakdown.reduce((sum, cat) => sum + cat.totalAmount, 0)
  const totalInsuranceCoverage = categoryBreakdown.reduce(
    (sum, cat) => sum + cat.insuranceCoverage,
    0
  )
  const totalUserPaid = categoryBreakdown.reduce((sum, cat) => sum + cat.userPaid, 0)
  const overallCoveragePercentage =
    totalAmount > 0 ? (totalInsuranceCoverage / totalAmount) * 100 : 0
  const overallUserPaidPercentage =
    totalAmount > 0 ? (totalUserPaid / totalAmount) * 100 : 0

  // Prepare data for donut chart (user-paid amounts only)
  const donutData = categoryBreakdown
    .filter((cat) => cat.userPaid > 0)
    .map((cat, index) => ({
      name: cat.category,
      value: cat.userPaid,
      color: getCategoryColor(cat.category, index),
    }))

  // Calculate percentages for donut chart
  const donutDataWithPercentages = donutData.map((item) => ({
    ...item,
    percentage:
      totalUserPaid > 0 ? ((item.value / totalUserPaid) * 100).toFixed(1) : '0',
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Column 1: My Money Donut Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          My Money
        </h2>
        {donutData.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 text-center py-8">
            No expenses to display
          </p>
        ) : (
          <>
            <div className="h-64 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutDataWithPercentages}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {donutDataWithPercentages.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value, currency)}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {donutDataWithPercentages.map((item, index) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-gray-900 dark:text-white font-medium">
                      {item.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-900 dark:text-white font-semibold">
                      {item.percentage}%
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 text-xs">
                      {formatCurrency(item.value, currency)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Column 2: Coverage Efficiency */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Coverage Efficiency
        </h2>

        {/* Overall Coverage Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Overall Coverage
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              @ See details
            </span>
          </div>
          <div className="relative h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-green-500 flex items-center justify-center text-white text-xs font-medium"
              style={{ width: `${overallCoveragePercentage}%` }}
            >
              {overallCoveragePercentage > 10 && (
                <span>{overallCoveragePercentage.toFixed(1)}%</span>
              )}
            </div>
            <div
              className="absolute right-0 top-0 h-full bg-orange-500 flex items-center justify-center text-white text-xs font-medium"
              style={{ width: `${overallUserPaidPercentage}%` }}
            >
              {overallUserPaidPercentage > 10 && (
                <span>{overallUserPaidPercentage.toFixed(1)}%</span>
              )}
            </div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-600 dark:text-gray-400">
            <span>
              Coverage: {formatCurrency(totalInsuranceCoverage, currency)}
            </span>
            <span>My Money: {formatCurrency(totalUserPaid, currency)}</span>
          </div>
          <div className="mt-1 text-xs font-semibold text-gray-900 dark:text-white">
            Total: {formatCurrency(totalAmount, currency)}
          </div>
        </div>

        {/* Expandable Category Breakdown */}
        <div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between p-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <span>Dollars Expanded</span>
            <span>{isExpanded ? '−' : '+'}</span>
          </button>

          {isExpanded && (
            <div className="mt-4 space-y-4">
              {categoryBreakdown.map((cat) => {
                const userPaidPercentage = 100 - cat.coveragePercentage
                return (
                  <div key={cat.category}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {cat.category}
                      </span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {cat.coveragePercentage.toFixed(1)}% coverage
                      </span>
                    </div>
                    <div className="relative h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full bg-green-500"
                        style={{ width: `${cat.coveragePercentage}%` }}
                      />
                      <div
                        className="absolute right-0 top-0 h-full bg-orange-500"
                        style={{ width: `${userPaidPercentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-gray-600 dark:text-gray-400">
                      <span>
                        Coverage: {formatCurrency(cat.insuranceCoverage, currency)}
                      </span>
                      <span>My Money: {formatCurrency(cat.userPaid, currency)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

