# Handoff P2

## Spec

- Name: `knowledge-slice-conventions-review`
- Location: `specs/pending/knowledge-slice-conventions-review`

## Phase Goal

- Phase 2 (Cross-Cut Review): consolidate cross-module conventions, close deferred items that require coordination, and optionally implement selected `S.Class` conversions.

## Starting State (From P1)

- Module traversal is complete; per-module audits and verification are recorded in:
  - `outputs/MODULE_AUDIT_MATRIX.md`
  - `outputs/modules/*.md`
  - `outputs/VERIFICATION_REPORT.md`
- Candidate `S.Class` conversions are recorded in:
  - `outputs/SCHEMA_CLASS_REFACTOR_PLAN.md`

## Completed Work (Phase 2)

- Implemented planned `S.Class` conversions (with boundary decodes + tests):
  - `packages/knowledge/server/src/Workflow/WorkflowPersistence.ts`: `WorkflowExecutionRecord` converted to `S.Class`, added `decodeWorkflowExecutionRecord`, and decode DB rows at `getExecution` and `findLatestBatchExecutionByBatchId`.
  - `packages/knowledge/server/src/adapters/GmailExtractionAdapter.ts`: `EmailMetadata` + `ExtractedEmailDocument` converted to `S.Class`; adapter now decodes extracted documents before returning (tests assert `instanceof ExtractedEmailDocument`).
- Codified schema-class conventions (so future sessions follow the same rules):
  - `AGENTS.md`
  - `documentation/EFFECT_PATTERNS.md`
  - `.codex/rules/effect-patterns.md`
  - `.agents/skills/reflect/MEMORY.md`

## Required Verification

- Full slice:
  - `bunx turbo run check lint test --filter='@beep/knowledge-*' --ui=stream` PASS (2026-02-07)
- Module (post-P2 edits):
  - `bun run --cwd packages/knowledge/server check && bun run --cwd packages/knowledge/server lint && bun run --cwd packages/knowledge/server test` PASS (2026-02-07)

## Phase Completion Requirement (Handoffs)

- At end of Phase 2, create/update:
  - `handoffs/HANDOFF_P2.md`
  - `handoffs/P3_ORCHESTRATOR_PROMPT.md`

## What Remains (Phase 3)

- Produce Phase 3 synthesis outputs:
  - summarize completed vs deferred work (should be no remaining schema-class candidates)
  - risk assessment + follow-ups
- Create Phase 3 handoff docs:
  - `handoffs/P3_ORCHESTRATOR_PROMPT.md`
  - `handoffs/HANDOFF_P3.md`
