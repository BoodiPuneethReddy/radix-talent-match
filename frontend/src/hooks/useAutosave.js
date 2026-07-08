import { useEffect, useRef } from 'react'

export function useAutosave(value, onSave, delay = 700) {
  const timerRef = useRef(null)

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => onSave(value), delay)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [value, onSave, delay])
}
