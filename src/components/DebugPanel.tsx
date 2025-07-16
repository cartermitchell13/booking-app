'use client'

import { useState } from 'react'
import { useTenant } from '@/lib/tenant-context'
import { useAuth } from '@/lib/auth-context'
import { usePathname } from 'next/navigation'

interface DebugPanelProps {
  tripsLoading?: boolean
  tripsError?: string
  tripsCount?: number
}

export function DebugPanel({ tripsLoading, tripsError, tripsCount }: DebugPanelProps) {
  const [isVisible, setIsVisible] = useState(false)
  const { tenant, isLoading: tenantLoading } = useTenant()
  const { user, isLoading: authLoading } = useAuth()
  const pathname = usePathname()

  if (process.env.NODE_ENV !== 'development') return null

  return (
    <>
      {/* Debug Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-2 rounded-full shadow-lg z-50 text-xs"
        style={{ display: isVisible ? 'none' : 'block' }}
      >
        DEBUG
      </button>

      {/* Debug Panel */}
      {isVisible && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-xl z-50 max-w-md text-xs">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">Debug Panel</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-2">
            <div>
              <strong>Current Path:</strong> {pathname}
            </div>
            
            <div>
              <strong>Tenant:</strong> {tenantLoading ? 'Loading...' : tenant?.name || 'None'}
            </div>
            
            <div>
              <strong>Auth:</strong> {authLoading ? 'Loading...' : user?.email || 'Not authenticated'}
            </div>
            
            <div>
              <strong>Trips:</strong> {tripsLoading ? 'Loading...' : `${tripsCount || 0} trips`}
            </div>
            
            {tripsError && (
              <div className="text-red-400">
                <strong>Trips Error:</strong> {tripsError}
              </div>
            )}
            
            <div className="mt-2 pt-2 border-t border-gray-700">
              <strong>Loading States:</strong>
              <div className="ml-2">
                • Tenant: {tenantLoading ? '🔄' : '✅'}
                <br />
                • Auth: {authLoading ? '🔄' : '✅'}
                <br />
                • Trips: {tripsLoading ? '🔄' : '✅'}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 