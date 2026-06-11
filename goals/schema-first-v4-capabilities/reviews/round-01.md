# Review Round 01

Packet-scoped adaptation of `quality-review-fix-loop`.

Baseline proof before fixes:

- `test "$(wc -m < goals/schema-first-v4-capabilities/GOAL.md)" -le 4000`
- `jq . goals/schema-first-v4-capabilities/ops/manifest.json`
- `bunx tsc -p scratchpad/tsconfig.json --pretty false`
- `bunx vitest run --config scratchpad/vitest.config.ts`
- `bun run beep yeet verify --plan --json`
- `git diff --check -- package.json bun.lock scratchpad/index.ts`

## Panel Summary

- Packet Launchability: 0 required findings.
- Generated-Code Risk: 0 required findings, with SchemaRepresentation hardening suggestions.
- Property Testing: 3 required findings, 1 advisory.
- Effect v4 Source Fidelity: 5 required findings.
- Enforcement And Yeet: 4 required findings.
- Scratch Teaching Quality: 4 required findings.
- Red-team pass: handled locally because the sub-agent limit was reached.

## Findings

### QRFL-001: Seed Faker From FastCheck Entropy

- `round`: 01
- `reviewer`: Property Testing, Scratch Teaching, Effect v4 Source Fidelity
- `label`: issue
- `blockingStatus`: blocking
- `severity`: P1-high
- `doctrineBucket`: target-doctrine-violation
- `sourceRefs`: `.repos/effect-v4/packages/effect/SCHEMA.md:5735`
- `affectedFiles`: `scratchpad/test/schema-arbitrary-fastcheck.test.ts`, `goals/schema-first-v4-capabilities/SPEC.md`
- `evidence`: The original scratch and spec used `fc.constant(null).map(() => faker...)`, which seeded FastCheck but not Faker.
- `impact`: Future tests could be non-reproducible and teach a weak arbitrary pattern.
- `suggestedFix`: Use a helper that seeds Faker from `fc.nat()` before generating values.
- `recommendedSkillOrAgent`: schema-first-development
- `fixerGroup`: scratch and packet docs
- `acceptanceCommands`: `bunx tsc -p scratchpad/tsconfig.json --pretty false`; `bunx vitest run --config scratchpad/vitest.config.ts`
- `testsNeeded`: runtime and type
- `dependencies`: none
- `status`: fixed
- `fixedCommit`: pending

### QRFL-002: Align Timeout Schema And Arbitrary Domain

- `round`: 01
- `reviewer`: Property Testing
- `label`: issue
- `blockingStatus`: blocking
- `severity`: P1-high
- `doctrineBucket`: target-doctrine-violation
- `sourceRefs`: `scratchpad/test/schema-arbitrary-fastcheck.test.ts`
- `affectedFiles`: `scratchpad/test/schema-arbitrary-fastcheck.test.ts`
- `evidence`: The original `TimeoutMs` schema allowed finite decimals but the override generated only integers.
- `impact`: The scratch claimed schema-derived coverage while narrowing the schema domain.
- `suggestedFix`: Model timeouts as `S.Int` or include finite decimal generation.
- `recommendedSkillOrAgent`: schema-first-development
- `fixerGroup`: scratch
- `acceptanceCommands`: `bunx tsc -p scratchpad/tsconfig.json --pretty false`; `bunx vitest run --config scratchpad/vitest.config.ts`
- `testsNeeded`: runtime and type
- `dependencies`: none
- `status`: fixed
- `fixedCommit`: pending

### QRFL-003: Preserve Correct Fixture Use Cases

- `round`: 01
- `reviewer`: Property Testing, Red Team
- `label`: issue
- `blockingStatus`: blocking
- `severity`: P2-medium
- `doctrineBucket`: missing-doctrine
- `sourceRefs`: `goals/schema-first-v4-capabilities/SPEC.md`
- `affectedFiles`: `goals/schema-first-v4-capabilities/SPEC.md`, `README.md`
- `evidence`: The packet encouraged replacing static fixtures without naming valid fixture use cases.
- `impact`: Future agents might delete valuable golden payloads, snapshots, and regression repros.
- `suggestedFix`: State that schema-derived properties complement fixtures for domain-wide invariants.
- `recommendedSkillOrAgent`: quality-review-fix-loop
- `fixerGroup`: packet docs
- `acceptanceCommands`: markdown review; scratch tests
- `testsNeeded`: none
- `dependencies`: none
- `status`: fixed
- `fixedCommit`: pending

### QRFL-004: Correct Defaults Scratch Teaching Issues

- `round`: 01
- `reviewer`: Scratch Teaching Quality
- `label`: issue
- `blockingStatus`: blocking
- `severity`: P1-high
- `doctrineBucket`: target-doctrine-violation
- `sourceRefs`: `scratchpad/index.ts`
- `affectedFiles`: `scratchpad/index.ts`
- `evidence`: The good example used `BadSchema` identity/annotation, repeated labels, typoed `Defualts`, and taught local `*Schema` suffixes.
- `impact`: The scratch file is a packet teaching artifact; misleading names would propagate bad examples.
- `suggestedFix`: Rename examples to domain-ish names, fix annotations, fix defaults, and remove unnecessary `*Schema` suffixes.
- `recommendedSkillOrAgent`: schema-first-development
- `fixerGroup`: scratch
- `acceptanceCommands`: `bunx tsc -p scratchpad/tsconfig.json --pretty false`
- `testsNeeded`: type
- `dependencies`: none
- `status`: fixed
- `fixedCommit`: pending

### QRFL-005: Clarify `withKeyDefaults` Type/Encoded Semantics

- `round`: 01
- `reviewer`: Effect v4 Source Fidelity
- `label`: issue
- `blockingStatus`: blocking
- `severity`: P1-high
- `doctrineBucket`: target-doctrine-violation
- `sourceRefs`: `packages/foundation/modeling/schema/src/SchemaUtils/withKeyDefaults.ts`; `.repos/effect-v4/packages/effect/SCHEMA.md`
- `affectedFiles`: `goals/schema-first-v4-capabilities/SPEC.md`
- `evidence`: The packet described `withKeyDefaults` too loosely for transformed schemas.
- `impact`: Future agents could use one default value where decoded and encoded representations differ.
- `suggestedFix`: Say `withKeyDefaults` is only for defaults valid on both sides; otherwise use decoding type defaults.
- `recommendedSkillOrAgent`: schema-first-development
- `fixerGroup`: packet docs
- `acceptanceCommands`: markdown review
- `testsNeeded`: none
- `dependencies`: none
- `status`: fixed
- `fixedCommit`: pending

### QRFL-006: Add `annotate` Vs `annotateKey`

- `round`: 01
- `reviewer`: Effect v4 Source Fidelity
- `label`: issue
- `blockingStatus`: blocking
- `severity`: P2-medium
- `doctrineBucket`: missing-doctrine
- `sourceRefs`: `.repos/effect-v4/packages/effect/SCHEMA.md`; `.repos/effect-v4/packages/effect/src/Schema.ts`
- `affectedFiles`: `goals/schema-first-v4-capabilities/SPEC.md`
- `evidence`: The packet discussed schema annotations but not key annotations for field-position metadata.
- `impact`: Future generated docs/codegen could lose field-specific messages and descriptions.
- `suggestedFix`: Add a short rule and example for `annotate` vs `annotateKey`.
- `recommendedSkillOrAgent`: jsdoc-annotation-specialist
- `fixerGroup`: packet docs
- `acceptanceCommands`: markdown review
- `testsNeeded`: none
- `dependencies`: none
- `status`: fixed
- `fixedCommit`: pending

### QRFL-007: Bound SchemaRepresentation Claims

- `round`: 01
- `reviewer`: Effect v4 Source Fidelity, Generated-Code Risk
- `label`: issue
- `blockingStatus`: blocking
- `severity`: P1-high
- `doctrineBucket`: pending-automation
- `sourceRefs`: `.repos/effect-v4/packages/effect/SCHEMA.md`; `.repos/effect-v4/packages/effect/src/SchemaRepresentation.ts`; `packages/drivers/box/scripts/generate.ts`
- `affectedFiles`: `goals/schema-first-v4-capabilities/SPEC.md`, `research/reports/effect-v4-schema-capabilities.md`
- `evidence`: The original packet did not name representation limits or the Box generator's TypeScript declaration source.
- `impact`: A future agent could overreach and attempt generator replacement before source conversion and parity are proven.
- `suggestedFix`: Add limitations and side-by-side spike exit criteria.
- `recommendedSkillOrAgent`: schema-first-development
- `fixerGroup`: packet docs
- `acceptanceCommands`: markdown review
- `testsNeeded`: none
- `dependencies`: none
- `status`: fixed
- `fixedCommit`: pending

### QRFL-008: Specify Schema Diagnostics Correctly

- `round`: 01
- `reviewer`: Effect v4 Source Fidelity
- `label`: issue
- `blockingStatus`: blocking
- `severity`: P2-medium
- `doctrineBucket`: target-doctrine-violation
- `sourceRefs`: `.repos/effect-v4/packages/effect/src/Schema.ts`; `.repos/effect-v4/packages/effect/src/SchemaIssue.ts`
- `affectedFiles`: `goals/schema-first-v4-capabilities/SPEC.md`, `research/reports/effect-v4-schema-capabilities.md`
- `evidence`: The original diagnostics section named the formatter but not `SchemaError.issue` or redaction requirements.
- `impact`: Future helpers could format the wrong value or leak sensitive data.
- `suggestedFix`: Specify `SchemaError.issue` and `S.Redacted` / `SchemaIssue.redact` before formatting.
- `recommendedSkillOrAgent`: effect-first-development
- `fixerGroup`: packet docs
- `acceptanceCommands`: markdown review
- `testsNeeded`: none
- `dependencies`: none
- `status`: fixed
- `fixedCommit`: pending

### QRFL-009: Do Not Overclaim Structured Yeet Category

- `round`: 01
- `reviewer`: Enforcement And Yeet
- `label`: issue
- `blockingStatus`: blocking
- `severity`: P1-high
- `doctrineBucket`: pending-automation
- `sourceRefs`: `packages/tooling/tool/cli/src/commands/Yeet/internal/QualityIssueIndex.ts`; `packages/tooling/tool/cli/src/commands/Quality/Tasks.ts`
- `affectedFiles`: `GOAL.md`, `SPEC.md`, `PLAN.md`, `ops/manifest.json`
- `evidence`: Current Yeet verify plans the outer `full:pre-push` step; structured schema-first category parsing needs P2 work.
- `impact`: The packet promised stronger issue artifacts than current tooling guarantees.
- `suggestedFix`: Mark structured `schema-first-policy` output as a P2 target with required failing fixture/parser proof.
- `recommendedSkillOrAgent`: yeet
- `fixerGroup`: packet docs
- `acceptanceCommands`: `bun run beep yeet verify --plan --json`
- `testsNeeded`: future parser or fixture test
- `dependencies`: none
- `status`: fixed
- `fixedCommit`: pending

### QRFL-010: Make Rule Cards Decision-Complete

- `round`: 01
- `reviewer`: Enforcement And Yeet, Red Team
- `label`: issue
- `blockingStatus`: blocking
- `severity`: P1-high
- `doctrineBucket`: missing-doctrine
- `sourceRefs`: `packages/tooling/tool/cli/src/commands/Lint/SchemaFirst.ts`; `goals/schema-first-v4-capabilities/SPEC.md`
- `affectedFiles`: `goals/schema-first-v4-capabilities/SPEC.md`, `PLAN.md`
- `evidence`: The original spec listed enforcement targets but not rule ids, matcher scope, severity, output, or escape strategy.
- `impact`: A future agent would need to invent policy decisions during implementation.
- `suggestedFix`: Add rule cards and P2 implementation sequencing.
- `recommendedSkillOrAgent`: schema-first-development
- `fixerGroup`: packet docs
- `acceptanceCommands`: markdown review
- `testsNeeded`: none now; future lint tests
- `dependencies`: QRFL-009
- `status`: fixed
- `fixedCommit`: pending

## Remaining Backlog

No required blockers remain after the packet patch. Future P2 implementation
must still create the actual structured schema-first lint output and Yeet parser
or step split before claiming full `schema-first-policy` artifact support.
