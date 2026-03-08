# Codex Task: Implement Prompt Caching for Effect AI RLM System

## Objective

Implement Anthropic prompt caching in the recursive-llm system to reduce cost and latency. The system prompt and early conversation turns are stable across iterations within a call and should be cached.

## Approach: Multi-Agent Sub-Agent Review

Use parallel sub-agents to research, implement, and review:

1. **Research Agent**: Investigate how `@effect/ai-anthropic` exposes prompt caching, how Anthropic's `cache_control` breakpoints work, and what the cost/latency savings are.
2. **Implementation Agent**: Wire caching into the RLM prompt-building pipeline.
3. **Review Agent**: Verify correctness, test coverage, and that caching doesn't break existing behavior.

---

## Context: How the System Works

### Architecture

The RLM (Recursive Language Model) is an inference-time strategy that loops: generate code -> execute in sandbox -> observe output -> repeat until SUBMIT(). Each iteration builds a growing transcript of assistant/user message pairs appended to a stable prefix.

### Key Files

| File | Role |
|------|------|
| `src/RlmPrompt.ts` | Builds `Prompt.Prompt` objects from system prompt + transcript |
| `src/RlmModel.ts` | Wraps `@effect/ai` LanguageModel with provider selection |
| `src/Scheduler.ts` | Orchestrates the generate/execute loop, calls `buildReplPrompt()` |
| `src/SystemPrompt.ts` | Builds the system prompt string (stable within a call) |
| `src/CliLayer.ts` | Constructs provider layers (AnthropicClient, OpenAiClient, etc.) |
| `.reference/effect/packages/ai/anthropic/src/AnthropicLanguageModel.ts` | Reference implementation showing how caching is wired |

### Current Prompt Structure (per iteration)

```
[system]  <-- STABLE across all iterations (cacheable)
[user]    <-- query + context hint, STABLE across iterations (cacheable)
[assistant] iteration 1 response  <-- STABLE after iteration 1
[user]      execution output 1    <-- STABLE after iteration 1
[assistant] iteration 2 response  <-- STABLE after iteration 2
[user]      execution output 2    <-- STABLE after iteration 2
... growing transcript ...
[assistant] current iteration     <-- NEW (not cacheable)
```

The system prompt is typically 2-5K tokens. The user query message is stable. Prior transcript entries are stable once written. Only the final turn is new.

### How @effect/ai-anthropic Supports Caching

The Anthropic provider in `@effect/ai` already supports `cacheControl` via provider-specific options on messages and parts:

```typescript
// From .reference/effect/packages/ai/anthropic/src/AnthropicLanguageModel.ts
// Each message/part can have: options.anthropic.cacheControl
// The provider reads it via: getCacheControl(message) -> part.options.anthropic?.cacheControl
// And maps it to Anthropic API's cache_control field

// The schema type is: Generated.CacheControlEphemeral.Encoded
// Which is: { type: "ephemeral" }
```

The `Prompt.make()` function accepts `MessageEncoded` objects. Each message has an `options` field that accepts provider-specific config:

```typescript
// Prompt.ProviderOptions is Schema.Record<string, Record<string, unknown>>
// So message options look like:
{
  role: "system",
  content: "...",
  options: {
    anthropic: {
      cacheControl: { type: "ephemeral" }
    }
  }
}
```

The Anthropic provider's `getCacheControl` function extracts `part.options.anthropic?.cacheControl` and passes it through as `cache_control` on the API request.

### Usage tracking

`Response.Usage` already has `cachedInputTokens` which the Anthropic provider populates from `cache_read_input_tokens`.

---

## Research Phase (Sub-Agent 1)

### Questions to Answer

1. **How does `Prompt.MessageEncoded` accept options?** Read `src/Prompt.ts` in `.reference/effect/packages/ai/ai/src/` to understand the `options` field schema. Confirm that `{ anthropic: { cacheControl: { type: "ephemeral" } } }` is the correct shape.

2. **Where should cache breakpoints go?** Anthropic allows up to 4 cache breakpoints. The optimal placement for RLM is:
   - Breakpoint 1: On the system message (largest stable prefix)
   - Breakpoint 2: On the initial user message (query + context hint)
   - Breakpoint 3: On the last stable transcript entry (grows each iteration)

3. **What's the minimum cacheable size?** Anthropic requires 1024 tokens minimum for caching to activate (2048 for Claude 3.5 Haiku). Verify this constraint.

4. **Does it work with tool definitions?** The system uses `toolkit` in `generateText`. Confirm that tool definitions are part of the cached prefix.

5. **Is caching provider-specific?** Yes — only Anthropic supports `cacheControl`. OpenAI and Google should ignore the option. Verify that adding `options.anthropic` to messages doesn't break other providers.

6. **What about the sub-model path?** When `llm_query` delegates to a sub-model (possibly a different provider), caching options should be harmless but verify.

---

## Implementation Phase (Sub-Agent 2)

### Step 1: Modify `src/RlmPrompt.ts` — Add cache breakpoints to prompt builders

In `buildReplPrompt()`:
- Add `cacheControl: { type: "ephemeral" }` to the system message options
- Add `cacheControl: { type: "ephemeral" }` to the initial user message options
- Add `cacheControl: { type: "ephemeral" }` to the last transcript user message (the most recent stable execution output)

```typescript
// Example for the system message:
messages.push({
  role: "system",
  content: options.systemPrompt,
  options: {
    anthropic: { cacheControl: { type: "ephemeral" } }
  }
})
```

For the transcript, only the LAST user message before the current generation should get the breakpoint, since it marks the boundary of "everything before this is stable."

In `buildOneShotPrompt()`:
- Add `cacheControl` to the system message (sub-calls reuse the same system prompt)

In `buildExtractPrompt()`:
- Add `cacheControl` to the system message and last transcript entry

### Step 2: Make caching configurable

Add to `RlmConfig`:
```typescript
readonly enablePromptCaching: boolean  // default: true
```

Only add the `options.anthropic` fields when `enablePromptCaching` is true AND the provider is anthropic. Or alternatively, always add them and let non-Anthropic providers ignore them (simpler, verify this works).

### Step 3: Surface cache hit metrics in events

The `Response.Usage` already includes `cachedInputTokens`. Wire this through:
- `RlmEvent.IterationCompleted` should include `cachedInputTokens` if available
- `RlmRenderer` should display cache hit ratio in the token summary line
- Example: `[in:5887 out:354 = 6241 cache:4200]`

### Step 4: Add CLI flag (optional)

Add `--no-prompt-caching` flag to disable caching for debugging/comparison.

---

## Review Phase (Sub-Agent 3)

### Verification Checklist

- [ ] `bun run typecheck` passes
- [ ] `bun test` passes (all existing tests)
- [ ] New tests in `test/RlmPrompt.test.ts`:
  - Cache breakpoint present on system message
  - Cache breakpoint present on initial user message
  - Cache breakpoint on last transcript entry (not on intermediate ones)
  - No cache breakpoints when caching is disabled
  - Options don't break when provider is not anthropic
- [ ] Integration test: run with `--provider anthropic` and verify `cachedInputTokens > 0` on iterations 2+
- [ ] Non-regression: run with `--provider openai` and verify no errors from anthropic-specific options
- [ ] Cost comparison: run the same query with and without caching, compare token usage

### Key Risks

1. **Schema validation**: Ensure `options.anthropic.cacheControl` passes through `Prompt.ProviderOptions` schema validation without error
2. **Provider leakage**: Verify OpenAI/Google providers ignore anthropic-specific options gracefully
3. **Breakpoint limit**: Anthropic allows max 4 breakpoints — ensure we don't exceed this
4. **Minimum token threshold**: Caching only activates above 1024 tokens — system prompts shorter than this won't benefit

---

## Expected Impact

- **Iterations 2+**: System prompt + user query cached = ~2-5K tokens saved per call
- **Later iterations**: Growing transcript prefix cached = significant savings on 8-10 iteration runs
- **Cost**: Anthropic charges 90% less for cached input tokens
- **Latency**: Cached prefixes process faster (time-to-first-token improvement)
- **On a 10-iteration run with 5K token system prompt**: ~45K fewer billable input tokens

---

## Files to Read First

```
src/RlmPrompt.ts                    — where prompts are built (PRIMARY TARGET)
src/Scheduler.ts                     — where buildReplPrompt is called
src/RlmModel.ts                      — model layer, generateText interface
src/SystemPrompt.ts                  — system prompt builder
src/RlmConfig.ts                     — config service
src/RlmRenderer.ts                   — event rendering (for cache metrics display)
src/RlmTypes.ts                      — event types
.reference/effect/packages/ai/anthropic/src/AnthropicLanguageModel.ts  — cache_control wiring
.reference/effect/packages/ai/ai/src/Prompt.ts                         — Prompt schema with options
test/RlmPrompt.test.ts              — existing prompt tests
```

## Running Tests

```bash
bun run typecheck
bun test
```

## Running a Live Test

```bash
# With caching (default)
bun run src/cli.ts --provider anthropic --model claude-sonnet-4-5-20250929 \
  --max-iterations 5 --context-file ./test/fixtures/frankenstein.txt \
  "List all characters in this novel"

# Without caching (for comparison)
bun run src/cli.ts --provider anthropic --model claude-sonnet-4-5-20250929 \
  --max-iterations 5 --no-prompt-caching --context-file ./test/fixtures/frankenstein.txt \
  "List all characters in this novel"
```
