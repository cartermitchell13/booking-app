'use client'

import React from 'react'
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary'

interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <h2 className="text-lg font-semibold text-gray-900 text-center mb-2">
          Something went wrong
        </h2>
        
        <p className="text-sm text-gray-600 text-center mb-4">
          We encountered an unexpected error. Please try refreshing the page.
        </p>
        
        {process.env.NODE_ENV === 'development' && (
          <details className="mb-4 p-3 bg-gray-100 rounded text-xs">
            <summary className="cursor-pointer text-gray-700 font-medium">
              Error Details (Development)
            </summary>
            <pre className="mt-2 text-red-600 overflow-auto">
              {error.message}
              {error.stack}
            </pre>
          </details>
        )}
        
        <div className="flex space-x-3">
          <button
            onClick={resetErrorBoundary}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="flex-1 bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  )
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
}

export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  return (
    <ReactErrorBoundary
      FallbackComponent={fallback || ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('ErrorBoundary caught an error:', error, errorInfo)
      }}
      onReset={() => {
        // Optional: Clear any cached data or reset state
        if (typeof window !== 'undefined') {
          window.location.href = '/'
        }
      }}
    >
      {children}
    </ReactErrorBoundary>
  )
} 