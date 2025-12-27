'use client'

import { NavLink } from '@/components/ui/nav-link'

export function Navigation() {
  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-1">
            <NavLink href="/">Dashboard</NavLink>
            <NavLink href="/appointments">Appointments</NavLink>
            <NavLink href="/results">Results</NavLink>
            <NavLink href="/bills">Bills</NavLink>
            <NavLink href="/medications">Medications</NavLink>
            <NavLink href="/insurances">Insurance</NavLink>
          </div>
        </div>
      </div>
    </nav>
  )
}
