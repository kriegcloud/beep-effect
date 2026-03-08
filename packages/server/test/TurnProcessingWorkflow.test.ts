import { describe, expect, it } from "@effect/vitest"
import { DateTime, Option } from "effect"
import * as Prompt from "effect/unstable/ai/Prompt"
import * as Response from "effect/unstable/ai/Response"
import {
  inferToolChoice,
  makeUserTurn,
  makeAssistantTurn,
  toPromptText,
  toTurnModelFailure,
  isRequiresApprovalToolFailure,
  toModelFailureMessage,
  toModelFailureAuditReason,
  TurnModelFailure,
  type ProcessTurnPayload
} from "../src/turn/TurnProcessingWorkflow.js"
import { toProviderConfigOverride } from "../src/ai/ProviderGenerationConfig.js"
import { sanitizePromptForAnthropic } from "../src/ai/ProviderPromptPolicy.js"
import {
  isProviderCreditExhaustedReason,
  looksLikeProviderCreditExhausted,
  normalizeProviderModelFailureReason
} from "../src/ai/ProviderErrorNormalization.js"
import { RequiresApprovalToolFailure } from "../src/ai/ToolRegistry.js"
import { addOptional, makeLoopCapResponse, mergeUsage, zeroUsage } from "../src/turn/TurnLoopUsage.js"
import { findPendingToolCallIdForReplay } from "../src/turn/replay/TurnReplayHelpers.js"

const makePayload = (overrides: Partial<ProcessTurnPayload> = {}): ProcessTurnPayload => ({
  turnId: overrides.turnId ?? "turn:test-1",
  sessionId: overrides.sessionId ?? "session:test-1",
  conversationId: overrides.conversationId ?? "conversation:test-1",
  agentId: overrides.agentId ?? "agent:test-1",
  userId: overrides.userId ?? "user:test-1",
  channelId: overrides.channelId ?? "channel:test-1",
  content: overrides.content ?? "hello world",
  contentBlocks: overrides.contentBlocks ?? [{ contentBlockType: "TextBlock" as const, text: "hello world" }],
  createdAt: overrides.createdAt ?? DateTime.fromDateUnsafe(new Date("2026-02-24T12:00:00.000Z")),
  inputTokens: overrides.inputTokens ?? 10
})

describe("inferToolChoice", () => {
  it("returns shell_execute for 'run ...'", () => {
    expect(inferToolChoice("run ls -la")).toEqual({ toolChoice: { tool: "shell_execute" } })
  })

  it("returns shell_execute for 'execute ...'", () => {
    expect(inferToolChoice("execute npm test")).toEqual({ toolChoice: { tool: "shell_execute" } })
  })

  it("returns shell_execute for 'ls' alone", () => {
    expect(inferToolChoice("ls")).toEqual({ toolChoice: { tool: "shell_execute" } })
  })

  it("returns shell_execute for 'ls -la'", () => {
    expect(inferToolChoice("ls -la")).toEqual({ toolChoice: { tool: "shell_execute" } })
  })

  it("returns shell_execute for 'pwd'", () => {
    expect(inferToolChoice("pwd")).toEqual({ toolChoice: { tool: "shell_execute" } })
  })

  it("returns shell_execute for 'cat file.txt'", () => {
    expect(inferToolChoice("cat file.txt")).toEqual({ toolChoice: { tool: "shell_execute" } })
  })

  it("returns shell_execute for 'echo hello'", () => {
    expect(inferToolChoice("echo hello")).toEqual({ toolChoice: { tool: "shell_execute" } })
  })

  it("is case insensitive", () => {
    expect(inferToolChoice("RUN ls")).toEqual({ toolChoice: { tool: "shell_execute" } })
  })

  it("trims whitespace", () => {
    expect(inferToolChoice("  run ls  ")).toEqual({ toolChoice: { tool: "shell_execute" } })
  })

  it("returns empty for empty string", () => {
    expect(inferToolChoice("")).toEqual({})
  })

  it("returns empty for whitespace-only", () => {
    expect(inferToolChoice("   ")).toEqual({})
  })

  it("returns empty for normal message", () => {
    expect(inferToolChoice("what is the weather?")).toEqual({})
  })

  it("returns empty for 'listing' (partial match)", () => {
    expect(inferToolChoice("listing files")).toEqual({})
  })

  it("returns empty for 'runner' (partial match of 'run')", () => {
    expect(inferToolChoice("runner script")).toEqual({})
  })
})

describe("toProviderConfigOverride", () => {
  it("maps temperature for any provider", () => {
    expect(toProviderConfigOverride("anthropic", { temperature: 0.5 })).toEqual({ temperature: 0.5 })
  })

  it("maps topP as top_p", () => {
    expect(toProviderConfigOverride("anthropic", { topP: 0.9 })).toEqual({ top_p: 0.9 })
  })

  it("maps maxOutputTokens to max_tokens for anthropic", () => {
    expect(toProviderConfigOverride("anthropic", { maxOutputTokens: 1024 })).toEqual({ max_tokens: 1024 })
  })

  it("maps maxOutputTokens to max_output_tokens for openai", () => {
    expect(toProviderConfigOverride("openai", { maxOutputTokens: 1024 })).toEqual({ max_output_tokens: 1024 })
  })

  it("maps maxOutputTokens to max_output_tokens for openrouter", () => {
    expect(toProviderConfigOverride("openrouter", { maxOutputTokens: 2048 })).toEqual({ max_output_tokens: 2048 })
  })

  it("maps maxOutputTokens to max_output_tokens for google", () => {
    expect(toProviderConfigOverride("google", { maxOutputTokens: 512 })).toEqual({ max_output_tokens: 512 })
  })

  it("returns empty object when no config provided", () => {
    expect(toProviderConfigOverride("anthropic", {})).toEqual({})
  })

  it("combines all fields for anthropic", () => {
    expect(toProviderConfigOverride("anthropic", { temperature: 0.7, topP: 0.95, maxOutputTokens: 4096 }))
      .toEqual({ temperature: 0.7, top_p: 0.95, max_tokens: 4096 })
  })

  it("ignores maxOutputTokens for unknown provider", () => {
    expect(toProviderConfigOverride("unknown", { maxOutputTokens: 1024 })).toEqual({})
  })
})

describe("toModelFailureMessage", () => {
  it("returns string errors as-is", () => {
    expect(toModelFailureMessage("something broke")).toBe("something broke")
  })

  it("extracts Error.message", () => {
    expect(toModelFailureMessage(new Error("oops"))).toBe("oops")
  })

  it("extracts .reason from object", () => {
    expect(toModelFailureMessage({ reason: "credit problem" })).toBe("credit problem")
  })

  it("extracts .message from object", () => {
    expect(toModelFailureMessage({ message: "bad request" })).toBe("bad request")
  })

  it("prefers .reason over .message", () => {
    expect(toModelFailureMessage({ reason: "from reason", message: "from message" })).toBe("from reason")
  })

  it("skips empty .reason, falls through to .message", () => {
    expect(toModelFailureMessage({ reason: "", message: "fallback" })).toBe("fallback")
  })

  it("falls back to String() for other types", () => {
    expect(toModelFailureMessage(42)).toBe("42")
  })

  it("falls back to String() for null", () => {
    expect(toModelFailureMessage(null)).toBe("null")
  })

  it("falls back to String() for undefined", () => {
    expect(toModelFailureMessage(undefined)).toBe("undefined")
  })
})

describe("isRequiresApprovalToolFailure", () => {
  it("returns true for tagged RequiresApproval tool failures", () => {
    expect(
      isRequiresApprovalToolFailure(
        new RequiresApprovalToolFailure({
          errorCode: "RequiresApproval",
          message: "approval required"
        })
      )
    ).toBe(true)
  })

  it("returns false for other failures", () => {
    expect(isRequiresApprovalToolFailure(new Error("OtherError"))).toBe(false)
  })

  it("returns false for non-object values", () => {
    expect(isRequiresApprovalToolFailure("RequiresApproval")).toBe(false)
  })
})

describe("looksLikeProviderCreditExhausted", () => {
  it("detects 'credit balance is too low'", () => {
    expect(looksLikeProviderCreditExhausted("Your credit balance is too low")).toBe(true)
  })

  it("detects 'insufficient credits'", () => {
    expect(looksLikeProviderCreditExhausted("Insufficient credits remaining")).toBe(true)
  })

  it("detects 'insufficient_quota'", () => {
    expect(looksLikeProviderCreditExhausted("Error: insufficient_quota")).toBe(true)
  })

  it("detects 'billing'", () => {
    expect(looksLikeProviderCreditExhausted("billing issue detected")).toBe(true)
  })

  it("is case insensitive", () => {
    expect(looksLikeProviderCreditExhausted("INSUFFICIENT CREDITS")).toBe(true)
  })

  it("returns false for unrelated errors", () => {
    expect(looksLikeProviderCreditExhausted("timeout error")).toBe(false)
  })
})

describe("findPendingToolCallIdForReplay", () => {
  it("returns exact unresolved tool-call id", () => {
    const history = Prompt.fromMessages([
      Prompt.assistantMessage({
        content: [
          Prompt.makePart("tool-call", {
            id: "toolu_exact",
            name: "shell_execute",
            params: { command: "ps aux" },
            providerExecuted: false
          })
        ]
      })
    ])

    const result = findPendingToolCallIdForReplay(history, {
      toolName: "shell_execute",
      input: { command: "ps aux" }
    })

    expect(Option.isSome(result)).toBe(true)
    if (Option.isSome(result)) {
      expect(result.value).toBe("toolu_exact")
    }
  })

  it("does not return resolved tool-call ids", () => {
    const history = Prompt.fromMessages([
      Prompt.assistantMessage({
        content: [
          Prompt.makePart("tool-call", {
            id: "toolu_resolved",
            name: "shell_execute",
            params: { command: "ps aux" },
            providerExecuted: false
          })
        ]
      }),
      Prompt.toolMessage({
        content: [
          Prompt.makePart("tool-result", {
            id: "toolu_resolved",
            name: "shell_execute",
            isFailure: false,
            result: { ok: true }
          })
        ]
      })
    ])

    const result = findPendingToolCallIdForReplay(history, {
      toolName: "shell_execute",
      input: { command: "ps aux" }
    })

    expect(Option.isNone(result)).toBe(true)
  })

  it("matches input regardless of object key order", () => {
    const history = Prompt.fromMessages([
      Prompt.assistantMessage({
        content: [
          Prompt.makePart("tool-call", {
            id: "toolu_order",
            name: "shell_execute",
            params: { b: 2, a: 1 },
            providerExecuted: false
          })
        ]
      })
    ])

    const result = findPendingToolCallIdForReplay(history, {
      toolName: "shell_execute",
      input: { a: 1, b: 2 }
    })

    expect(Option.isSome(result)).toBe(true)
    if (Option.isSome(result)) {
      expect(result.value).toBe("toolu_order")
    }
  })

  it("falls back to unique unresolved call by tool name when params differ", () => {
    const history = Prompt.fromMessages([
      Prompt.assistantMessage({
        content: [
          Prompt.makePart("tool-call", {
            id: "toolu_unique_name",
            name: "shell_execute",
            params: { command: "ps aux", timeoutMs: 30_000 },
            providerExecuted: false
          })
        ]
      })
    ])

    const result = findPendingToolCallIdForReplay(history, {
      toolName: "shell_execute",
      input: { command: "ps aux" }
    })

    expect(Option.isSome(result)).toBe(true)
    if (Option.isSome(result)) {
      expect(result.value).toBe("toolu_unique_name")
    }
  })

  it("returns none when multiple unresolved calls exist for same tool with no exact match", () => {
    const history = Prompt.fromMessages([
      Prompt.assistantMessage({
        content: [
          Prompt.makePart("tool-call", {
            id: "toolu_1",
            name: "shell_execute",
            params: { command: "ls" },
            providerExecuted: false
          }),
          Prompt.makePart("tool-call", {
            id: "toolu_2",
            name: "shell_execute",
            params: { command: "pwd" },
            providerExecuted: false
          })
        ]
      })
    ])

    const result = findPendingToolCallIdForReplay(history, {
      toolName: "shell_execute",
      input: { command: "ps aux" }
    })

    expect(Option.isNone(result)).toBe(true)
  })
})

describe("isProviderCreditExhaustedReason", () => {
  it("returns true for prefixed reasons", () => {
    expect(isProviderCreditExhaustedReason("provider_credit_exhausted: something")).toBe(true)
  })

  it("returns false for unprefixed reasons", () => {
    expect(isProviderCreditExhaustedReason("some other error")).toBe(false)
  })
})

describe("normalizeProviderModelFailureReason", () => {
  it("returns 'model_error' for empty string", () => {
    expect(normalizeProviderModelFailureReason("")).toBe("model_error")
  })

  it("returns 'model_error' for whitespace-only", () => {
    expect(normalizeProviderModelFailureReason("   ")).toBe("model_error")
  })

  it("preserves already-prefixed credit exhausted reasons", () => {
    expect(normalizeProviderModelFailureReason("provider_credit_exhausted: foo")).toBe("provider_credit_exhausted: foo")
  })

  it("wraps credit-like reasons with prefix", () => {
    expect(normalizeProviderModelFailureReason("Your credit balance is too low"))
      .toBe("provider_credit_exhausted: Your credit balance is too low")
  })

  it("returns other reasons as-is", () => {
    expect(normalizeProviderModelFailureReason("timeout")).toBe("timeout")
  })

  it("trims whitespace", () => {
    expect(normalizeProviderModelFailureReason("  timeout  ")).toBe("timeout")
  })
})

describe("toModelFailureAuditReason", () => {
  it("returns credit_exhausted audit code for prefixed reasons", () => {
    expect(toModelFailureAuditReason("provider_credit_exhausted: low balance"))
      .toBe("turn_processing_provider_credit_exhausted")
  })

  it("returns model_error audit code for other reasons", () => {
    expect(toModelFailureAuditReason("timeout")).toBe("turn_processing_model_error")
  })
})

describe("toTurnModelFailure", () => {
  it("wraps string error", () => {
    const result = toTurnModelFailure("turn:1", "something broke")
    expect(result).toBeInstanceOf(TurnModelFailure)
    expect(result.turnId).toBe("turn:1")
    expect(result.reason).toBe("something broke")
  })

  it("wraps Error", () => {
    const result = toTurnModelFailure("turn:1", new Error("oops"))
    expect(result.reason).toBe("oops")
  })

  it("preserves turnId from existing TurnModelFailure", () => {
    const original = new TurnModelFailure({ turnId: "turn:original", reason: "original reason" })
    const result = toTurnModelFailure("turn:wrapper", original)
    expect(result.turnId).toBe("turn:original")
    expect(result.reason).toBe("original reason")
  })

  it("normalizes credit exhaustion reasons", () => {
    const result = toTurnModelFailure("turn:1", "Your credit balance is too low")
    expect(result.reason).toBe("provider_credit_exhausted: Your credit balance is too low")
  })

  it("normalizes empty reason to model_error", () => {
    const result = toTurnModelFailure("turn:1", "")
    expect(result.reason).toBe("model_error")
  })
})

describe("toPromptText", () => {
  it("extracts text from TextBlock content blocks", () => {
    const blocks = [
      { contentBlockType: "TextBlock" as const, text: "hello" },
      { contentBlockType: "TextBlock" as const, text: "world" }
    ]
    expect(toPromptText("fallback", blocks)).toBe("hello\nworld")
  })

  it("returns fallback when no TextBlocks", () => {
    const blocks = [{ contentBlockType: "ToolCallBlock" as const, toolName: "x", args: {} }]
    expect(toPromptText("fallback", blocks as any)).toBe("fallback")
  })

  it("returns fallback for empty array", () => {
    expect(toPromptText("fallback", [])).toBe("fallback")
  })

  it("returns fallback when TextBlocks are whitespace-only", () => {
    const blocks = [{ contentBlockType: "TextBlock" as const, text: "   " }]
    expect(toPromptText("fallback", blocks)).toBe("fallback")
  })

  it("filters out non-TextBlock types", () => {
    const blocks = [
      { contentBlockType: "TextBlock" as const, text: "keep" },
      { contentBlockType: "ToolResultBlock" as const, content: "discard" }
    ]
    expect(toPromptText("fallback", blocks as any)).toBe("keep")
  })
})

describe("sanitizePromptForAnthropic", () => {
  it("removes empty text parts while preserving tool parts", () => {
    const prompt = Prompt.make([
      {
        role: "system",
        content: "   "
      },
      {
        role: "user",
        content: [
          { type: "text", text: "   " },
          { type: "text", text: "hello world" }
        ]
      },
      {
        role: "assistant",
        content: [
          { type: "text", text: "" },
          {
            type: "tool-call",
            id: "tool_1",
            name: "shell_execute",
            params: { command: "pwd" },
            providerExecuted: false
          }
        ]
      }
    ])

    const sanitized = sanitizePromptForAnthropic(prompt)

    expect(sanitized.content.some((message) => message.role === "system")).toBe(false)

    const textParts: Array<{ readonly text: string }> = []
    let sawToolCall = false

    for (const message of sanitized.content) {
      if (message.role === "system") {
        continue
      }

      for (const part of message.content) {
        if (part.type === "text") {
          textParts.push({ text: part.text })
        }
        if (part.type === "tool-call") {
          sawToolCall = true
        }
      }
    }

    expect(textParts.length).toBe(1)
    expect(textParts[0]?.text).toBe("hello world")
    expect(sawToolCall).toBe(true)
  })
})

describe("makeUserTurn", () => {
  it("constructs TurnRecord with correct fields", () => {
    const payload = makePayload()
    const turn = makeUserTurn(payload)

    expect(turn.turnId).toBe("turn:test-1")
    expect(turn.sessionId).toBe("session:test-1")
    expect(turn.conversationId).toBe("conversation:test-1")
    expect(turn.participantRole).toBe("UserRole")
    expect(turn.participantAgentId).toBe("agent:test-1")
    expect(turn.message.role).toBe("UserRole")
    expect(turn.message.content).toBe("hello world")
    expect(turn.modelFinishReason).toBeNull()
    expect(turn.modelUsageJson).toBeNull()
  })

  it("derives messageId from turnId", () => {
    const turn = makeUserTurn(makePayload({ turnId: "turn:abc" }))
    expect(turn.message.messageId).toBe("message:turn:abc:user")
  })

  it("uses provided contentBlocks when non-empty", () => {
    const blocks = [{ contentBlockType: "TextBlock" as const, text: "explicit" }]
    const turn = makeUserTurn(makePayload({ contentBlocks: blocks }))
    expect(turn.message.contentBlocks).toEqual(blocks)
  })

  it("synthesizes TextBlock from content when contentBlocks is empty", () => {
    const turn = makeUserTurn(makePayload({ content: "synthesized", contentBlocks: [] }))
    expect(turn.message.contentBlocks).toEqual([
      { contentBlockType: "TextBlock", text: "synthesized" }
    ])
  })
})

describe("makeAssistantTurn", () => {
  it("constructs TurnRecord with correct fields", () => {
    const payload = makePayload()
    const turn = makeAssistantTurn(payload, {
      assistantContent: "response text",
      assistantContentBlocks: [{ contentBlockType: "TextBlock" as const, text: "response text" }],
      modelFinishReason: "stop",
      modelUsageJson: "{}"
    })

    expect(turn.turnId).toBe("turn:test-1:assistant")
    expect(turn.participantRole).toBe("AssistantRole")
    expect(turn.message.role).toBe("AssistantRole")
    expect(turn.message.content).toBe("response text")
    expect(turn.modelFinishReason).toBe("stop")
    expect(turn.modelUsageJson).toBe("{}")
  })

  it("derives messageId from turnId", () => {
    const turn = makeAssistantTurn(makePayload({ turnId: "turn:xyz" }), {
      assistantContent: "hi",
      assistantContentBlocks: [],
      modelFinishReason: "stop",
      modelUsageJson: "{}"
    })
    expect(turn.message.messageId).toBe("message:turn:xyz:assistant")
  })
})

describe("addOptional", () => {
  it("adds two numbers", () => {
    expect(addOptional(1, 2)).toBe(3)
  })

  it("treats undefined as 0 (left)", () => {
    expect(addOptional(undefined, 5)).toBe(5)
  })

  it("treats undefined as 0 (right)", () => {
    expect(addOptional(5, undefined)).toBe(5)
  })

  it("treats both undefined as 0", () => {
    expect(addOptional(undefined, undefined)).toBe(0)
  })
})

describe("zeroUsage", () => {
  it("creates Usage with all zeros", () => {
    const usage = zeroUsage()
    expect(usage.inputTokens.total).toBe(0)
    expect(usage.inputTokens.uncached).toBe(0)
    expect(usage.inputTokens.cacheRead).toBe(0)
    expect(usage.inputTokens.cacheWrite).toBe(0)
    expect(usage.outputTokens.total).toBe(0)
    expect(usage.outputTokens.text).toBe(0)
    expect(usage.outputTokens.reasoning).toBe(0)
  })
})

describe("mergeUsage", () => {
  it("sums all token fields", () => {
    const a = new Response.Usage({
      inputTokens: { uncached: 1, total: 10, cacheRead: 2, cacheWrite: 3 },
      outputTokens: { total: 20, text: 15, reasoning: 5 }
    })
    const b = new Response.Usage({
      inputTokens: { uncached: 4, total: 40, cacheRead: 5, cacheWrite: 6 },
      outputTokens: { total: 30, text: 25, reasoning: 5 }
    })
    const merged = mergeUsage(a, b)

    expect(merged.inputTokens.uncached).toBe(5)
    expect(merged.inputTokens.total).toBe(50)
    expect(merged.inputTokens.cacheRead).toBe(7)
    expect(merged.inputTokens.cacheWrite).toBe(9)
    expect(merged.outputTokens.total).toBe(50)
    expect(merged.outputTokens.text).toBe(40)
    expect(merged.outputTokens.reasoning).toBe(10)
  })

  it("handles merging with zero usage", () => {
    const a = new Response.Usage({
      inputTokens: { uncached: 10, total: 100, cacheRead: 0, cacheWrite: 0 },
      outputTokens: { total: 50, text: 40, reasoning: 10 }
    })
    const merged = mergeUsage(a, zeroUsage())
    expect(merged.inputTokens.total).toBe(100)
    expect(merged.outputTokens.total).toBe(50)
  })
})

describe("makeLoopCapResponse", () => {
  it("includes max iterations in text", () => {
    const usage = zeroUsage()
    const response = makeLoopCapResponse(5, usage)
    expect(response.text).toContain("5")
    expect(response.text).toContain("max tool iterations")
  })

  it("includes finish part with reason 'other'", () => {
    const usage = zeroUsage()
    const response = makeLoopCapResponse(3, usage)
    expect(response.finishReason).toBe("other")
  })

  it("passes usage through to finish part", () => {
    const usage = new Response.Usage({
      inputTokens: { total: 100, uncached: 80, cacheRead: 10, cacheWrite: 10 },
      outputTokens: { total: 50, text: 40, reasoning: 10 }
    })
    const response = makeLoopCapResponse(3, usage)
    const finishPart = response.content.find((p) => p.type === "finish")
    expect(finishPart).toBeDefined()
    expect((finishPart as any).usage.inputTokens.total).toBe(100)
  })
})
