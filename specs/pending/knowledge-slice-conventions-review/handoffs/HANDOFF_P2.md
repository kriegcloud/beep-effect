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

## Work Queue

- Evaluate/implement candidates:
  - `packages/knowledge/server/src/Workflow/WorkflowPersistence.ts` (`WorkflowExecutionRecord`)
  - `packages/knowledge/server/src/adapters/GmailExtractionAdapter.ts` (`ExtractedEmailDocument`)
- Cross-cut checks:
  - ensure `@beep/*` aliases and boundary layering hold slice-wide
  - ensure boundary decoding exists for unknown inputs (Storage JSON, external APIs, LLM outputs, RPC)

## Required Verification

- Full slice:
  - `bunx turbo run check lint test --filter='@beep/knowledge-*' --ui=stream`

## Phase Completion Requirement (Handoffs)

- At end of Phase 2, create/update:
  - `handoffs/HANDOFF_P2.md`
  - `handoffs/P3_ORCHESTRATOR_PROMPT.md`

