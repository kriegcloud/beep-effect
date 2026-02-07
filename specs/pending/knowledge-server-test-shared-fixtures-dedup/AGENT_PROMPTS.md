# Agent Prompts: Knowledge Server Test Shared Fixtures Dedup

## P1: Discovery (`codebase-researcher`)

```text
You are executing Phase 1 of spec: knowledge-server-test-shared-fixtures-dedup.

Scope:
- packages/knowledge/server/test/**

Tasks:
1. Build duplication inventory for:
   - layer assembly patterns
   - mock service constructors
   - fixture factories (entity/relation/context builders)
2. Group duplicates into candidate shared modules under packages/knowledge/server/test/_shared.
3. Provide file-level references for every candidate and estimate migration difficulty (low/medium/high).

Output file:
- specs/pending/knowledge-server-test-shared-fixtures-dedup/outputs/codebase-context.md

Constraints:
- Read-only phase: no code edits.
- Be explicit about false positives where similar code should remain local.
```

## P2: Evaluation (`code-reviewer` + `architecture-pattern-enforcer`)

```text
You are executing Phase 2 of spec: knowledge-server-test-shared-fixtures-dedup.

Inputs:
- outputs/codebase-context.md

Tasks:
1. Define target shared modules and ownership boundaries.
2. Decide which duplicates should be merged vs intentionally kept local.
3. Produce migration sequence minimizing breakage risk.
4. Define acceptance checks for semantic equivalence.

Outputs:
- specs/pending/knowledge-server-test-shared-fixtures-dedup/outputs/evaluation.md
- specs/pending/knowledge-server-test-shared-fixtures-dedup/outputs/remediation-plan.md
```

## P3: Implementation (`effect-code-writer` + `test-writer`)

```text
You are executing Phase 3 of spec: knowledge-server-test-shared-fixtures-dedup.

Inputs:
- outputs/evaluation.md
- outputs/remediation-plan.md

Tasks:
1. Extract shared helpers into packages/knowledge/server/test/_shared.
2. Migrate prioritized tests to consume shared helpers.
3. Remove duplicate local helper code where migration is complete.
4. Run check/test commands and capture results.

Constraints:
- Preserve existing test assertions/behavior.
- No any/ts-ignore/unchecked casts.
- Keep helper APIs small and composable.
```

## P4: Verification and Closeout (`code-reviewer` + `doc-writer` + `reflector`)

```text
You are executing Phase 4 of spec: knowledge-server-test-shared-fixtures-dedup.

Tasks:
1. Verify duplication reduction goals are met.
2. Write verification report with migrated file list and remaining intentional duplication.
3. Update REFLECTION_LOG.md with concrete lessons and prompt refinements.
4. Prepare next handoff pair if additional sessions remain.

Outputs:
- outputs/verification-report.md
- handoffs/HANDOFF_P[N+1].md
- handoffs/P[N+1]_ORCHESTRATOR_PROMPT.md
```
