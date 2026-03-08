# Codex Review Prompt: RLM Production Features Plan

You are reviewing an Effect TypeScript implementation of Recursive Language Models (RLMs). The codebase uses `@effect/ai` for LLM integration, Bun.spawn subprocesses for sandboxed code execution, and typed JSON IPC for communication between the scheduler and sandbox worker.

## Context: What RLM Does

RLM is an inference-time strategy where an LLM iteratively generates JavaScript code, executes it in a sandbox, observes output, and repeats until it calls SUBMIT() with a final answer. The sandbox exposes `print()`, `__vars` (persistent heap), `llm_query()` / `llm_query_batched()` for recursive sub-calls, and user-defined tools. A scheduler orchestrates the loop with budget enforcement (max iterations, max LLM calls).

## Reference: DSPy RLM Production Features (GitHub Issue #9289)

Stanford's DSPy project proposed five production-readiness features for their Python RLM implementation. We want to adapt the relevant ones to our Effect TypeScript architecture. Here are the features and how they map to our codebase:

### Feature 1: `budget()` — Runtime Budget Introspection in Sandbox

**DSPy approach:** Expose a `budget()` callable in the sandbox that returns remaining iterations, LLM calls, time, and cost as a human-readable string. Warns when any resource drops below 20%.

**Our current state:**
- Budget tracking exists in `src/Budget.ts` — `BudgetState` has `iterationsRemaining`, `llmCallsRemaining`, `tokenBudgetRemaining`
- System prompt shows iteration count and LLM calls remaining per-iteration, but this is static text baked into the prompt at generation time
- Sandbox has NO runtime access to budget — code cannot call `budget()` or `getRemainingIterations()`
- Budget snapshot is available via `Budget.snapshot(callId)` returning `BudgetState`

**What to implement:**
- New IPC message pair: `BudgetRequest` / `BudgetResult` in `src/SandboxProtocol.ts`
- New `budget()` function injected into sandbox worker alongside `llm_query()` — returns a structured object `{ iterationsRemaining, llmCallsRemaining, totalTokensUsed }`
- Bridge handler in `src/Scheduler.ts` responds to `BudgetRequest` by reading `Budget.snapshot(callId)`
- This is a read-only query, no budget enforcement needed, so it should NOT route through the command queue — direct response via IPC, similar to how `GetVarResult` works
- Add `budget` to reserved bindings list in `sandbox-worker.ts`

**Key files:** `src/SandboxProtocol.ts`, `src/sandbox-worker.ts`, `src/SandboxBun.ts` (dispatchFrame), `src/Scheduler.ts`, `src/SystemPrompt.ts` (document availability)

### Feature 2: Multi-Model Sub-Call Routing via Named Models

**DSPy approach:** `sub_lms={"strong": lm_pro, "fast": lm_cheap}` dict, sandbox selects with `llm_query(prompt, model="strong")`.

**Our current state:**
- Single `sub_model` supported — `RlmConfig.subTarget`, `RlmModel` has `primaryLm` + optional `subLm`
- Routing is automatic by depth threshold (`depth >= depthThreshold` → use sub-model)
- Sandbox `llm_query(query, context?)` has no model selection parameter
- Provider-specific constructors: `makeAnthropicRlmModel`, `makeGoogleRlmModel`, `makeOpenAiRlmModel`

**What to implement:**
- Extend `RlmConfig` with `namedModels: Record<string, RlmModelTarget>` — each entry specifies provider + model name
- Extend `RlmModel` to hold a `Map<string, LanguageModel.Service>` of named models built at layer construction time
- Extend `llm_query` bridge signature: `llm_query(query, context?, { model?: string })` — third optional options arg
- `HandleBridgeCall` in Scheduler routes to named model when `model` arg is present, falls back to existing depth-based routing
- CLI: `--named-model name=provider/model` repeatable flag (e.g., `--named-model strong=anthropic/claude-sonnet-4-5-20250929 --named-model cheap=openai/gpt-4o-mini`)
- System prompt documents available model names so the LLM knows what to request
- Cross-provider support: named models can be from different providers than the primary model

**Key files:** `src/RlmConfig.ts`, `src/RlmModel.ts`, `src/Scheduler.ts` (HandleBridgeCall), `src/sandbox-worker.ts`, `src/cli/Command.ts`, `src/CliLayer.ts`, `src/SystemPrompt.ts`

### Feature 3: Multimodal Media Support

**DSPy approach:** Auto-detect Audio/Image input fields, hold media in a registry outside sandbox, expose `llm_query_with_media(prompt, *media_var_names)`.

**Our current state:**
- Pure text pipeline — context is always a string
- `@effect/ai` supports multimodal content parts at the library level (Prompt messages can contain image/audio parts)
- No media types, no registry, no multimodal prompt building

**What to implement:**
- `ContextMetadata` already exists (`src/ContextMetadata.ts`) — extend with `mediaAttachments: Array<{ name: string, mimeType: string, data: Buffer | URL }>`
- New `llm_query_with_media(prompt, ...mediaNames)` bridge function in sandbox
- Media registry: media objects stored on `CallContext`, referenced by name
- Bridge handler constructs multimodal `Prompt.make()` with image/audio content parts
- CLI: `--media name=path/to/file` or `--media-url name=https://...` flags
- Only expose `llm_query_with_media` in sandbox when media attachments are present
- System prompt documents available media names

**Key files:** `src/ContextMetadata.ts`, `src/CallContext.ts`, `src/SandboxProtocol.ts`, `src/sandbox-worker.ts`, `src/Scheduler.ts`, `src/RlmPrompt.ts`, `src/cli/Command.ts`

### Feature 4: Graceful Budget Exhaustion with Extract Fallback

**DSPy approach:** When time or cost exceeded, trigger extract fallback (attempt to salvage result from current state) rather than crash. Critical for optimization loops.

**Our current state:**
- Iteration exhaustion → extract fallback (exists, well-implemented in `Scheduler.ts` `handleGenerateStep`)
- LLM call exhaustion → hard `BudgetExhaustedError`, no fallback
- Token budget → wired but disabled (`maxTotalTokens` always null)
- No time-based budget (`max_time` / wall-clock limit per call)
- No cost tracking at all

**What to implement:**
- **Unify budget exhaustion handling**: When ANY budget resource is exhausted (iterations, LLM calls, tokens), attempt extract fallback before failing
- **Wall-clock time budget**: `maxTimeMs` in `RlmConfig`, checked at start of each iteration. When exceeded, trigger extract fallback
- **Token budget activation**: Wire `maxTotalTokens` through CLI, enforce in `Budget.recordTokens()`
- **Extract fallback for all budget types**: Refactor the existing iteration-extract logic into a shared `attemptExtractFallback(callState, reason)` function, called from any budget exhaustion path
- **Partial result preservation**: If extract also fails, return the last variable snapshot and transcript as a `PartialResult` rather than `NoFinalAnswerError` — useful for optimization/training loops

**Key files:** `src/Budget.ts`, `src/Scheduler.ts`, `src/RlmConfig.ts`, `src/RlmTypes.ts` (new PartialResult type), `src/cli/Command.ts`

### Feature 5: (Lower Priority) Local/Unsandboxed Interpreter

**DSPy approach:** `LocalInterpreter` runs code via `exec()` in host process for access to host packages (numpy, PIL, etc.).

**Our current state:**
- Always subprocess via `Bun.spawn` with IPC
- Two modes: `strict` (blocklist + scope restriction) and `permissive` (full JS access in subprocess)
- No way to run in host process

**Assessment:** Lower priority for our use case. Our subprocess sandbox already has full Node/Bun API access in permissive mode. The main gap vs DSPy's LocalInterpreter is that we can't import host-installed npm packages dynamically. For now, this can be deferred — the tool injection system (`RlmTool`) already bridges host capabilities into the sandbox. If needed, a `LocalInterpreter` could be implemented as an alternative `SandboxFactory` that uses `eval()` instead of `Bun.spawn`.

## Your Task

Review this plan against the codebase. For each feature:

1. **Validate the approach** — Is the proposed implementation path correct given the existing architecture? Are there simpler alternatives?
2. **Identify risks** — What could go wrong? Race conditions, type safety gaps, breaking changes?
3. **Suggest Effect-idiomatic patterns** — Where should we use Ref, Deferred, Layer composition, Schema validation, etc.?
4. **Prioritize** — Which features have the highest impact-to-effort ratio?
5. **Find reuse opportunities** — What existing code can be leveraged? What patterns are already established that we should follow?

Key source files to examine:
- `src/Scheduler.ts` — Main orchestration loop, command handling, budget enforcement
- `src/Budget.ts` — Budget tracking and enforcement
- `src/RlmConfig.ts` — Configuration schema
- `src/RlmModel.ts` — LLM provider abstraction
- `src/SandboxProtocol.ts` — IPC message types
- `src/sandbox-worker.ts` — Sandbox worker process
- `src/SandboxBun.ts` — Sandbox instance management, IPC dispatch
- `src/CallContext.ts` — Per-call state (Refs for iteration, transcript, etc.)
- `src/SystemPrompt.ts` — System prompt generation
- `src/CliLayer.ts` — CLI argument processing and layer construction
- `src/SubmitTool.ts` — SUBMIT tool definition and extraction
- `src/BridgeHandler.ts` — Bridge call routing
- `src/RlmPrompt.ts` — Prompt building
- `src/ContextMetadata.ts` — Context analysis metadata

Also examine the test patterns in `test/Scheduler.test.ts` and `test/SandboxBun.test.ts` for testing conventions.
