import { useState, useEffect } from 'react'

interface LoadingStateOptions {
  /** Minimum time to show loading state (prevents flash) */
  minLoadingTime?: number
  /** Maximum time to show loading state (prevents infinite loading) */
  maxLoadingTime?: number
  /** Auto-hide loading after this time regardless of state */
  autoHideAfter?: number
}

export function useLoadingState(
  isLoading: boolean,
  options: LoadingStateOptions = {}
) {
  const {
    minLoadingTime = 500, // 500ms minimum
    maxLoadingTime = 10000, // 10 seconds maximum
    autoHideAfter = 15000 // 15 seconds auto-hide
  } = options

  const [showLoading, setShowLoading] = useState(isLoading)
  const [startTime, setStartTime] = useState<number | null>(null)

  useEffect(() => {
    if (isLoading) {
      setStartTime(Date.now())
      setShowLoading(true)

      // Auto-hide after maximum time
      const maxTimer = setTimeout(() => {
        console.warn('Loading state auto-hidden after maximum time')
        setShowLoading(false)
      }, maxLoadingTime)

      // Auto-hide after absolute maximum time
      const autoHideTimer = setTimeout(() => {
        console.warn('Loading state force-hidden after auto-hide time')
        setShowLoading(false)
      }, autoHideAfter)

      return () => {
        clearTimeout(maxTimer)
        clearTimeout(autoHideTimer)
      }
    } else {
      // When loading stops, enforce minimum loading time
      if (startTime) {
        const elapsedTime = Date.now() - startTime
        const remainingTime = Math.max(0, minLoadingTime - elapsedTime)

        if (remainingTime > 0) {
          setTimeout(() => {
            setShowLoading(false)
          }, remainingTime)
        } else {
          setShowLoading(false)
        }
      } else {
        setShowLoading(false)
      }
    }
  }, [isLoading, startTime, minLoadingTime, maxLoadingTime, autoHideAfter])

  return showLoading
} 