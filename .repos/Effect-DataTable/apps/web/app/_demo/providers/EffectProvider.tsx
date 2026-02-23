"use client"

import { RegistryProvider } from "@effect-atom/atom-react"

export function EffectProvider({ children }: { children: React.ReactNode }) {
  return (
    <RegistryProvider defaultIdleTTL={30000}>
      {children}
    </RegistryProvider>
  )
}
