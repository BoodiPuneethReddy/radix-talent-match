import { useState } from 'react'

export function useToast() {
  const [toasts, setToasts] = useState([])

  const pushToast = (message, type = 'info') => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3500)
  }

  return { toasts, pushToast }
}
