# P3 Type Fidelity Notes

## Summary

P3 core contracts now match upstream generic shape for ontology SCC surfaces while enforcing repository typing laws (`no any`, no assertions, no ts-ignore). The highest-risk compile-time behaviors for this phase (`SimplePropertyDef`, `ObjectSpecifier`, metadata carriers, and fetch-arg key propagation) are implemented and fixture-verified.

## Critical fidelity surfaces implemented

1. `SimplePropertyDef`
   - Preserved `Make`, `FromPropertyMetadata`, `ExtractMultiplicity`, `ExtractWirePropertyType`, `ExtractNullable`, `ToPropertyDef`, and `ToRuntimeProperty` behavior.
   - Preserved multiplicity + nullable conversion rules and runtime base-type mapping via `GetClientPropertyValueFromWire`.
2. `ObjectTypeDefinition` + `ObjectOrInterface`
   - Preserved compile-time metadata carrier pattern via `CompileTimeMetadata<T>` and property/link extraction helpers.
   - Preserved derived-property metadata injection contract (`DerivedObjectOrInterfaceDefinition.WithDerivedProperties`).
   - Preserved `PropertyKeys` and `PropertyKeys.Filtered` key inference behavior.
3. `ObjectSpecifier`
   - Preserved object/interface discriminator behavior for branded `__apiName`.
   - Preserved interface extension behavior that includes `implementedBy[number]` when compile-time interface metadata is available.
4. `FetchPageArgs`
   - Preserved ordering/select/nullability generic layering and `SelectArgToKeys` projection behavior.
   - Preserved augmentation carriers (`Augment`, `Augments`) and async/page argument composition.
5. Canonical support modules
   - Added canonical `PropertyValueMapping`, `OsdkObject`, and `Definitions` contracts with upstream-equivalent mapping/conversion semantics adapted to local package primitives.

## Intentional deviations from upstream and rationale

1. `any` -> constrained alternatives
   - Replaced upstream `any` defaults/usages with concrete bounds (`unknown`, bounded generics, explicit record/value unions) to satisfy repository law while retaining behavior.
2. `definitions.ts` casing convergence
   - Canonical `Definitions.ts` introduced per locked scope.
   - Lowercase `definitions.ts` removed due TypeScript casing conflict in this package build graph.
3. Type-parameter retention under strict TS checks
   - `FetchPageArgs` helper interfaces include compile-time-only phantom fields typed as optional `never` to keep upstream generic slots while satisfying `noUnusedParameters` enforcement.

## Fixture verification evidence

Targeted P3 fixtures:

- `packages/common/ontology/test/types/simple-property-def.tst.ts`
- `packages/common/ontology/test/types/object-specifier.tst.ts`

Executed command:

- `bunx tstyche --config /tmp/tstyche-p3-ontology.json --root /home/elpresidank/YeeBois/projects/beep-effect`

Result:

- 2/2 files passed
- 8/8 tests passed
- 21/21 assertions passed

## Residual risks

1. `FetchPageArgs` phantom fields are compile-time artifacts introduced only to satisfy strict unused-type-parameter enforcement; they should be revisited if lint/TS policy changes.
2. Canonical-vs-legacy path compatibility (`Definitions` vs historical lowercase module) should be validated again during P6 public-surface/alias phase.

## Memory protocol note

- graphiti-memory skipped: proxy unavailable
