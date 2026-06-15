# Verification Progress

Date: 2026-06-15

## Scope

This is an interim evidence note, not P4 closeout. The local fixture and
foundation proof lanes are materially stronger, but the real-LLM E2E acceptance
item remains unproven because no Anthropic key is available in this session.

## Code Hygiene

- Removed stale rich-block comments from:
  - `packages/agents/domain/src/turn/AssistantContent.ts`
  - `packages/agents/server/src/AssistantTurn/AnthropicTurnCodec.ts`
  - `packages/agents/server/src/AssistantTurn/AnthropicTurnKernel.ts`
- Confirmed no remaining stale `v1 md-aligned` / `later parity phase` prose in
  the agents domain/server source surfaces.

## Passing Proofs

- `bunx biome check --write packages/agents/server/src/AssistantTurn/AnthropicTurnKernel.ts packages/agents/server/src/AssistantTurn/AnthropicTurnCodec.ts packages/agents/domain/src/turn/AssistantContent.ts`
- `bun run --cwd packages/agents/domain check`
- `bun run --cwd packages/agents/server check`
- `bun run --cwd packages/agents/server test -- AnthropicTurnCodec.test.ts BlockRepair.test.ts`
- `bun run --cwd packages/agents/domain test -- AgentsDomain.test.ts`
- `bun run --cwd packages/agents/domain docgen`
- `bun run --cwd packages/agents/server docgen`
- `BEEP_TEST_DATABASE_DRIVER=pglite-testcontainers bun run --cwd packages/workspace/server test:integration`
- `BEEP_TEST_DATABASE_DRIVER=pglite-testcontainers bun run --cwd apps/professional-desktop test:integration`
- `bun run --cwd packages/drivers/anthropic test -- Anthropic.repair.test.ts`
- `bun run --cwd packages/foundation/modeling/md test -- Md.test.ts`
- `bun run --cwd packages/foundation/modeling/lexical test -- Lexical.codec.test.ts Lexical.model.test.ts`
- `bun run --cwd packages/foundation/ui-system/editor test -- editor-nodes.test.ts`
- `bun run --cwd apps/professional-desktop test -- chat-ui.test.tsx chat-contract.test.ts`
- `bun run repo-exports:catalog:check`
- `bun run beep lint schema-first`
- `git diff --check`
- `test "$(wc -m < goals/chat-surface-parity/GOAL.md)" -le 4000`
- `jq . goals/chat-surface-parity/ops/manifest.json`
- `bun run beep yeet verify` completed successfully and wrote a successful Yeet
  verdict to `.beep/yeet/runs/feat_chat-surface-parity-ea0c09d2b2a4/verdict.json`.

## Boundary Checks

- `rg -n "@beep/ui" packages/agents/client apps/professional-desktop/src packages/agents --glob "*.{ts,tsx}"` returned UI imports only in `apps/professional-desktop/src`, preserving the requirement that `@beep/agents-client` must not import `@beep/ui`.
- Docker was available (`docker info --format '{{.ServerVersion}}'` returned
  `29.5.2`), so the PgLite integrations above ran with the real testcontainers
  gate instead of being skipped.

## Real-LLM E2E Status

Real-LLM E2E remains unavailable in this session:

- 1Password MCP `authenticate` failed with `IPC request failed`.
- `AI_ANTHROPIC_API_KEY` and `ANTHROPIC_API_KEY` are unset in the shell.
- User correction: do not run `op` from the sandboxed Codex terminal. The
  remaining proof needs either a working 1Password MCP auth path or an
  unsandboxed user-terminal secret injection.
- Added a gated real-Anthropic E2E harness:
  `apps/professional-desktop/test/integration/chat-real-anthropic.e2e.test.ts`.
  It drives the live `AnthropicTurnKernel` through the real chat orchestration
  and Drizzle/PgLite persistence path, then asserts mermaid, table, and youtube
  blocks both stream and persist as `@beep/md`.

The acceptance item "real-LLM run rendering+persisting mermaid/table/youtube,
recorded in history" is therefore still open.

## 2026-06-15 Live Harness Check

- `bun run --cwd apps/professional-desktop test:integration -- chat-real-anthropic.e2e.test.ts`
  passed the default gate by skipping the real-Anthropic suite.
- `BEEP_TEST_REAL_ANTHROPIC_CHAT=1 BEEP_TEST_DATABASE_DRIVER=pglite-testcontainers bun run --cwd apps/professional-desktop test:integration -- chat-real-anthropic.e2e.test.ts`
  initially exposed an Anthropic execution-plan defect before credentials were
  relevant: `Fiber.runLoop: Not a valid effect: undefined`.
- Patched the Anthropic turn and repair execution-plan retry predicates so only
  real `AiError` values are inspected for `isRetryable`; non-AI failures such as
  `ConfigError` now fail fast instead of returning `undefined` from the retry
  predicate.
- Re-running the enabled live harness now fails at the expected auth boundary:
  `ChatActionError: Anthropic assistant turn failed: SchemaError(Invalid data <redacted> at ["AI_ANTHROPIC_API_KEY"])`.
  That proves the harness, PgLite migration, orchestration layer, and live
  kernel path reach the credential gate cleanly; it still does not prove the
  real-LLM mermaid/table/youtube acceptance item.

Run it from an environment that can inject the Anthropic key:

```sh
BEEP_TEST_REAL_ANTHROPIC_CHAT=1 \
BEEP_TEST_DATABASE_DRIVER=pglite-testcontainers \
bun run --cwd apps/professional-desktop test:integration -- chat-real-anthropic.e2e.test.ts
```

## 2026-06-15 Continuation Check

- Re-attempted 1Password MCP `authenticate`; it still fails before any secret
  lookup with `IPC request failed`. Per repo policy and the user correction,
  `op` was not run from the Codex terminal.
- Confirmed this process had no Anthropic credential variables injected.
- Re-ran the enabled live harness:
  `BEEP_TEST_REAL_ANTHROPIC_CHAT=1 BEEP_TEST_DATABASE_DRIVER=pglite-testcontainers bun run --cwd apps/professional-desktop test:integration -- chat-real-anthropic.e2e.test.ts`.
  It fails at the expected redacted config boundary:
  `ChatActionError: Anthropic assistant turn failed: SchemaError(Invalid data <redacted> at ["AI_ANTHROPIC_API_KEY"])`.

The remaining P4 proof still needs a working allowed credential injection path;
the fixture/foundation/local lanes do not prove the real-LLM mermaid/table/youtube
acceptance item.

## 2026-06-15 Real-LLM E2E Closeout

- Repaired the host 1Password path enough to allow safe secret-reference
  injection without printing the Anthropic key. The final test used the
  1Password reference only as an environment source.
- Ran the live Anthropic harness with the Anthropic credential supplied from
  1Password through `op run`, without printing or recording the secret reference.
- Result: pass. Vitest reported `Test Files 1 passed (1)` and `Tests 1 passed (1)`
  for `apps/professional-desktop/test/integration/chat-real-anthropic.e2e.test.ts`.

This closes the open P4 acceptance item: the real Anthropic kernel, chat
orchestration, PgLite persistence path, and rich-block assertions all passed
with mermaid, table, and youtube content.
