# Handoff P2

## Objective
Implement and audit foundation modules with compile-safe behavior while conforming to frozen P1 schema, type-fidelity, API-compat, and test contracts.

## Inputs
1. `outputs/p1-contract-freeze/schema-contract.md`
2. `outputs/p1-contract-freeze/type-fidelity-contract.md`
3. `outputs/p1-contract-freeze/public-api-compat-contract.md`
4. `outputs/p1-contract-freeze/test-contract.md`
5. `README.md` locked P2 scope list
6. `outputs/p0-baseline/module-dependency-order.md`
7. `packages/common/ontology/src` foundation files
8. Upstream source equivalents in `/home/elpresidank/YeeBois/dev/references/osdk-ts/packages/api/src`

## Required Work
Implement and audit this exact P2 scope and produce change evidence:

```text
src/Logger.ts
src/object/Attachment.ts
src/object/Media.ts
src/object/PropertySecurity.ts
src/object/Result.ts
src/PageResult.ts
src/ontology/OntologyMetadata.ts
src/ontology/PrimaryKeyTypes.ts
src/ontology/WirePropertyTypes.ts
src/ontology/VersionString.ts
src/ontology/valueFormatting/PropertyBooleanFormattingRule.ts
src/ontology/valueFormatting/PropertyKnownTypeFormattingRule.ts
src/ontology/valueFormatting/PropertyValueFormattingUtils.ts
src/ontology/valueFormatting/PropertyDateAndTimestampFormattingRule.ts
src/ontology/valueFormatting/PropertyNumberFormattingRule.ts
src/ontology/valueFormatting/PropertyValueFormattingRule.ts
src/mapping/DurationMapping.ts
src/mapping/DataValueMapping.ts
src/timeseries/timeseries.ts
src/OsdkMetadata.ts
src/OsdkObjectPrimaryKeyType.ts
src/util/IncludeValuesExtending.ts
```

Execution rules:
1. Implement missing modules and upgrade stubs in this scope only.
2. Preserve runtime schema conventions and annotation requirements from `schema-contract.md`.
3. Preserve high-fidelity generic behavior from `type-fidelity-contract.md`.
4. Avoid stable/unstable entrypoint work outside the locked P2 scope.
5. Record every changed file and rationale in P2 output artifacts.

## Deliverables
- `outputs/p2-foundation/implementation-log.md`
- `outputs/p2-foundation/changed-files-manifest.md`

## Completion Checklist
- [ ] P2 module scope complete.
- [ ] Foundation compiles.
- [ ] Type and runtime tests for touched modules pass.
- [ ] No unresolved recursion blocker remains for P3 ontology-core start.
- [ ] P3 handoff + prompt authored.

## Required Checks
- [ ] `bun run beep docs laws`
- [ ] `bun run beep docs skills`
- [ ] `bun run beep docs policies`
- [ ] `bun run --cwd packages/common/ontology check`
- [ ] `bun run --cwd packages/common/ontology test`
- [ ] `bun run test:types`
- [ ] `bun run agents:pathless:check` (if prompt/handoff/agent docs edited)

## Memory Protocol
1. Route Graphiti traffic through `http://127.0.0.1:8123/mcp`.
2. Before fan-out work, check proxy health: `curl -fsS http://127.0.0.1:8123/healthz`.
3. During fan-out work, monitor queue pressure: `curl -fsS http://127.0.0.1:8123/metrics`.
4. If proxy is unavailable, report exactly: `graphiti-memory skipped: proxy unavailable`.
5. If metrics show rejections or sustained queue growth, reduce parallelism and continue.

## Exit Gate
P2 closes when locked foundation scope is complete, checks pass, and P3 can start without reopening P1 contract decisions.
