# P1 Type Fidelity Contract

## Decision status

- Frozen on 2026-02-26.
- Scope: compile-time parity and generic behavior guarantees for `@beep/ontology`.

## Source anchors

1. `/home/elpresidank/YeeBois/dev/references/osdk-ts/packages/api/src/OsdkObjectFrom.ts`
2. `/home/elpresidank/YeeBois/dev/references/osdk-ts/packages/api/src/object/FetchPageArgs.ts`
3. `/home/elpresidank/YeeBois/dev/references/osdk-ts/packages/api/src/ontology/ObjectOrInterface.ts`
4. `/home/elpresidank/YeeBois/dev/references/osdk-ts/packages/api/src/ontology/ObjectTypeDefinition.ts`
5. `/home/elpresidank/YeeBois/dev/references/osdk-ts/packages/api/src/queries/Queries.ts`
6. `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/ontology/src`

## Non-negotiable fidelity locks

1. Preserve generic parameter order, defaults, and constraints for parity-critical types.
2. Preserve conditional and distributive type behavior for option extraction and property mapping.
3. Preserve key inference behavior for `PropertyKeys`, conversion maps, and query/action helper types.
4. Preserve deprecated compatibility aliases where upstream keeps them (for example `OsdkObject`).
5. No type safety degradation via `any`, type assertions, non-null assertions, or `ts-ignore` directives.
6. Keep Effect-first law compliance while matching upstream type intent.

## Critical parity surfaces

| Surface | Required invariants | Phase delivery |
|---|---|---|
| `Osdk.Instance` (`OsdkObjectFrom`) | Preserve options behavior for `$rid`, `$allBaseProperties`, `$propertySecurities`, property projection, and `$as`/`$clone` return typing | P5 |
| `ConvertProps` and prop-map helpers | Preserve interface/object conversion rules and namespace stripping behavior | P5 |
| `ObjectSetArgs` / `FetchPageArgs` | Preserve select/order options and nullability option extraction behavior | P5 |
| `PropertyKeys` and `PropertyKeys.Filtered` | Preserve compile-time key filtering by wire property type | P3 |
| `PrimaryKeyType` and `OsdkObjectPrimaryKeyType` bridge | Preserve intersection behavior with wire-to-client primary key mapping | P2-P5 |
| `SimplePropertyDef` transformations | Preserve `ToPropertyDef` and `ToRuntimeProperty` conversion behavior | P3 |
| `QueryParam` / `QueryResult` helper families | Preserve parameter/result primitive, object, interface, and aggregation mapping behavior | P5 |
| Aggregate/groupby generic surfaces | Preserve key/value coupling and grouping result type relationships | P4 |

## Type construction rules

1. Any intentionally widened type must be justified against upstream behavior and recorded in phase output notes.
2. Helper types that encode never-detection and option extraction (`IsNever`, extraction helpers) must remain semantically equivalent.
3. Compatibility aliases (`Ontology*`) must re-export canonical parity types and cannot fork type logic.
4. Compile-time metadata carrier pattern (`__DefinitionMetadata`) remains the authoritative type source for property and link inference.

## Compile-time verification contract

1. Type verification uses `tstyche` fixtures under `packages/common/ontology/test/types`.
2. Required fixture groups:
   - `osdk-instance-options`: checks `$rid`, `$allBaseProperties`, `$propertySecurities`
   - `convert-props`: checks interface/object conversion mapping
   - `property-keys-filtered`: checks key filtering and wire-property constraints
   - `simple-property-def`: checks runtime/property metadata conversion
   - `query-param-result`: checks query helper conversion behavior
3. Each fixture group must include positive and negative cases.
4. No phase may close with failing or skipped parity fixtures.

## Acceptance criteria

- Parity-critical generic surfaces keep upstream-equivalent behavior.
- Compile-time fixtures prove heavy generic scenarios without unsafe typing escapes.
- Type-fidelity decisions are complete and implementation-ready for P2-P5 execution.
