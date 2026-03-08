import { describe, expect, test } from "bun:test"
import { Option } from "effect"
import { formatEvent, renderEvent, type RenderOptions } from "../src/RlmRenderer"
import { BudgetState, CallId, RlmEvent } from "../src/RlmTypes"
import {
  BudgetExhaustedError,
  CallStateMissingError,
  NoFinalAnswerError,
  OutputValidationError,
  SandboxError,
  UnknownRlmError
} from "../src/RlmError"

const capture = (event: RlmEvent, options?: RenderOptions) =>
  formatEvent(event, options)

const completionId = "test-completion"
const callId = CallId("test-call")

const makeBudget = (iters = 8, calls = 18) =>
  new BudgetState({
    iterationsRemaining: iters,
    llmCallsRemaining: calls,
    tokenBudgetRemaining: Option.none(),
    totalTokensUsed: 0
  })

describe("RlmRenderer", () => {
  // --- Iteration block ---

  test("IterationStarted renders coord + divider + budget", () => {
    const out = capture(
      RlmEvent.IterationStarted({
        completionId,
        callId,
        depth: 0,
        iteration: 2,
        budget: makeBudget()
      }),
      { noColor: true }
    )
    expect(out).toContain("[0:2]")
    expect(out).toContain("Iteration")
    expect(out).toContain("(8i 18c)")
  })

  test("IterationStarted with token budget", () => {
    const out = capture(
      RlmEvent.IterationStarted({
        completionId,
        callId,
        depth: 0,
        iteration: 1,
        budget: new BudgetState({
          iterationsRemaining: 9,
          llmCallsRemaining: 49,
          tokenBudgetRemaining: Option.some(1000),
          totalTokensUsed: 0
        })
      }),
      { noColor: true }
    )
    expect(out).toContain("1000tok")
  })

  // --- Model response ---

  test("ModelResponse truncates long text", () => {
    const longText = "x".repeat(300)
    const out = capture(
      RlmEvent.ModelResponse({ completionId, callId, depth: 0, text: longText }),
      { noColor: true }
    )
    expect(out).toContain("...")
    expect(out.length).toBeLessThan(300)
  })

  // --- Code execution ---

  test("CodeExecutionStarted shows code content", () => {
    const out = capture(
      RlmEvent.CodeExecutionStarted({ completionId, callId, depth: 0, code: "print(1)" }),
      { noColor: true }
    )
    expect(out).toContain("▶ Code:")
    expect(out).toContain("print(1)")
  })

  test("CodeExecutionStarted shows multiline code", () => {
    const code = "x = 1\ny = 2\nprint(x + y)"
    const out = capture(
      RlmEvent.CodeExecutionStarted({ completionId, callId, depth: 0, code }),
      { noColor: true }
    )
    expect(out).toContain("▶ Code:")
    expect(out).toContain("x = 1")
    expect(out).toContain("y = 2")
    expect(out).toContain("print(x + y)")
  })

  test("CodeExecutionStarted truncates long code", () => {
    const lines = Array.from({ length: 20 }, (_, i) => `line_${i}`)
    const code = lines.join("\n")
    const out = capture(
      RlmEvent.CodeExecutionStarted({ completionId, callId, depth: 0, code }),
      { noColor: true, maxCodeLines: 5 }
    )
    expect(out).toContain("line_0")
    expect(out).toContain("line_4")
    expect(out).not.toContain("line_5")
    expect(out).toContain("... (15 more lines)")
  })

  // --- Output ---

  test("CodeExecutionCompleted renders single-line output inline", () => {
    const out = capture(
      RlmEvent.CodeExecutionCompleted({ completionId, callId, depth: 0, output: "42" }),
      { noColor: true }
    )
    expect(out).toContain("◀ 42")
  })

  test("CodeExecutionCompleted renders multiline output", () => {
    const output = "line1\nline2\nline3"
    const out = capture(
      RlmEvent.CodeExecutionCompleted({ completionId, callId, depth: 0, output }),
      { noColor: true }
    )
    expect(out).toContain("◀ Output:")
    expect(out).toContain("line1")
    expect(out).toContain("line2")
    expect(out).toContain("line3")
  })

  test("CodeExecutionCompleted truncates long output", () => {
    const lines = Array.from({ length: 30 }, (_, i) => `out_${i}`)
    const output = lines.join("\n")
    const out = capture(
      RlmEvent.CodeExecutionCompleted({ completionId, callId, depth: 0, output }),
      { noColor: true, maxOutputLines: 5 }
    )
    expect(out).toContain("out_0")
    expect(out).toContain("out_4")
    expect(out).not.toContain("out_5")
    expect(out).toContain("... (25 more lines)")
  })

  // --- Bridge ---

  test("BridgeCallReceived renders method", () => {
    const out = capture(
      RlmEvent.BridgeCallReceived({ completionId, callId, depth: 0, method: "llm_query" }),
      { noColor: true }
    )
    expect(out).toContain("↗ Bridge: llm_query")
  })

  test("CacheHit renders cache status, kind, and key", () => {
    const out = capture(
      RlmEvent.CacheHit({
        completionId,
        callId,
        depth: 0,
        kind: "subcall",
        cacheKey: "subcall:abcdef1234567890"
      }),
      { noColor: true }
    )
    expect(out).toContain("Cache hit")
    expect(out).toContain("subcall")
    expect(out).toContain("subcall:abcdef")
  })

  test("CacheMiss renders cache status, kind, and key", () => {
    const out = capture(
      RlmEvent.CacheMiss({
        completionId,
        callId,
        depth: 0,
        kind: "subcall",
        cacheKey: "subcall:abcdef1234567890"
      }),
      { noColor: true }
    )
    expect(out).toContain("Cache miss")
    expect(out).toContain("subcall")
    expect(out).toContain("subcall:abcdef")
  })

  // --- Final ---

  test("CallFinalized renders answer", () => {
    const out = capture(
      RlmEvent.CallFinalized({ completionId, callId, depth: 0, answer: "The answer is 42" }),
      { noColor: true }
    )
    expect(out).toContain("✓ FINAL: The answer is 42")
  })

  // --- Errors ---

  test("CallFailed renders error", () => {
    const out = capture(
      RlmEvent.CallFailed({
        completionId,
        callId,
        depth: 0,
        error: new SandboxError({ message: "boom" })
      }),
      { noColor: true }
    )
    expect(out).toContain("✗ FAILED: SandboxError")
    expect(out).toContain("boom")
  })

  // --- Warnings ---

  test("SchedulerWarning renders message with code", () => {
    const out = capture(
      RlmEvent.SchedulerWarning({
        completionId,
        code: "QUEUE_CLOSED",
        message: "Queue was closed"
      }),
      { noColor: true }
    )
    expect(out).toContain("⚠ QUEUE_CLOSED: Queue was closed")
  })

  // --- Quiet mode ---

  test("quiet mode suppresses non-final events", () => {
    const callStartOut = capture(
      RlmEvent.CallStarted({ completionId, callId, depth: 0 }),
      { quiet: true, noColor: true }
    )
    expect(callStartOut).toBe("")

    const iterOut = capture(
      RlmEvent.IterationStarted({
        completionId,
        callId,
        depth: 0,
        iteration: 1,
        budget: makeBudget(9, 19)
      }),
      { quiet: true, noColor: true }
    )
    expect(iterOut).toBe("")

    const finalOut = capture(
      RlmEvent.CallFinalized({ completionId, callId, depth: 0, answer: "done" }),
      { quiet: true, noColor: true }
    )
    expect(finalOut).toContain("✓ FINAL: done")

    const failOut = capture(
      RlmEvent.CallFailed({
        completionId,
        callId,
        depth: 0,
        error: new SandboxError({ message: "err" })
      }),
      { quiet: true, noColor: true }
    )
    expect(failOut).toContain("✗ FAILED:")
  })

  // --- Tree guide / depth ---

  test("depth 0 has no guide prefix", () => {
    const out = capture(
      RlmEvent.CallFinalized({ completionId, callId, depth: 0, answer: "root" }),
      { noColor: true }
    )
    expect(out).toStartWith("✓ FINAL:")
  })

  test("depth 1 has │ guide prefix", () => {
    const out = capture(
      RlmEvent.CallFinalized({ completionId, callId, depth: 1, answer: "nested" }),
      { noColor: true }
    )
    expect(out).toContain("│ ✓ FINAL:")
  })

  test("depth 2 has │ │ guide prefix", () => {
    const out = capture(
      RlmEvent.CallFinalized({ completionId, callId, depth: 2, answer: "deep" }),
      { noColor: true }
    )
    expect(out).toContain("│ │ ✓ FINAL:")
  })

  test("multiline blocks preserve guides on every line", () => {
    const code = "a = 1\nb = 2"
    const out = capture(
      RlmEvent.CodeExecutionStarted({ completionId, callId, depth: 1, code }),
      { noColor: true }
    )
    const lines = out.trimEnd().split("\n")
    for (const line of lines) {
      expect(line).toStartWith("│ ")
    }
  })

  // --- CallStarted renders call boundary ---

  test("CallStarted renders call boundary box", () => {
    const out = capture(
      RlmEvent.CallStarted({ completionId, callId, depth: 0 }),
      { noColor: true }
    )
    expect(out).toContain("╭─ Call [depth=0]")
    expect(out).toContain("╮")
  })

  test("CallStarted at depth 1 has guide prefix", () => {
    const out = capture(
      RlmEvent.CallStarted({ completionId, callId, depth: 1 }),
      { noColor: true }
    )
    expect(out).toContain("│ ╭─ Call [depth=1]")
  })

  // --- Color ---

  test("noColor disables ANSI codes", () => {
    const colored = capture(
      RlmEvent.CallFinalized({ completionId, callId, depth: 0, answer: "test" })
    )
    const plain = capture(
      RlmEvent.CallFinalized({ completionId, callId, depth: 0, answer: "test" }),
      { noColor: true }
    )
    expect(colored).toContain("\x1b[")
    expect(plain).not.toContain("\x1b[")
  })

  // --- Token usage badge ---

  test("token usage with breakdown", () => {
    const out = capture(
      RlmEvent.ModelResponse({
        completionId,
        callId,
        depth: 0,
        text: "hello",
        usage: { totalTokens: 42, inputTokens: 20, outputTokens: 22 }
      }),
      { noColor: true }
    )
    expect(out).toContain("[in:20 out:22 = 42]")
  })

  test("token usage falls back to sum when totalTokens is 0", () => {
    const out = capture(
      RlmEvent.ModelResponse({
        completionId,
        callId,
        depth: 0,
        text: "hello",
        usage: { totalTokens: 0, inputTokens: 10, outputTokens: 5 }
      }),
      { noColor: true }
    )
    expect(out).toContain("[in:10 out:5 = 15]")
  })

  test("token usage omitted when all zero", () => {
    const out = capture(
      RlmEvent.ModelResponse({
        completionId,
        callId,
        depth: 0,
        text: "hello",
        usage: { totalTokens: 0 }
      }),
      { noColor: true }
    )
    expect(out).not.toContain("[")
  })

  test("token usage with reasoning and cached tokens", () => {
    const out = capture(
      RlmEvent.ModelResponse({
        completionId,
        callId,
        depth: 0,
        text: "hello",
        usage: { inputTokens: 200, outputTokens: 100, reasoningTokens: 50, cachedInputTokens: 180, totalTokens: 350 }
      }),
      { noColor: true }
    )
    expect(out).toContain("in:200")
    expect(out).toContain("out:100")
    expect(out).toContain("reason:50")
    expect(out).toContain("cache:180")
    expect(out).toContain("= 350")
  })

  // --- showCode / showOutput toggles ---

  test("showCode false suppresses CodeExecutionStarted", () => {
    const out = capture(
      RlmEvent.CodeExecutionStarted({ completionId, callId, depth: 0, code: "print(1)" }),
      { showCode: false, noColor: true }
    )
    expect(out).toBe("")
  })

  test("showOutput false suppresses CodeExecutionCompleted", () => {
    const out = capture(
      RlmEvent.CodeExecutionCompleted({ completionId, callId, depth: 0, output: "42" }),
      { showOutput: false, noColor: true }
    )
    expect(out).toBe("")
  })

  // --- Configurable truncation ---

  test("modelTruncateLimit truncates model text", () => {
    const longText = "a".repeat(300)
    const out = capture(
      RlmEvent.ModelResponse({ completionId, callId, depth: 0, text: longText }),
      { modelTruncateLimit: 50, noColor: true }
    )
    expect(out).toContain("...")
    expect(out.length).toBeLessThan(100)
  })

  test("outputTruncateLimit applies before line split", () => {
    // 600 chars of output, limit to 100 chars first, then split
    const longOutput = Array.from({ length: 30 }, (_, i) => `line_${i}_${"x".repeat(15)}`).join("\n")
    const out = capture(
      RlmEvent.CodeExecutionCompleted({ completionId, callId, depth: 0, output: longOutput }),
      { outputTruncateLimit: 100, noColor: true }
    )
    expect(out).toContain("...")
  })

  // --- Structured errors ---

  test("BudgetExhaustedError renders structured fields", () => {
    const out = capture(
      RlmEvent.CallFailed({
        completionId,
        callId,
        depth: 0,
        error: new BudgetExhaustedError({
          resource: "iterations",
          remaining: 0,
          callId: CallId("x")
        })
      }),
      { noColor: true }
    )
    expect(out).toContain("resource=iterations")
    expect(out).toContain("remaining=0")
  })

  test("NoFinalAnswerError renders maxIterations", () => {
    const out = capture(
      RlmEvent.CallFailed({
        completionId,
        callId,
        depth: 0,
        error: new NoFinalAnswerError({
          maxIterations: 10,
          callId: CallId("x")
        })
      }),
      { noColor: true }
    )
    expect(out).toContain("maxIterations=10")
  })

  test("SandboxError renders message", () => {
    const out = capture(
      RlmEvent.CallFailed({
        completionId,
        callId,
        depth: 0,
        error: new SandboxError({ message: "boom" })
      }),
      { noColor: true }
    )
    expect(out).toContain("boom")
  })

  test("UnknownRlmError renders cause", () => {
    const out = capture(
      RlmEvent.CallFailed({
        completionId,
        callId,
        depth: 0,
        error: new UnknownRlmError({ message: "oops", cause: new Error("root") })
      }),
      { noColor: true }
    )
    expect(out).toContain("oops")
    expect(out).toContain("root")
  })

  test("OutputValidationError renders raw field", () => {
    const out = capture(
      RlmEvent.CallFailed({
        completionId,
        callId,
        depth: 0,
        error: new OutputValidationError({ message: "bad json", raw: "{invalid" })
      }),
      { noColor: true }
    )
    expect(out).toContain("raw=")
    expect(out).toContain("bad json")
  })

  test("CallStateMissingError renders callId", () => {
    const out = capture(
      RlmEvent.CallFailed({
        completionId,
        callId,
        depth: 0,
        error: new CallStateMissingError({ callId: CallId("missing-id") })
      }),
      { noColor: true }
    )
    expect(out).toContain("callId=missing-id")
  })

  // --- Error with tree guide ---

  test("CallFailed at depth preserves tree guides", () => {
    const out = capture(
      RlmEvent.CallFailed({
        completionId,
        callId,
        depth: 1,
        error: new SandboxError({ message: "nested fail" })
      }),
      { noColor: true }
    )
    expect(out).toContain("│ ✗ FAILED:")
    expect(out).toContain("nested fail")
  })

  test("CallFailed multiline cause keeps guide on continuation lines", () => {
    const out = capture(
      RlmEvent.CallFailed({
        completionId,
        callId,
        depth: 2,
        error: new UnknownRlmError({
          message: "nested fail",
          cause: new Error("root line 1\nroot line 2")
        })
      }),
      { noColor: true }
    )
    const lines = out.trimEnd().split("\n")
    expect(lines.length).toBeGreaterThan(1)
    for (const line of lines) {
      expect(line).toStartWith("│ │ ")
    }
    expect(out).toContain("root line 1")
    expect(out).toContain("root line 2")
  })

  // --- Warning metadata ---

  test("SchedulerWarning renders metadata", () => {
    const out = capture(
      RlmEvent.SchedulerWarning({
        completionId,
        code: "STALE_COMMAND_DROPPED",
        message: "Dropped stale command",
        callId: CallId("abc"),
        commandTag: "GenerateStep"
      }),
      { noColor: true }
    )
    expect(out).toContain("STALE_COMMAND_DROPPED")
    expect(out).toContain("call=abc")
    expect(out).toContain("cmd=GenerateStep")
  })

  // --- Width / layout ---

  test("iterationBlock does not exceed lineWidth", () => {
    const out = capture(
      RlmEvent.IterationStarted({
        completionId,
        callId,
        depth: 0,
        iteration: 1,
        budget: makeBudget(9, 49)
      }),
      { noColor: true, lineWidth: 80 }
    )
    const lines = out.trimEnd().split("\n")
    for (const line of lines) {
      expect(line.length).toBeLessThanOrEqual(80)
    }
  })

  test("narrow lineWidth degrades gracefully", () => {
    const out = capture(
      RlmEvent.IterationStarted({
        completionId,
        callId,
        depth: 0,
        iteration: 1,
        budget: makeBudget(9, 49)
      }),
      { noColor: true, lineWidth: 30 }
    )
    // Should not crash and should contain coord and budget
    expect(out).toContain("[0:1]")
    expect(out).toContain("(9i 49c)")
  })

  test("CallStarted respects configured lineWidth", () => {
    const out = capture(
      RlmEvent.CallStarted({ completionId, callId, depth: 1 }),
      { noColor: true, lineWidth: 32 }
    )
    const lines = out.trimEnd().split("\n")
    for (const line of lines) {
      expect(line.length).toBeLessThanOrEqual(32)
    }
  })

  // --- Backward-compat wrapper ---

  test("renderEvent writes same string as formatEvent", () => {
    const event = RlmEvent.CallFinalized({
      completionId,
      callId,
      depth: 0,
      answer: "test"
    })
    const opts: RenderOptions = { noColor: true }
    let captured = ""
    renderEvent(event, { write: (s) => { captured += s } }, opts)
    expect(captured).toBe(formatEvent(event, opts))
  })
})
