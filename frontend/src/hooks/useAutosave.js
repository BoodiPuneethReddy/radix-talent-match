import { useEffect } from 'react'

export function useAutosave(value, onAutosave, delay = 1200) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onAutosave(value)
    }, delay)
    return () => clearTimeout(timer)
  }, [value, onAutosave, delay])
}
