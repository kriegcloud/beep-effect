# P4 Wave 3 Arbitrary Remediation Batch (orchestrated)

Date: 2026-06-08

## Summary

Orchestrated triage + remediation of the 32 `SFV4-arbitrary-tests` advisory
candidates re-surfaced by the sync-codec matcher hardening
(`reviews/p2-arbitrary-tests-sync-codec-expansion.md`). A pipeline workflow ran
one triage agent per file, remediated the genuine candidates with a verified
non-flaky property test deriving from the existing source schema, and
adversarially verified each remediation. All inventory, doc, and commit work
was serialized by the operator afterward.

Triage outcome over the 32 candidates:

- **6 genuine** — remediated in this batch (below).
- **8 exception** — incidental JSON-boundary / CLI-behavior plumbing or
  meta-tests of schema combinators with only test-local schemas; reclassified
  as inventory exceptions in `reviews/p4-wave3-arbitrary-exceptions.md`.
- **18 defer** — genuine schema tests whose source schemas need a `toArbitrary`
  annotation first (filter-heavy regex/predicate brands, `instanceOf`
  declarations without an arbitrary, or transform precision). These stay as
  advisory candidates pending a source-schema annotation pass; see
  `reviews/p4-wave3-arbitrary-exceptions.md` for the list and risks.

## Remediations (6, all verified)

Each added one `it(...)` deriving data from `S.toArbitrary` of the existing
source schema and proving a round-trip law beside the existing fixtures. Every
remediation imports the real source schema (no weaker test-only schema was
introduced as the generation source); collection round-trips compare under
`S.toEquivalence(schema)` so unordered structures are not order-sensitive.

| File | Source schema | Law |
| --- | --- | --- |
| `semantic-web/test/CanonicalizationSecurity.test.ts` | `CanonicalizeDatasetRequest` | `encode(decode(encoded))` toEqual `encoded` |
| `schema/test/MutableHashMap.test.ts` | `MutableHashMap({ key: S.String, value: S.FiniteFromString })` | `decode(encode(x))` ≡ `x` under `S.toEquivalence` |
| `schema/test/MutableHashSet.test.ts` | `MutableHashSetFromSelf(S.String)` | `decode(encode(x))` ≡ `x` under `S.toEquivalence` |
| `drivers/wink/test/ToolValidation.test.ts` | `TverskySimilarity.successSchema` | `decode(encode(x))` toEqual `x` |
| `schema/test/Model.test.ts` | `Model.optionalOption(S.String)` (in a `Struct`) | `decode(encode(x))` toEqual `x` |
| `rdf/test/Rdf.test.ts` | `SemanticSchemaMetadata` | `decode(encode(x))` toEqual `x` |

## Verification

The operator re-ran every touched test from its package root (not trusting the
agents' self-reports):

```text
@beep/schema (MutableHashMap, MutableHashSet, Model)  -> 21 passed
@beep/rdf (Rdf)                                       -> 25 passed
@beep/semantic-web (CanonicalizationSecurity)         -> 5 passed
@beep/wink (ToolValidation)                           -> 8 passed
bun run beep lint schema-first --write                -> arbitrary-tests 32 -> 26
bun run beep lint schema-first                        -> exit 0, missing/stale 0
```

The 6 remediated inventory entries were removed as resolved. The workflow's
adversarial verify stage reported all 6 as real with no flagged remediations
and no reverts.
