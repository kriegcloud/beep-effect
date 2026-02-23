# P4 Research: Chat Route

Date: 2026-02-22

## Phase objective

Build `/api/chat` using Effect `LanguageModel.generateText` with OpenAI model provider and the shared knowledge-graph toolkit.

## Source-proven API facts

From `.repos/effect-smol`:
- `LanguageModel.generateText({ prompt, toolkit, toolChoice, ... })` supports tool calling.
- `toolChoice` supports `auto`, `none`, `required`, specific tool, and constrained subsets.
- OpenAI provider is wired by providing `OpenAiLanguageModel.model(modelName)` layer.

Relevant source files:
- `.repos/effect-smol/packages/effect/src/unstable/ai/LanguageModel.ts`
- `.repos/effect-smol/packages/ai/openai/src/OpenAiLanguageModel.ts`
- `.repos/effect-smol/packages/ai/openai/test/OpenAiLanguageModel.test.ts`

## High-impact design decisions for P4

1. Reuse P3 toolkit directly; never create chat-only tool copies.
2. Keep prompt building and response mapping in dedicated utility module.
3. Return structured response payload (text + citations/tool traces + usage metadata).
4. Enforce allowlist/session check before model execution.
5. Use model configuration from env with safe default model ID.

## Recommended file plan

- `apps/web/src/app/api/chat/route.ts`
- `apps/web/src/lib/graph/tools.ts`
- `apps/web/src/lib/effect/runtime.ts`
- `apps/web/src/lib/chat/response-mapper.ts` (or equivalent)

## Suggested response contract for client

```ts
{
  text: string,
  toolCalls: Array<{ name: string; params: unknown }>,
  toolResults: Array<{ name: string; isFailure: boolean; result: unknown }>,
  citations: Array<{ nodeId: string; label: string; score?: number }>,
  usage?: { inputTokens?: number; outputTokens?: number }
}
```

## Reliability controls to include in P4

- Max tool-call iterations or bounded auto-resolution behavior.
- Timeout wrapper around model invocation.
- Graceful error mapping for upstream provider failures.
- Request size guard for prompt payload.

## Verification pack

```bash
bun run check
bun run test
bun run lint
bun run build
```

Behavior gates:
- Valid prompt returns grounded response.
- Tool calls execute and are surfaced in response contract.
- Unauthorized request is denied before model/tool execution.
- Provider error path returns deterministic API error shape.

## Rollout guidance for P4

- Validate in preview with a small allowlisted test set.
- Capture latency percentiles and failure classes early.
- Keep model ID configurable (`OPENAI_CHAT_MODEL`) for fast rollback/tuning.

## Rollback strategy

- Disable tool usage (toolChoice `none`) temporarily if tool path fails while preserving base chat.
- Fallback to deterministic error response if provider unavailable.
- Keep previous stable route response shape to avoid client breakage.

## P4 phase risk gates

| Risk | Mitigation |
|------|------------|
| Tool loops or latency spikes | Bound tool iteration and set timeout |
| Response contract drift breaks UI | Versioned mapper and tests for payload shape |
| Upstream provider instability | Classify errors and return stable API schema |

## References

- `.repos/effect-smol/packages/effect/src/unstable/ai/LanguageModel.ts`
- `.repos/effect-smol/packages/ai/openai/test/OpenAiLanguageModel.test.ts`
- `specs/pending/codex-effect-v4-knowledge-graph-app/outputs/research.md`
- `specs/pending/codex-effect-v4-knowledge-graph-app/handoffs/HANDOFF_P4.md`
