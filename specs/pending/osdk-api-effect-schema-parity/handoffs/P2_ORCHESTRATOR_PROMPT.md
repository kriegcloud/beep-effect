# P2 Orchestrator Prompt

## 1. Context
P1 contract freeze is complete and implementation can begin without architecture rework.

## 2. Mission
Implement and audit low-dependency foundation modules with strict conformance to frozen schema, type-fidelity, API-compat, and test contracts.

## 3. Inputs
1. `outputs/p1-contract-freeze/schema-contract.md`
2. `outputs/p1-contract-freeze/type-fidelity-contract.md`
3. `outputs/p1-contract-freeze/public-api-compat-contract.md`
4. `outputs/p1-contract-freeze/test-contract.md`
5. P2 module scope list from `README.md`
6. `outputs/p0-baseline/module-dependency-order.md`
7. `handoffs/HANDOFF_P2.md`

## 4. Non-negotiable locks
1. Preserve high type fidelity for all touched surfaces.
2. Preserve established ontology annotation conventions.
3. No unsafe type escapes.
4. Keep module/file naming aligned with upstream parity goals.
5. Keep unstable work deferred to P6.
6. Honor hybrid parity plus alias compatibility policy.

## 5. Agent assignments
1. `foundation-implementation`
2. `foundation-parity-audit`
3. `foundation-type-fixture-audit`

## 6. Required outputs
1. `outputs/p2-foundation/implementation-log.md`
2. `outputs/p2-foundation/changed-files-manifest.md`

Locked module scope for this phase:

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

## 7. Required checks
1. Discovery commands:
   - `bun run beep docs laws`
   - `bun run beep docs skills`
   - `bun run beep docs policies`
2. Package-level checks:
   - `bun run --cwd packages/common/ontology check`
   - `bun run --cwd packages/common/ontology test`
   - `bun run test:types`
3. If prompt/handoff/agent docs are edited:
   - `bun run agents:pathless:check`

## 8. Exit gate
P2 scope complete, checks pass, no unresolved recursion blockers for P3 ontology core start, and P3 handoff/prompt authored.

## 9. Memory protocol
1. Route graphiti-memory via proxy `127.0.0.1:8123`.
2. Run `curl -fsS http://127.0.0.1:8123/healthz` before fan-out.
3. Monitor `curl -fsS http://127.0.0.1:8123/metrics` during fan-out.
4. If unavailable, report exactly `graphiti-memory skipped: proxy unavailable` and continue.
5. Reduce parallelism if queue rejection or pressure signals appear.

## 10. Handoff document pointer
`handoffs/HANDOFF_P2.md`
