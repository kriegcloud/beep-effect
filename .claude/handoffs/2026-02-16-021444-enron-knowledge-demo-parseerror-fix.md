# Handoff: Enron Knowledge Demo Phase 2 ParseError Fix

## Session Metadata
- Created: 2026-02-16 02:14:44
- Project: /home/elpresidank/YeeBois/projects/beep-effect2
- Branch: enron-knowledge-demo-integration
- Session duration: ~2h

### Recent Commits (for context)
  - 9a95b579cf phase 2 verification started
  - 16f0a79123 Merge commit '364575bdfe7930288932e5c0de72b152826cabdf' as '.repos/effect-file-manager'
  - 364575bdfe Squashed '.repos/effect-file-manager/' content from commit 28eedd82e5
  - 1bf86b90c6 phase 2 verification started
  - b490827d79 phase 1 complete

## Handoff Chain

- **Continues from**: [2026-01-28-032124-css-icon-replacement-orchestration.md](./2026-01-28-032124-css-icon-replacement-orchestration.md)
  - Previous title: CSS Icon to Phosphor Replacement Orchestration
- **Supersedes**: None

## Current State Summary

Phase 2 migration for `apps/todox/src/app/knowledge-demo` is mostly in place: route-level gate is restored, curated ingest payload prep is wired, and ontology loading was switched from filesystem reads to an inlined TTL string to avoid `cwd`-based path failures. The current blocker is a runtime ParseError when clicking `Ingest Scenario`: `batch_start` rejects `documents[0]` as `Expected BatchDocument` even though shape looks correct. Root cause is now identified: Effect RPC `fromTaggedRequest` calls `Contract.make(payload)`, and `StartBatch.Contract` requires `documents` entries to be `BatchDocument` class instances, not plain objects. Next session should patch this mapping and re-verify ingest end-to-end.

## Codebase Understanding

## Architecture Overview

- `knowledge-demo` UI orchestration lives in `KnowledgeDemoClientPage.tsx` and now uses atom-based RPC actions from `rpc-client.ts`.
- Knowledge RPC transport target is `ws(s)://.../v1/knowledge/rpc` with NDJSON serialization.
- Curated ingest payload assembly is server-side in `actions.ts` and currently resolves docs from local curated JSON cache.
- Feature flag gating is route-level in `page.tsx` and intentionally returns `notFound()` when disabled.
- Batch contracts are class-based (`S.Class` / `S.TaggedRequest`), so RPC payload construction must respect runtime class instances where required.

## Critical Files

| File | Purpose | Relevance |
|------|---------|-----------|
| `apps/todox/src/app/knowledge-demo/KnowledgeDemoClientPage.tsx` | Route orchestration + ingest click handler | Currently sends plain document objects to `startKnowledgeBatch` |
| `apps/todox/src/app/knowledge-demo/rpc-client.ts` | Atom RPC client wiring | Uses `client.batch_start(...)`, path where payload instance conversion can be centralized |
| `apps/todox/src/app/knowledge-demo/actions.ts` | Curated scenario payload preparation | Produces deterministic doc set, now uses inline ontology content |
| `apps/todox/src/app/knowledge-demo/constants.ts` | Demo constants | Holds `ENRON_DEMO_ONTOLOGY_ID` and new inlined `ENRON_DEMO_ONTOLOGY_CONTENT` |
| `apps/todox/src/app/knowledge-demo/page.tsx` | Feature gate | Gate logic fixed, supports `ENABLE_ENRON_KNOWLEDGE_DEMO` and `NEXT_PUBLIC_ENABLE_ENRON_KNOWLEDGE_DEMO` |
| `packages/knowledge/domain/src/entities/Batch/contracts/StartBatch.contract.ts` | Contract schema for `batch_start` | Defines `BatchDocument` class and caused ParseError path |

## Key Patterns Discovered

- For Effect RPC requests built from `S.TaggedRequest`, `RpcClient` invokes `rpc.payloadSchema.make(payload)` before transport.
- `Contract.make(...)` enforces class-valued fields immediately; passing plain object literals for `S.Class` fields can throw ParseError.
- Demo constraints remain strict: curated scenarios only, explicit ingest action, no fallback mocks, 25-doc cap.
- Route gating is required and should not be removed to bypass debugging.

## Work Completed

### Tasks Finished

- [x] Restored route-level gate behavior and fixed env var key typo regression in `apps/todox/src/app/knowledge-demo/page.tsx`.
- [x] Added `.env.example` entry for `ENABLE_ENRON_KNOWLEDGE_DEMO`.
- [x] Replaced ontology filesystem load with inlined ontology content constant.
- [x] Reproduced and root-caused `BatchDocument` ParseError with isolated Bun repro.
- [x] Ran `bun run check --filter @beep/todox` successfully after ontology/gate updates.

## Files Modified

| File | Changes | Rationale |
|------|---------|-----------|
| `apps/todox/src/app/knowledge-demo/rpc-client.ts` | Switched to atom-runtime based RPC client hooks and typed methods | Phase 2 migration to Atom RPC flow |
| `apps/todox/src/app/knowledge-demo/actions.ts` | Removed ontology file read; now uses `ENRON_DEMO_ONTOLOGY_CONTENT` constant | Fix `ENOENT` from server-action `cwd` mismatch |
| `apps/todox/src/app/knowledge-demo/page.tsx` | Restored gate, fixed env key handling, normalized truthy parsing | Keep internal gate active without typo drift |
| `apps/todox/src/app/knowledge-demo/constants.ts` | Added full inlined `test-ontology.ttl` string constant | Deterministic ingest payload without filesystem dependency |
| `.env.example` | Added `ENABLE_ENRON_KNOWLEDGE_DEMO` documented flag | Make gate setup explicit for future sessions |
| `apps/todox/src/app/knowledge-demo/KnowledgeDemoClientPage.tsx` | Migrated call sites to new `useKnowledgeRpcClient` hooks | Phase 2 UI/RPC orchestration updates |

## Decisions Made

| Decision | Options Considered | Rationale |
|----------|-------------------|-----------|
| Inline ontology string for demo ingest | Keep filesystem load; compute repo-root path; inline constant | User-requested and removes brittle `cwd` dependency in server actions |
| Keep route gate enabled | Comment out gate temporarily; keep strict gate | Spec requires internal feature gate; bypassing caused false-positive route checks |
| Diagnose ParseError with direct schema repro | Trial-and-error UI edits only; isolate with contract-level script | Contract-level repro gave clear root cause quickly and deterministically |

## Pending Work

## Immediate Next Steps

1. Patch `batch_start` payload construction to instantiate `BatchDocument` entries (likely with `KnowledgeRpc.Batch.StartBatch.BatchDocument.make(...)`) before calling `client.batch_start(...)`.
2. Verify ingest flow manually in `/knowledge-demo` (authenticated session + active org), ensuring no ParseError and lifecycle progresses beyond `pending`.
3. Run verification commands again:
   - `bun run check --filter @beep/todox`
   - `bun run test --filter @beep/todox`
   - If runtime contracts were touched: `bun run check --filter @beep/knowledge-domain`

## Blockers/Open Questions

- [ ] Confirm best patch location for class instantiation: `KnowledgeDemoClientPage.tsx` callsite vs `rpc-client.ts` helper.
- [ ] Confirm whether additional class-wrapped fields exist for other RPC calls that may fail similarly after ingest fix.

## Deferred Items

- Meeting prep live LLM rewrite remains Phase 3 scope; do not expand scope while fixing ParseError.
- Potential formatting cleanup in `KnowledgeDemoClientPage.tsx` is deferred; it compiles but includes high-churn style diffs.

## Context for Resuming Agent

## Important Context

The ParseError is reproducible outside the UI and is not caused by ontology content or document text. Repro command used:

```bash
bun -e 'import * as S from "effect/Schema"; import { Contract } from "./packages/knowledge/domain/src/entities/Batch/contracts/StartBatch.contract"; import { SharedEntityIds, KnowledgeEntityIds } from "./packages/shared/domain/src/entity-ids/entity-ids"; Contract.make({ organizationId: SharedEntityIds.OrganizationId.create(), ontologyId: KnowledgeEntityIds.OntologyId.create(), ontologyContent: "x", documents: [{ documentId: "workspaces_document__c64da1bb-14d0-58e2-bde6-73a55e9e1eca", text: "hello" }] });'
```

This throws:

`Expected BatchDocument, actual {"documentId":"...","text":"..."}`

So the immediate fix is to build `documents` as `BatchDocument` instances before calling `batch_start`.

## Assumptions Made

- User has `ENABLE_ENRON_KNOWLEDGE_DEMO` enabled locally to access `/knowledge-demo`.
- Curated dataset files under `ENRON_CURATED_DATA_ROOT` are present (ingest now fails after payload parsing, not file loading).
- Active authenticated org session exists when testing ingest from the UI.

## Potential Gotchas

- `bun run test --filter @beep/todox` was started after latest changes but interrupted by user; do not assume pass for this exact working tree without rerun.
- `RpcClient.FromGroup` TypeScript types can appear permissive due structural typing; runtime class requirements still fail if not explicitly instantiated.
- Existing working tree already has multiple in-progress Phase 2 changes; avoid unrelated refactors while fixing ParseError.

## Environment State

## Tools/Services Used

- Next.js dev server with MCP discovery on `http://localhost:3000` (Next.js 16 canary).
- `bun` + `turbo` for monorepo checks/tests.
- Direct schema repro via `bun -e` command.

## Active Processes

- Next dev server listening on `:3000` (`next-server` process).

## Environment Variables

- `ENABLE_ENRON_KNOWLEDGE_DEMO`
- `NEXT_PUBLIC_ENABLE_ENRON_KNOWLEDGE_DEMO`
- `ENRON_CURATED_DATA_ROOT`

## Related Resources

- `specs/pending/enron-knowledge-demo-integration/README.md`
- `specs/pending/enron-knowledge-demo-integration/handoffs/HANDOFF_P2.md`
- `specs/pending/enron-knowledge-demo-integration/outputs/rpc-client-migration.md`
- `apps/todox/src/app/knowledge-demo/KnowledgeDemoClientPage.tsx`
- `apps/todox/src/app/knowledge-demo/rpc-client.ts`
- `apps/todox/src/app/knowledge-demo/actions.ts`
- `packages/knowledge/domain/src/entities/Batch/contracts/StartBatch.contract.ts`

---

**Security Reminder**: Before finalizing, run `validate_handoff.py` to check for accidental secret exposure.
