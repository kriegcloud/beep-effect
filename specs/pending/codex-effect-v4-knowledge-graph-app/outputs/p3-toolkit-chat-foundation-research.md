# P3 Research: Toolkit + Chat Foundation

Date: 2026-02-22

## Phase objective

Implement one shared graph toolkit/service layer used by `/api/chat` and `/api/graph/search`.

## Source-proven API facts

From `.repos/effect-smol`:
- `Toolkit.make(...)` and `toolkit.toLayer({...handlers})` are the standard typed tool/handler pattern.
- `LanguageModel.generateText({ prompt, toolkit, ... })` supports tool-calling workflows for grounded chat.
- `HttpRouter.toWebHandler(layer)` returns `{ handler, dispose }` for Next route handler integration.

Relevant source files:
- `.repos/effect-smol/packages/effect/src/unstable/ai/Toolkit.ts`
- `.repos/effect-smol/packages/effect/src/unstable/ai/LanguageModel.ts`
- `.repos/effect-smol/packages/effect/src/unstable/http/HttpRouter.ts`

## High-impact design decisions for P3

1. Keep toolkit definitions and handlers in `src/lib/graph/tools.ts` as single source of truth.
2. Keep transport concerns in routes, not in toolkit handlers.
3. Use module-level cached web handlers to avoid per-request layer rebuild.
4. Use `runtime = "nodejs"` for chat and graph API routes.
5. Keep server-side auth gate explicit and reusable.

## Recommended file plan

- `apps/web/src/lib/graph/tools.ts`
- `apps/web/src/lib/graph/zep-client.ts`
- `apps/web/src/lib/effect/runtime.ts`
- `apps/web/src/app/api/chat/route.ts` (consumes shared toolkit)
- `apps/web/src/app/api/graph/search/route.ts` (consumes shared services)

## Canonical implementation shape

Toolkit pattern:
1. Define tools with `Tool.make`.
2. Build toolkit with `Toolkit.make(...)`.
3. Provide handlers via `toolkit.toLayer({...})`.
4. Reuse the same toolkit layer in chat route runtime composition.

Service pattern for graph search route:
1. Use the same underlying Zep client/service layer used by toolkit handlers.
2. Keep route payload mapping thin and deterministic.
3. Avoid duplicate query logic between graph route and toolkit handlers.

## Better Options

1. Recommended v1: keep all agent interaction through `/api/chat` with server-side tool-calling.
2. Optional v1.1: add a typed `/api/query` endpoint for deterministic graph lookups without model inference.
3. Optional v2: add signed service-token access for trusted automations if non-browser clients are needed.

## Verification pack

Command gates:

```bash
bun run check
bun run test
bun run lint
bun run build
```

Behavior gates:
- toolkit handlers return stable output shape for representative queries.
- chat route invokes shared toolkit handlers (no duplicate logic).
- graph search route uses shared query services.
- unauthorized requests are denied on protected routes.

## Rollout guidance for P3

- Validate toolkit and shared services in preview before high-traffic testing.
- Confirm traceability from chat answers back to toolkit calls.
- Keep one smoke test that verifies chat and graph routes hit the same retrieval layer.

## Rollback strategy

- If toolkit changes regress chat quality, roll back toolkit/service layer while preserving auth and ingestion features.
- Keep route wrappers stable so rollback scope stays inside service/tool modules.

## P3 phase risk gates

| Risk | Mitigation |
|------|------------|
| Chat and graph retrieval behavior diverges | Single toolkit/service modules and shared handlers only |
| Route rebuild overhead or leaks | Module-level cached `toWebHandler` output |
| Tool outputs drift from UI contract | Add stable contract tests for node/link payloads |

## References

- `.repos/effect-smol/packages/effect/src/unstable/ai/Toolkit.ts`
- `.repos/effect-smol/packages/effect/src/unstable/ai/LanguageModel.ts`
- `.repos/effect-smol/packages/effect/src/unstable/http/HttpRouter.ts`
- `specs/pending/codex-effect-v4-knowledge-graph-app/outputs/research.md`
