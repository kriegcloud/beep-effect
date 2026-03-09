"use client"

import { useCallback, useEffect, useRef } from "react"
import { useSoundSettings } from "./useSoundSettings"

interface ToneOptions {
  delay?: number
  duration?: number
  frequency?: number
  type?: OscillatorType
  volume?: number
  force?: boolean
}

// Global state to track user interaction (shared across all instances)
let hasUserInteracted = false
let listenersInitialized = false

// Set up interaction listeners once globally
const initializeInteractionListeners = () => {
  if (listenersInitialized) return
  listenersInitialized = true

  const handleFirstInteraction = () => {
    hasUserInteracted = true
    document.removeEventListener("click", handleFirstInteraction)
    document.removeEventListener("keydown", handleFirstInteraction)
    document.removeEventListener("touchend", handleFirstInteraction)
  }

  document.addEventListener("click", handleFirstInteraction, { once: true })
  document.addEventListener("keydown", handleFirstInteraction, { once: true })
  document.addEventListener("touchend", handleFirstInteraction, { once: true })
}

// Lightweight Web Audio helper for short UI tones.
export function useTonePlayer() {
  const audioContextRef = useRef<AudioContext | null>(null)
  const isInitializedRef = useRef(false)
  const isPlayingRef = useRef(false)
  const { isMuted } = useSoundSettings()

  // Initialize listeners once on first hook mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      initializeInteractionListeners()
    }
  }, [])

  const getContext = useCallback(async () => {
    if (typeof window === "undefined") {
      return null
    }

    const browserWindow = window as typeof window & {
      webkitAudioContext?: typeof AudioContext
    }

    const AudioContextCtor = browserWindow.AudioContext ?? browserWindow.webkitAudioContext

    if (!AudioContextCtor) {
      return null
    }

    // Create context lazily on first play attempt
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextCtor()
    }

    const context = audioContextRef.current

    // Only attempt to resume if suspended and we haven't failed before
    if (context.state === "suspended") {
      try {
        await context.resume()
        isInitializedRef.current = true
      } catch {
        // Browser blocked - not in user gesture context
        return null
      }
    }

    // Don't proceed if context isn't running
    if (context.state !== "running") {
      return null
    }

    isInitializedRef.current = true
    return context
  }, [])

  const playTone = useCallback(
    async (options?: ToneOptions) => {
      const force = options?.force === true

      if (isMuted && !force) {
        return
      }

      // Don't play anything until user has interacted
      if (!hasUserInteracted) {
        return
      }

      // Skip if already playing (prevent overlaps/queuing)
      if (isPlayingRef.current && !force) {
        return
      }

      // Check permission/state before attempting to play
      const context = await getContext()

      if (!context) {
        // Context not available (no user gesture or browser blocked)
        return
      }

      isPlayingRef.current = true

      const { delay = 0, duration = 0.08, frequency = 660, type = "sine", volume = 0.04 } = options ?? {}

      const oscillator = context.createOscillator()
      oscillator.type = type
      oscillator.frequency.value = frequency

      const gain = context.createGain()
      oscillator.connect(gain)
      gain.connect(context.destination)

      const startAt = context.currentTime + delay
      const stopAt = startAt + duration

      gain.gain.setValueAtTime(volume, startAt)
      gain.gain.exponentialRampToValueAtTime(0.0001, stopAt)

      oscillator.start(startAt)
      oscillator.stop(stopAt + 0.02)

      // Reset playing flag after tone completes
      const totalDuration = (delay + duration + 0.02) * 1000
      setTimeout(() => {
        isPlayingRef.current = false
      }, totalDuration)
    },
    [getContext, isMuted],
  )

  return { playTone }
}
