# Warnings Inventory (Baseline)

This spec targeted non-fatal Effect-related lint/warning messages emitted during knowledge-server test/check runs.

## Inventory

1. `effect(unnecessaryFailYieldableError)` in `packages/knowledge/server/test/Resilience/LlmResilience.test.ts`
- Symptom: `Effect.fail(new SomeYieldableError(...))` inside `Effect.gen`.
- Fix: Yield the `YieldableError` directly (keeps semantics identical).

2. `effect(schemaSyncInEffect)` in `packages/knowledge/server/test/Service/CrossBatchEntityResolver.test.ts`
- Symptom: `S.decodeSync(...)` executed inside an `Effect.gen` generator.
- Fix: Use effectful decode (`S.decodeUnknown(...)` + `yield*`) and `Effect.orDie` for test-only safety.

3. `effect(preferSchemaOverJson)` in `packages/knowledge/server/test/Service/OntologyRegistry.test.ts`
- Symptom: `JSON.stringify(...)` used to produce registry fixture JSON.
- Fix: Encode the fixture via `effect/Schema` (`S.encodeSync(S.parseJson(OntologyRegistryFile))`) for valid cases.
- Edge case: The invalid-schema test keeps an intentionally-invalid JSON literal string to ensure the service's decode+error path is exercised.

Notes:
- A transient `tsc` error was surfaced in `packages/knowledge/server/test/Service/ReconciliationService.test.ts` due to passing `{}` as a config argument; that was corrected by omitting the config argument entirely (using the service defaults).
