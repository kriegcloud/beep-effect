"use client"

import { createContext, type ReactNode, useCallback, useContext, useState } from "react"

interface SoundSettingsContextValue {
  isMuted: boolean
  toggleMute: () => void
}

const SoundSettingsContext = createContext<SoundSettingsContextValue | undefined>(undefined)

export function SoundSettingsProvider({ children }: { children: ReactNode }) {
  const [isMuted, setIsMuted] = useState(false)

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev)
  }, [])

  return <SoundSettingsContext.Provider value={{ isMuted, toggleMute }}>{children}</SoundSettingsContext.Provider>
}

export function useSoundSettings() {
  const context = useContext(SoundSettingsContext)
  if (context === undefined) {
    throw new Error("useSoundSettings must be used within a SoundSettingsProvider")
  }
  return context
}
