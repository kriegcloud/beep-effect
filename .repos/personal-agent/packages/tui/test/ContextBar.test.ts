import { AtomRegistry } from "effect/unstable/reactivity"
import { describe, expect, it } from "vitest"
import {
  estimatedContextAtom,
  messagesAtom,
  toolEventsAtom,
  type ContextUsage
} from "../src/atoms/session.js"
import type { ChatMessage, ToolEvent } from "../src/types.js"

// Pure logic tests for the bar rendering helpers

const renderSegment = (label: string, pct: number, barWidth: number): string => {
  const filled = Math.round((pct / 100) * barWidth)
  const empty = barWidth - filled
  return `${label} ${"█".repeat(filled)}${"░".repeat(empty)} ${pct}%`
}

const totalPct = (usage: ContextUsage): number =>
  usage.system + usage.persona + usage.memory + usage.history + usage.tools

const formatTokens = (n: number): string =>
  n >= 1000 ? `${Math.round(n / 1000)}K` : String(n)

describe("ContextBar helpers", () => {
  const usage: ContextUsage = {
    system: 12,
    persona: 4,
    memory: 9,
    history: 38,
    tools: 4,
    totalTokens: 67000,
    capacityTokens: 100000
  }

  it("renders a segment bar", () => {
    const result = renderSegment("sys", 12, 6)
    expect(result).toBe("sys █░░░░░ 12%")
  })

  it("calculates total percentage", () => {
    expect(totalPct(usage)).toBe(67)
  })

  it("formats token counts", () => {
    expect(formatTokens(67000)).toBe("67K")
    expect(formatTokens(500)).toBe("500")
  })
})

describe("estimatedContextAtom", () => {
  it("computes base context with no messages or tools", () => {
    const registry = AtomRegistry.make()
    const usage = registry.get(estimatedContextAtom)
    expect(usage.system).toBe(12)
    expect(usage.persona).toBe(4)
    expect(usage.memory).toBe(9)
    expect(usage.history).toBe(0)
    expect(usage.tools).toBe(0)
    expect(usage.totalTokens).toBe(25000)
    expect(usage.capacityTokens).toBe(100000)
  })

  it("increases history percentage with messages", () => {
    const registry = AtomRegistry.make()
    const msgs: ReadonlyArray<ChatMessage> = Array.from({ length: 10 }, (_, i) => ({
      role: "user" as const,
      content: `msg ${i}`,
      turnId: `t${i}`,
      status: "complete" as const
    }))
    registry.set(messagesAtom, msgs)
    const usage = registry.get(estimatedContextAtom)
    // 10 msgs * 800 tokens = 8000 => 8% of 100K
    expect(usage.history).toBe(8)
    expect(usage.totalTokens).toBe(33000)
  })

  it("increases tools percentage with tool events", () => {
    const registry = AtomRegistry.make()
    const tools: ReadonlyArray<ToolEvent> = Array.from({ length: 6 }, (_, i) => ({
      turnId: `t${i}`,
      toolCallId: `tc${i}`,
      toolName: "test_tool",
      inputJson: "{}",
      outputJson: null,
      isError: false,
      status: "called" as const
    }))
    registry.set(toolEventsAtom, tools)
    const usage = registry.get(estimatedContextAtom)
    // 6 tools * 500 tokens = 3000 => 3% of 100K
    expect(usage.tools).toBe(3)
    expect(usage.totalTokens).toBe(28000)
  })
})
