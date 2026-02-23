# Agent Prompts

## P1 Discovery Prompt (codebase-researcher)

```md
Audit workflow parity migration readiness for `knowledge-effect-workflow-migration`.

Scope:
- reference: `.repos/effect-ontology/packages/@core-v2/src`
- target: `packages/knowledge/server/src/Workflow`, `packages/knowledge/server/src/Runtime`

Produce:
1. `outputs/P1_COMPATIBILITY_REPORT.md`
2. `outputs/P1_FILE_INVENTORY.md` (include delete candidates for P5)
3. `outputs/P1_RISK_REGISTER.md`

Requirements:
- call out API/version mismatches
- map persistence assumptions
- identify tests to preserve
- create next-phase handoff docs:
  - `handoffs/HANDOFF_P2.md`
  - `handoffs/P2_ORCHESTRATOR_PROMPT.md`
```

## P2 Design Prompt (architecture-pattern-enforcer + doc-writer)

```md
Using P1 artifacts, create a migration blueprint to adopt `@effect/workflow`.

Produce:
- `outputs/P2_MIGRATION_BLUEPRINT.md`
- `handoffs/HANDOFF_P3.md`
- `handoffs/P3_ORCHESTRATOR_PROMPT.md`

Include:
- phase sequencing
- rollback plan
- deletion plan for legacy code
- acceptance gates per phase
- create next-phase handoff docs:
  - `handoffs/HANDOFF_P3.md`
  - `handoffs/P3_ORCHESTRATOR_PROMPT.md`
```

## P3/P4 Implementation Prompt (effect-code-writer + test-writer)

```md
Implement the migration blueprint incrementally.

Must do:
- keep previous parity behavior intact
- make `@effect/workflow` the default path by end of P4
- maintain passing checks/lint/tests at each milestone
- update parity evidence docs
- at end of P3, generate:
  - `handoffs/HANDOFF_P4.md`
  - `handoffs/P4_ORCHESTRATOR_PROMPT.md`
- at end of P4, generate:
  - `handoffs/HANDOFF_P5.md`
  - `handoffs/P5_ORCHESTRATOR_PROMPT.md`
```

## P5 Cleanup Prompt (effect-code-writer + code-reviewer)

```md
Delete superseded custom workflow engine code and stale tests/docs.

Completion proof:
- `outputs/P5_LEGACY_REMOVAL_REPORT.md`
- grep evidence for removed symbols and wiring
- verification commands all pass
- next-phase handoff docs:
  - `handoffs/HANDOFF_P6.md`
  - `handoffs/P6_ORCHESTRATOR_PROMPT.md`
```
