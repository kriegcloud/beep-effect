# P4 Equivalence Wave

Date: 2026-06-08

## Completed

- Remediated the two tracked `SFV4-equivalence` advisories:
  - `packages/foundation/modeling/schema/src/LocalDate/LocalDate.schema.ts`
  - `packages/foundation/modeling/schema/src/Timestamp/Timestamp.schema.ts`
- Replaced manual field comparisons inside exported dual `equals` helpers with
  `S.toEquivalence(LocalDate)` and `S.toEquivalence(Timestamp)`.
- Preserved the public dual-call API:
  - `equals(self, that)`;
  - `equals(that)(self)`.
- Refreshed `standards/schema-first.inventory.jsonc`; live equivalence
  advisories are now zero.

## Finding

Both helpers were already structural comparisons over the schema fields, so
derived schema equivalence preserves the intended public behavior while making
the schema the comparison authority.

This is deliberately different from ordering helpers such as `isBefore`,
`isAfter`, and `Order`. Those encode chronological ordering semantics and
should stay outside the equivalence rule.

## Verification

```sh
cd packages/foundation/modeling/schema && bun run check
cd packages/foundation/modeling/schema && bun run beep:test -- LocalDate.test.ts
bun run beep lint schema-first
```

The live schema-first lint baseline after this wave is:

```text
[schema-first] live_entries=362
[schema-first] tracked_entries=362
[schema-first] missing_entries=0
[schema-first] stale_entries=0
[schema-first] sfv4_equivalence_advisories=0
```
