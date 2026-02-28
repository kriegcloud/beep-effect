# P5 Type Parity Report

## Scope
- Verified P5 parity-critical surfaces:
  - `OsdkBase`
  - `OsdkObjectFrom`
  - `object/FetchPageResult`
  - `objectSet/*`
  - `derivedProperties/*`
  - `actions/*`
  - `queries/Queries`
  - `definitions/LinkDefinitions`
  - `util/LinkUtils`

## Verification method
1. Upstream-reference parity pass against:
- `/home/elpresidank/YeeBois/dev/references/osdk-ts/packages/api/src`
2. Compile checks:
- `bun run --cwd packages/common/ontology check`
3. Targeted heavy generic fixtures:
- `packages/common/ontology/test/types/p5-objectset-osdk-heavy.tst.ts`
- `bunx tstyche --config /tmp/tstyche-p5-ontology.json --root /home/elpresidank/YeeBois/projects/beep-effect`
4. Existing aggregate/object fixtures revalidated in same tstyche run.

## Heavy scenario findings
1. `OsdkObjectFrom` fidelity
- `ConvertProps` object<->interface key mapping preserved.
- Namespace stripping behavior for object->interface conversion preserved.
- `ExtractOptions` union extraction for `$rid`, `$allBaseProperties`, `$propertySecurities` preserved.
- `$propertySecurities` multiplicity behavior preserved (`PropertySecurity[]` vs `PropertySecurity[][]`).
2. `ObjectSet` fidelity
- `fetchPage` inference with selected keys and include-rid option preserved.
- `withProperties` derived-property projection and downstream select typing preserved.
- `pivotTo` linked-type object-set narrowing preserved.
- `fetchOne` primary-key and selected-key typing preserved.
- `nearestNeighbors` vector-key constraint and fluent return typing preserved.

## Compatibility adjustments (intentional)
1. Replaced upstream `any` usage with `unknown` / tighter generic constraints to satisfy repository law.
2. Avoided type assertions in runtime values (`NULL_VALUE` remains symbol sentinel without assertion-based branding).
3. Lowercase `definitions.ts` was made canonical to prevent TS casing collisions in this workspace.

## Result
- Parity status for P5 scope: **PASS**
- Compile status: **PASS**
- Heavy generic scenario status: **PASS**
- Runtime/test/docgen gate status: **PASS**

## Residual risk
- `biome` reports informational (`i`) shorthand-function-type suggestions in `objectSet/ObjectSet.ts`; these are non-blocking and do not affect type behavior.
