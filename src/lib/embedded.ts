import { useEffect, useState } from 'react'

// True when the builder runs inside an iframe — iwel.ru/card (Tilda) embeds it, and
// Tilda's round burger menu floats over the top-right corner on phones.
export function useEmbedded() {
  const [embedded, setEmbedded] = useState(false)
  useEffect(() => {
    try { setEmbedded(window.self !== window.top) } catch { setEmbedded(true) }
  }, [])
  return embedded
}
