# P5 Orchestrator Prompt

## 1. Context
Primitive stack is complete. Heavy ObjectSet/Osdk/actions/query integration begins.

## 2. Mission
Implement and integrate interdependent ObjectSet, Osdk, actions, queries, and derived-property modules.

## 3. Inputs
1. P1 contracts
2. P4 outputs
3. `handoffs/HANDOFF_P5.md`

## 4. Non-negotiable locks
1. Preserve heavy generic fidelity.
2. Keep compile-time metadata wiring intact.
3. Maintain compatibility with future export parity checks.

## 5. Agent assignments
1. objectset core owner
2. osdk object/from owner
3. actions/queries owner
4. type parity verifier

## 6. Required outputs
1. `outputs/p5-objectset-osdk/implementation-log.md`
2. `outputs/p5-objectset-osdk/type-parity-report.md`

Locked module scope for this phase:

```text
src/OsdkBase.ts
src/object/FetchPageResult.ts
src/objectSet/BaseObjectSet.ts
src/objectSet/ObjectSetLinks.ts
src/objectSet/ObjectSetListener.ts
src/objectSet/ObjectSet.ts
src/objectSet/BulkLinkResult.ts
src/definitions/LinkDefinitions.ts
src/definitions.ts
src/derivedProperties/WithPropertiesAggregationOptions.ts
src/derivedProperties/Expressions.ts
src/derivedProperties/DerivedProperty.ts
src/OsdkObjectFrom.ts
src/actions/NullValue.ts
src/actions/ActionResults.ts
src/actions/Actions.ts
src/actions/ActionReturnTypeForOptions.ts
src/queries/Queries.ts
src/util/LinkUtils.ts
```

## 7. Required checks
1. Discovery commands
2. Heavy generic scenario checks for ObjectSet and OsdkObjectFrom

## 8. Exit gate
P5 integration complete and compile-stable; P6 handoff/prompt authored.

## 9. Memory protocol
Apply proxy health and metrics checks; fallback string on failure is mandatory.

## 10. Handoff document pointer
`handoffs/HANDOFF_P5.md`
