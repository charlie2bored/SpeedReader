import { useRef, useCallback, useEffect } from 'react'

/**
 * Custom hook for high-precision timing using requestAnimationFrame and performance.now()
 * Ensures accurate word timing even with frame drops, preventing "drifting" behind target WPM
 *
 * @param {Function} callback - Function to call when timer fires
 * @param {number} intervalMs - Target interval in milliseconds
 * @param {boolean} isActive - Whether the timer should be running
 * @returns {Object} - Control functions for the timer
 */
export function usePreciseTimer(callback, intervalMs, isActive) {
  const rafIdRef = useRef(null)
  const startTimeRef = useRef(null)
  const targetTimeRef = useRef(null)
  const callbackRef = useRef(callback)

  // Keep callback reference updated
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const start = useCallback(() => {
    if (!isActive || rafIdRef.current) return

    startTimeRef.current = performance.now()
    targetTimeRef.current = startTimeRef.current

    const tick = () => {
      const currentTime = performance.now()

      // Check if we've reached the target time
      if (currentTime >= targetTimeRef.current) {
        // Execute callback
        callbackRef.current()

        // Schedule next execution
        targetTimeRef.current += intervalMs
      }

      // Continue the animation frame loop
      rafIdRef.current = requestAnimationFrame(tick)
    }

    rafIdRef.current = requestAnimationFrame(tick)
  }, [isActive, intervalMs])

  const stop = useCallback(() => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current)
      rafIdRef.current = null
    }
  }, [])

  const reset = useCallback(() => {
    stop()
    startTimeRef.current = null
    targetTimeRef.current = null
  }, [stop])

  // Auto-start/stop based on isActive
  useEffect(() => {
    if (isActive) {
      start()
    } else {
      stop()
    }

    return () => stop()
  }, [isActive, start, stop])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
      }
    }
  }, [])

  return { start, stop, reset }
}
