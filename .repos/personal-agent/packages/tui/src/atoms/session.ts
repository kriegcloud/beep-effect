import { Atom } from "effect/unstable/reactivity"
import type {
  ChannelSummary,
  ChatMessage,
  ConnectionStatus,
  ModalId,
  PendingCheckpoint,
  ToolEvent
} from "../types.js"
import { type ThemeId, defaultThemeId } from "../theme.js"

// --- Writable atoms (source of truth) ---

export const channelIdAtom = Atom.make<string>("")
export const messagesAtom = Atom.make<ReadonlyArray<ChatMessage>>([])
export const toolEventsAtom = Atom.make<ReadonlyArray<ToolEvent>>([])
export const connectionStatusAtom = Atom.make<ConnectionStatus>("disconnected")
export const isStreamingAtom = Atom.make<boolean>(false)
export const inputHistoryAtom = Atom.make<ReadonlyArray<string>>([])
export const modalAtom = Atom.make<ModalId | null>(null)
export const themeIdAtom = Atom.make<ThemeId>(defaultThemeId)
export const availableChannelsAtom = Atom.make<ReadonlyArray<ChannelSummary>>([])

// --- Derived atoms (computed) ---

export const messageCountAtom = Atom.make((get: Atom.Context) => get(messagesAtom).length)

export const pendingCheckpointAtom = Atom.make((get: Atom.Context): PendingCheckpoint | null => {
  const msgs = get(messagesAtom)
  if (msgs.length === 0) return null
  const last = msgs[msgs.length - 1]!
  if (last.status !== "checkpoint_required" || !last.checkpointId || !last.checkpointAction) return null
  return {
    checkpointId: last.checkpointId,
    action: last.checkpointAction,
    reason: last.checkpointReason ?? ""
  }
})

// --- Context usage ---

export interface ContextUsage {
  readonly system: number // percentage 0-100
  readonly persona: number
  readonly memory: number
  readonly history: number
  readonly tools: number
  readonly totalTokens: number
  readonly capacityTokens: number
}

/** Writable atom — will be set from server-provided token metrics once available. */
export const contextUsageAtom = Atom.make<ContextUsage>({
  system: 12,
  persona: 4,
  memory: 9,
  history: 0,
  tools: 0,
  totalTokens: 0,
  capacityTokens: 100000
})

export const estimatedContextAtom = Atom.make((get: Atom.Context): ContextUsage => {
  const msgs = get(messagesAtom)
  const tools = get(toolEventsAtom)
  const capacity = 100000
  const systemTokens = 12000
  const personaTokens = 4000
  const memoryTokens = 9000
  const historyTokens = msgs.length * 800
  const toolTokens = tools.length * 500
  const total = systemTokens + personaTokens + memoryTokens + historyTokens + toolTokens
  const pct = (n: number) => Math.round((n / capacity) * 100)
  return {
    system: pct(systemTokens),
    persona: pct(personaTokens),
    memory: pct(memoryTokens),
    history: pct(historyTokens),
    tools: pct(toolTokens),
    totalTokens: total,
    capacityTokens: capacity
  }
})
