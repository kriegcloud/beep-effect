import * as Atom from "@effect-atom/atom/Atom"
import * as Registry from "@effect-atom/atom/Registry"

import type {
  SerializedExtraction,
  VisualizationPayload
} from "../shared.js"

export interface ScrollTarget {
  readonly index: number
  readonly behavior: ScrollBehavior
}

export interface VisualizationController {
  readonly total: number
  readonly next: () => void
  readonly prev: () => void
  readonly jumpTo: (index: number) => void
  readonly togglePlay: () => void
  readonly setPlaying: (playing: boolean) => void
  readonly setAnimationSpeed: (seconds: number) => void
  readonly getCurrentIndex: () => number
  readonly subscribeCurrentIndex: (
    onValue: (value: number) => void,
    options?: { readonly immediate?: boolean }
  ) => () => void
  readonly subscribeCurrentExtraction: (
    onValue: (value: SerializedExtraction | undefined) => void,
    options?: { readonly immediate?: boolean }
  ) => () => void
  readonly subscribeStatusText: (
    onValue: (value: string) => void,
    options?: { readonly immediate?: boolean }
  ) => () => void
  readonly subscribePlayButtonLabel: (
    onValue: (value: string) => void,
    options?: { readonly immediate?: boolean }
  ) => () => void
  readonly subscribeScrollTarget: (
    onValue: (value: ScrollTarget | undefined) => void,
    options?: { readonly immediate?: boolean }
  ) => () => void
  readonly dispose: () => void
}

const wrapIndex = (value: number, total: number): number => {
  if (total <= 0) {
    return -1
  }
  const normalized = value % total
  return normalized >= 0 ? normalized : normalized + total
}

const normalizeAnimationSpeed = (seconds: number): number => {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return 1
  }
  return Math.min(Math.max(seconds, 0.05), 30)
}

const makeStatusText = (
  extraction: SerializedExtraction | undefined,
  total: number
): string => {
  if (extraction === undefined || total <= 0) {
    return "Entity 0/0 | Pos [-]"
  }
  return `Entity ${extraction.index + 1}/${total} | Pos [${extraction.start}-${extraction.end}]`
}

export const createVisualizationController = (
  payload: VisualizationPayload
): VisualizationController => {
  const total = payload.extractions.length

  const extractionsAtom = Atom.make(payload.extractions)
  const currentIndexAtom = Atom.make(total > 0 ? 0 : -1)
  const isPlayingAtom = Atom.make(false)
  const animationSpeedAtom = Atom.make(normalizeAnimationSpeed(payload.animationSpeed))

  const currentExtractionAtom = Atom.readable((get) => {
    const currentIndex = get(currentIndexAtom)
    const extractions = get(extractionsAtom)
    if (currentIndex < 0 || currentIndex >= extractions.length) {
      return undefined
    }
    return extractions[currentIndex]
  })

  const statusTextAtom = Atom.readable((get) =>
    makeStatusText(get(currentExtractionAtom), total)
  )

  const playButtonLabelAtom = Atom.readable((get) =>
    get(isPlayingAtom) ? "Pause" : "Play"
  )

  const scrollTargetAtom = Atom.readable((get): ScrollTarget | undefined => {
    const extraction = get(currentExtractionAtom)
    if (extraction === undefined) {
      return undefined
    }
    return {
      index: extraction.index,
      behavior: get(isPlayingAtom) ? "smooth" : "auto"
    }
  })

  const registry = Registry.make()

  const next = () => {
    if (total <= 0) {
      return
    }
    registry.update(currentIndexAtom, (current) => wrapIndex(current + 1, total))
  }

  const prev = () => {
    if (total <= 0) {
      return
    }
    registry.update(currentIndexAtom, (current) => wrapIndex(current - 1, total))
  }

  const jumpTo = (index: number) => {
    if (total <= 0 || !Number.isFinite(index)) {
      return
    }
    registry.set(currentIndexAtom, wrapIndex(Math.trunc(index), total))
  }

  const setPlaying = (playing: boolean) => {
    if (total <= 0) {
      registry.set(isPlayingAtom, false)
      return
    }
    registry.set(isPlayingAtom, playing)
  }

  const togglePlay = () => {
    if (total <= 0) {
      registry.set(isPlayingAtom, false)
      return
    }
    registry.update(isPlayingAtom, (current) => !current)
  }

  const setAnimationSpeed = (seconds: number) => {
    registry.set(animationSpeedAtom, normalizeAnimationSpeed(seconds))
  }

  let playbackTimer: ReturnType<typeof setInterval> | undefined

  const clearPlaybackTimer = () => {
    if (playbackTimer !== undefined) {
      clearInterval(playbackTimer)
      playbackTimer = undefined
    }
  }

  const restartPlaybackTimer = () => {
    clearPlaybackTimer()
    if (!registry.get(isPlayingAtom) || total <= 0) {
      return
    }
    const delayMs = Math.max(50, Math.round(registry.get(animationSpeedAtom) * 1000))
    playbackTimer = globalThis.setInterval(() => {
      next()
    }, delayMs)
  }

  const cancelPlayingSubscription = registry.subscribe(
    isPlayingAtom,
    () => restartPlaybackTimer(),
    { immediate: true }
  )

  const cancelSpeedSubscription = registry.subscribe(
    animationSpeedAtom,
    () => restartPlaybackTimer(),
    { immediate: true }
  )

  const subscribeCurrentIndex = (
    onValue: (value: number) => void,
    options?: { readonly immediate?: boolean }
  ) =>
    registry.subscribe(currentIndexAtom, onValue, {
      immediate: options?.immediate ?? true
    })

  const subscribeCurrentExtraction = (
    onValue: (value: SerializedExtraction | undefined) => void,
    options?: { readonly immediate?: boolean }
  ) =>
    registry.subscribe(currentExtractionAtom, onValue, {
      immediate: options?.immediate ?? true
    })

  const subscribeStatusText = (
    onValue: (value: string) => void,
    options?: { readonly immediate?: boolean }
  ) =>
    registry.subscribe(statusTextAtom, onValue, {
      immediate: options?.immediate ?? true
    })

  const subscribePlayButtonLabel = (
    onValue: (value: string) => void,
    options?: { readonly immediate?: boolean }
  ) =>
    registry.subscribe(playButtonLabelAtom, onValue, {
      immediate: options?.immediate ?? true
    })

  const subscribeScrollTarget = (
    onValue: (value: ScrollTarget | undefined) => void,
    options?: { readonly immediate?: boolean }
  ) =>
    registry.subscribe(scrollTargetAtom, onValue, {
      immediate: options?.immediate ?? true
    })

  const dispose = () => {
    clearPlaybackTimer()
    cancelPlayingSubscription()
    cancelSpeedSubscription()
    registry.dispose()
  }

  return {
    total,
    next,
    prev,
    jumpTo,
    togglePlay,
    setPlaying,
    setAnimationSpeed,
    getCurrentIndex: () => registry.get(currentIndexAtom),
    subscribeCurrentIndex,
    subscribeCurrentExtraction,
    subscribeStatusText,
    subscribePlayButtonLabel,
    subscribeScrollTarget,
    dispose
  }
}
