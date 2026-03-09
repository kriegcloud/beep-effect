"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function AutoRefresh() {
  const router = useRouter()

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return

    const ws = new WebSocket("ws://localhost:3201")

    ws.onmessage = () => {
      console.log("🔄 Content changed, refreshing...")
      router.refresh()
    }

    ws.onerror = () => {
      // Silently fail if watcher isn't running
    }

    return () => {
      ws.close()
    }
  }, [router])

  return null
}
